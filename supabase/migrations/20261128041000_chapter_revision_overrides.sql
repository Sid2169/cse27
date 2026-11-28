alter table public.chapter_revision_preferences
  add column chapter_overrides jsonb not null default '{}'::jsonb
    check (jsonb_typeof(chapter_overrides)='object');
alter table public.chapter_revision_task_history
  add column settings jsonb check (settings is null or jsonb_typeof(settings)='object');

create or replace function public.apply_initial_revision_preferences()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  prefs public.chapter_revision_preferences%rowtype;
  qualified timestamptz;
  target date;
begin
  perform pg_advisory_xact_lock(hashtextextended('revision-preferences:' || new.user_id::text,0));
  select * into prefs from public.chapter_revision_preferences where user_id=new.user_id;
  if found then
    target := coalesce((prefs.chapter_overrides->(new.paper_code || ':' || new.chapter_path)->>'target')::date,
      case when new.paper_code like 'Prelims-%' then prefs.prelims_target else prefs.mains_target end);
    select q.qualified_at into qualified from public.chapter_checkpoint_qualifications q
      where (q.user_id,q.paper_code,q.chapter_path,q.revision) =
        (new.user_id,new.paper_code,new.chapter_path,new.revision);
    new.due_on := public.initial_chapter_revision_due((qualified at time zone prefs.timezone)::date,target);
  end if;
  return new;
end;
$$;

create or replace function public.save_chapter_revision_preferences(
  p_user uuid, p_timezone text, p_material text, p_difficulty text, p_priority text,
  p_prelims date, p_mains date
)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names zone where zone.name = p_timezone) then
    raise exception 'Invalid time zone';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('revision-preferences:' || p_user::text,0));
  insert into public.chapter_revision_preferences
    (user_id,timezone,material,difficulty,priority,prelims_target,mains_target)
  values
    (p_user,p_timezone,p_material,p_difficulty,p_priority,p_prelims,p_mains)
  on conflict (user_id) do update set
    timezone = excluded.timezone, material = excluded.material,
    difficulty = excluded.difficulty, priority = excluded.priority,
    prelims_target = excluded.prelims_target, mains_target = excluded.mains_target;
  update public.checkpoint_revision_tasks t
     set due_on = public.initial_chapter_revision_due((q.qualified_at at time zone p_timezone)::date,
       coalesce((prefs.chapter_overrides->(t.paper_code || ':' || t.chapter_path)->>'target')::date,
         case when t.paper_code like 'Prelims-%' then p_prelims else p_mains end))
    from public.chapter_checkpoint_qualifications q
    join public.chapter_revision_preferences prefs on prefs.user_id=q.user_id
   where t.user_id=p_user and (t.user_id,t.paper_code,t.chapter_path,t.revision) =
     (q.user_id,q.paper_code,q.chapter_path,q.revision);
  -- Recompute from the most recent eligible exam rather than today.
  with latest as (
    select distinct on (s.paper_code, s.paper_variant, s.chapter_path, s.revision)
      s.paper_code, s.paper_variant,s.chapter_path,s.revision,
      (s.submitted_at at time zone p_timezone)::date as completed,
      100::numeric * r.score_units/r.max_units as score
    from public.chapter_simulations s
    join public.chapter_simulation_results r on r.simulation_id = s.id
    where s.user_id=p_user and s.mode='chapter'
    order by s.paper_code,s.paper_variant,s.chapter_path,s.revision,s.submitted_at desc,s.id desc
  ), dates as (
    select l.*,public.chapter_revision_due(score,completed,
      coalesce((opts.override->>'target')::date,
        case when l.paper_code like 'Prelims-%' then p_prelims else p_mains end),
      coalesce(opts.override->>'material',p_material),
      coalesce(opts.override->>'difficulty',p_difficulty),
      coalesce(opts.override->>'priority',p_priority)) as due
    from latest l
    join public.chapter_revision_preferences prefs on prefs.user_id=p_user
    cross join lateral (select prefs.chapter_overrides->(l.paper_code || ':' || l.chapter_path) as override) opts
  ), changed as (
    select t.user_id,t.paper_code,t.paper_variant,t.chapter_path,t.revision,
      t.due_on as original,t.schedule_state as original_state,d.due,d.completed
    from dates d join public.chapter_simulation_revision_tasks t using (paper_code,paper_variant,chapter_path,revision)
    where t.user_id=p_user and t.schedule_source='automatic' and
      (case when t.schedule_state='pending' then t.due_on end) is distinct from d.due
  ), updated as (
    update public.chapter_simulation_revision_tasks t
      set due_on=coalesce(c.due,c.completed),
          schedule_state=case when c.due is null then 'unscheduled' else 'pending' end
     from changed c
     where (t.user_id,t.paper_code,t.paper_variant,t.chapter_path,t.revision) =
       (c.user_id,c.paper_code,c.paper_variant,c.chapter_path,c.revision)
     returning c.*
  )
  insert into public.chapter_revision_task_history
    (user_id,paper_code,paper_variant,chapter_path,revision,previous_due,next_due,reason)
  select user_id,paper_code,paper_variant,chapter_path,revision,
    case when original_state='pending' then original end,due,'preferences'
  from updated;
