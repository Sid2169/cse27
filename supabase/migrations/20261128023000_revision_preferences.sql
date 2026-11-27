create table public.chapter_revision_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null,
  material text not null check (material in ('generic','factual','conceptual','procedural')),
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  priority text not null check (priority in ('high','unsure','low')),
  prelims_target date,
  mains_target date
);

alter table public.chapter_revision_preferences enable row level security;
revoke all on public.chapter_revision_preferences from public, anon, authenticated;
grant select,insert,update on public.chapter_revision_preferences to service_role;

alter table public.chapter_simulation_revision_tasks
  add column schedule_state text not null default 'pending'
    check (schedule_state in ('pending','unscheduled'));

create function public.chapter_revision_due(
  p_score numeric, p_completed date, p_target date, p_material text, p_difficulty text, p_priority text
)
returns date language sql immutable security invoker set search_path = '' as $$
  with factors as (
    select
      case when p_score < 40 then 1 when p_score < 60 then 2 when p_score < 75 then 4
           when p_score < 90 then 7 else 14 end as days,
      case p_material when 'conceptual' then 0.90 when 'procedural' then 0.85 else 1 end as material,
      case p_difficulty when 'easy' then 1.15 when 'hard' then 0.80 else 1 end as difficulty,
      case p_priority when 'high' then 0.80 when 'low' then 1.10 else 1 end as priority,
      case when p_target > p_completed
           then greatest(0.75,least(2,sqrt((p_target - p_completed)::numeric / 30)))
           else 1 end as horizon
  )
  select case
    when p_target = p_completed + 1 then null
    when p_target > p_completed then least(p_target - 1, candidate)
    else candidate end
  from factors
  cross join lateral (
    select p_completed + greatest(1,least(60,round(days * greatest(0.5,least(2,material*difficulty*priority*horizon)))::integer)) as candidate
  ) date_choice;
$$;

revoke all on function public.chapter_revision_due(numeric,date,date,text,text,text) from public, anon, authenticated;
grant execute on function public.chapter_revision_due(numeric,date,date,text,text,text) to service_role;

create function public.initial_chapter_revision_due(p_completed date, p_target date)
returns date language sql immutable security invoker set search_path = '' as $$
  select case when p_target > p_completed then least(p_completed + 1, p_target - 1)
              else p_completed + 1 end;
$$;
revoke all on function public.initial_chapter_revision_due(date,date) from public, anon, authenticated;
grant execute on function public.initial_chapter_revision_due(date,date) to service_role;
grant update (due_on) on public.checkpoint_revision_tasks to service_role;

create function public.apply_initial_revision_preferences()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  prefs public.chapter_revision_preferences%rowtype;
  qualified timestamptz;
begin
  perform pg_advisory_xact_lock(hashtextextended('revision-preferences:' || new.user_id::text,0));
  select * into prefs from public.chapter_revision_preferences where user_id = new.user_id;
  if found then
    select q.qualified_at into qualified from public.chapter_checkpoint_qualifications q
    where (q.user_id,q.paper_code,q.chapter_path,q.revision) =
      (new.user_id,new.paper_code,new.chapter_path,new.revision);
    new.due_on := public.initial_chapter_revision_due((qualified at time zone prefs.timezone)::date,
      case when new.paper_code like 'Prelims-%' then prefs.prelims_target else prefs.mains_target end);
  end if;
  return new;
end;
$$;
revoke all on function public.apply_initial_revision_preferences() from public, anon, authenticated;
grant execute on function public.apply_initial_revision_preferences() to service_role;
create trigger apply_initial_revision_preferences before insert on public.checkpoint_revision_tasks
for each row execute function public.apply_initial_revision_preferences();

create function public.save_chapter_revision_preferences(
  p_user uuid, p_timezone text, p_material text, p_difficulty text, p_priority text,
  p_prelims date, p_mains date
)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names zone where zone.name = p_timezone) then
    raise exception 'Invalid time zone';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('revision-preferences:' || p_user::text,0));
  insert into public.chapter_revision_preferences values
    (p_user,p_timezone,p_material,p_difficulty,p_priority,p_prelims,p_mains)
  on conflict (user_id) do update set
    timezone = excluded.timezone, material = excluded.material,
    difficulty = excluded.difficulty, priority = excluded.priority,
    prelims_target = excluded.prelims_target, mains_target = excluded.mains_target;
  update public.checkpoint_revision_tasks t
     set due_on = public.initial_chapter_revision_due((q.qualified_at at time zone p_timezone)::date,
       case when t.paper_code like 'Prelims-%' then p_prelims else p_mains end)
    from public.chapter_checkpoint_qualifications q
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
      case when l.paper_code like 'Prelims-%' then p_prelims else p_mains end,
      p_material,p_difficulty,p_priority) as due
    from latest l
  )
  update public.chapter_simulation_revision_tasks t
     set due_on=coalesce(d.due,d.completed),
         schedule_state=case when d.due is null then 'unscheduled' else 'pending' end
    from dates d
   where t.user_id=p_user and
     (t.paper_code,t.paper_variant,t.chapter_path,t.revision) =
     (d.paper_code,d.paper_variant,d.chapter_path,d.revision);
end;
$$;

revoke all on function public.save_chapter_revision_preferences(uuid,text,text,text,text,date,date) from public, anon, authenticated;
grant execute on function public.save_chapter_revision_preferences(uuid,text,text,text,text,date,date) to service_role;

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
  prefs public.chapter_revision_preferences%rowtype;
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
    select t.due_on into previous_due from public.chapter_simulation_revision_tasks t
      where (t.user_id,t.paper_code,t.paper_variant,t.chapter_path,t.revision) =
        (simulation.user_id,simulation.paper_code,simulation.paper_variant,simulation.chapter_path,simulation.revision);
    if previous_due is null then
      select t.due_on into previous_due from public.checkpoint_revision_tasks t
        where (t.user_id,t.paper_code,t.chapter_path,t.revision) =
          (simulation.user_id,simulation.paper_code,simulation.chapter_path,simulation.revision);
    end if;
    if not exists (
      select 1 from public.chapter_simulation_results r
      join public.chapter_simulations s on s.id = r.simulation_id
      where (s.user_id,s.paper_code,s.paper_variant,s.chapter_path,s.revision) =
        (simulation.user_id,simulation.paper_code,simulation.paper_variant,simulation.chapter_path,simulation.revision)
        and (s.submitted_at,s.id) > (simulation.submitted_at,simulation.id)
        and s.mode = 'chapter'
    ) then
      actual_date := (simulation.submitted_at at time zone coalesce(prefs.timezone,simulation.timezone))::date;
      score := 100::numeric * p_score_units / simulation.max_units;
      next_due := public.chapter_revision_due(score,actual_date,
        case when simulation.paper_code like 'Prelims-%' then prefs.prelims_target else prefs.mains_target end,
        prefs.material,prefs.difficulty,prefs.priority);
      insert into public.chapter_simulation_revision_tasks
        (user_id,paper_code,paper_variant,chapter_path,revision,due_on,schedule_state)
      values (simulation.user_id,simulation.paper_code,simulation.paper_variant,simulation.chapter_path,
        simulation.revision,coalesce(next_due,actual_date),case when next_due is null then 'unscheduled' else 'pending' end)
      on conflict (user_id,paper_code,paper_variant,chapter_path,revision)
        do update set due_on = excluded.due_on, schedule_state = excluded.schedule_state;
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