end;
$$;

create or replace function public.finalize_chapter_simulation(
  p_id uuid, p_token uuid, p_current_revision text, p_score_units integer, p_feedback jsonb, p_recommendations jsonb
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  simulation public.chapter_simulations%rowtype;
  actual_date date;
  previous_due date;
  next_due date;
  score numeric;
  task_state text;
  task_source text;
  prefs public.chapter_revision_preferences%rowtype;
  options jsonb;
  effective_target date;
  effective_material text;
  effective_difficulty text;
  effective_priority text;
begin
  select * into simulation from public.chapter_simulations where id = p_id for update;
  if not found or simulation.job_token <> p_token or simulation.status <> 'evaluating' then return false; end if;
  if p_score_units > simulation.max_units or p_score_units <
    (case when simulation.kind = 'objective' then -(simulation.max_units/3) else 0 end) then
    raise exception 'Invalid score for chapter simulation';
  end if;

  if simulation.mode = 'chapter' and p_current_revision = simulation.revision and exists (
    select 1 from public.chapter_checkpoint_qualifications q
    where (q.user_id,q.paper_code,q.chapter_path,q.revision) =
      (simulation.user_id,simulation.paper_code,simulation.chapter_path,simulation.revision)
  ) then
    perform pg_advisory_xact_lock(hashtextextended('revision-preferences:' || simulation.user_id::text,0));
    select * into prefs from public.chapter_revision_preferences where user_id = simulation.user_id;
    -- Serialize submissions for this chapter and exam paper.
    perform pg_advisory_xact_lock(hashtextextended(concat_ws(':',simulation.user_id::text,
      simulation.paper_code,simulation.paper_variant,simulation.chapter_path,simulation.revision),0));
    select t.due_on,t.schedule_state,t.schedule_source into previous_due,task_state,task_source from public.chapter_simulation_revision_tasks t
      where (t.user_id,t.paper_code,t.paper_variant,t.chapter_path,t.revision) =
        (simulation.user_id,simulation.paper_code,simulation.paper_variant,simulation.chapter_path,simulation.revision);
    if previous_due is null then
      select t.due_on into previous_due from public.checkpoint_revision_tasks t
        where (t.user_id,t.paper_code,t.chapter_path,t.revision) =
          (simulation.user_id,simulation.paper_code,simulation.chapter_path,simulation.revision);
    end if;
    if (task_source is distinct from 'manual' or
      (task_state='pending' and simulation.scheduled_due = previous_due))
      and not exists (
      select 1 from public.chapter_simulation_results r
      join public.chapter_simulations s on s.id = r.simulation_id
      where (s.user_id,s.paper_code,s.paper_variant,s.chapter_path,s.revision) =
        (simulation.user_id,simulation.paper_code,simulation.paper_variant,simulation.chapter_path,simulation.revision)
        and (s.submitted_at,s.id) > (simulation.submitted_at,simulation.id)
        and s.mode = 'chapter'
    ) then
      actual_date := (simulation.submitted_at at time zone coalesce(prefs.timezone,simulation.timezone))::date;
      score := 100::numeric * p_score_units / simulation.max_units;
      options := prefs.chapter_overrides->(simulation.paper_code || ':' || simulation.chapter_path);
      effective_target := coalesce((options->>'target')::date,
        case when simulation.paper_code like 'Prelims-%' then prefs.prelims_target else prefs.mains_target end);
      effective_material := coalesce(options->>'material',prefs.material,'generic');
      effective_difficulty := coalesce(options->>'difficulty',prefs.difficulty,'medium');
      effective_priority := coalesce(options->>'priority',prefs.priority,'unsure');
      next_due := public.chapter_revision_due(score,actual_date,effective_target,
        effective_material,effective_difficulty,effective_priority);
      insert into public.chapter_simulation_revision_tasks
        (user_id,paper_code,paper_variant,chapter_path,revision,due_on,schedule_state)
      values (simulation.user_id,simulation.paper_code,simulation.paper_variant,simulation.chapter_path,
        simulation.revision,coalesce(next_due,actual_date),case when next_due is null then 'unscheduled' else 'pending' end)
      on conflict (user_id,paper_code,paper_variant,chapter_path,revision)
        do update set due_on = excluded.due_on, schedule_state = excluded.schedule_state,
          schedule_source = 'automatic';
      insert into public.chapter_revision_task_history
        (user_id,paper_code,paper_variant,chapter_path,revision,previous_due,next_due,reason,settings)
      values (simulation.user_id,simulation.paper_code,simulation.paper_variant,simulation.chapter_path,
        simulation.revision,case when task_state is distinct from 'unscheduled' then previous_due end,next_due,'exam',
        jsonb_build_object('policy_version',1,'material',effective_material,
          'difficulty',effective_difficulty,'priority',effective_priority,'target',effective_target,
          'completion_date',actual_date,'simulation_id',p_id));
    end if;
  end if;

  insert into public.chapter_simulation_results
    (simulation_id,score_units,max_units,feedback,recommendations,scheduled_for,next_due)
    values (p_id,p_score_units,simulation.max_units,p_feedback,p_recommendations,previous_due,next_due);
  insert into public.chapter_simulation_refreshers (simulation_id) values (p_id);
  update public.chapter_simulations set status = 'complete' where id = p_id;
  return true;
end;
$$;


create function public.save_chapter_schedule_override(
  p_user uuid, p_paper text, p_chapter text, p_revision text,
  p_material text, p_difficulty text, p_priority text, p_target date
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  pref public.chapter_revision_preferences%rowtype;
  settings jsonb;
  chapter_key text := p_paper || ':' || p_chapter;
begin
  if (p_material is not null and p_material not in ('generic','factual','conceptual','procedural'))
    or (p_difficulty is not null and p_difficulty not in ('easy','medium','hard'))
    or (p_priority is not null and p_priority not in ('high','unsure','low')) then
    raise exception 'Invalid chapter settings';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('revision-preferences:' || p_user::text,0));
  if not exists (
    select 1 from public.chapter_checkpoint_qualifications q
      where (q.user_id,q.paper_code,q.chapter_path,q.revision)=(p_user,p_paper,p_chapter,p_revision)
  ) then return false; end if;
  insert into public.chapter_revision_preferences (user_id,timezone,material,difficulty,priority)
    values (p_user,'Asia/Kolkata','generic','medium','unsure') on conflict (user_id) do nothing;
  settings := jsonb_strip_nulls(jsonb_build_object(
    'material',p_material,'difficulty',p_difficulty,'priority',p_priority,'target',p_target));
  update public.chapter_revision_preferences
    set chapter_overrides = case when settings='{}'::jsonb
      then chapter_overrides-chapter_key
      else jsonb_set(chapter_overrides,array[chapter_key],settings) end
    where user_id=p_user
    returning * into pref;
  perform public.save_chapter_revision_preferences(p_user,pref.timezone,pref.material,
    pref.difficulty,pref.priority,pref.prelims_target,pref.mains_target);
  return true;
end;
$$;

revoke all on function public.save_chapter_schedule_override(uuid,text,text,text,text,text,text,date)
  from public, anon, authenticated;
grant execute on function public.save_chapter_schedule_override(uuid,text,text,text,text,text,text,date)
  to service_role;
