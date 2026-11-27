create table public.chapter_simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  paper_code text not null,
  paper_variant text not null default '' check (paper_variant in ('','I','II')),
  chapter_path text not null,
  revision text not null check (revision ~ '^[a-f0-9]{64}$'),
  source_commit text not null check (source_commit ~ '^[a-f0-9]{40}$'),
  kind text not null check (kind in ('objective','descriptive')),
  status text not null default 'queued' check (status in (
    'queued','generating','generation-failed','ready','active','submitted',
    'extracting','review','evaluating','evaluation-failed','complete'
  )),
  generation_model text not null,
  evaluation_model text not null,
  questions jsonb check (jsonb_typeof(questions) = 'array'),
  duration_seconds integer check (duration_seconds > 0),
  remaining_ms integer check (remaining_ms >= 0),
  max_units integer check (max_units > 0),
  unit_scale integer not null check (unit_scale in (1,6)),
  answers jsonb not null default '{}' check (jsonb_typeof(answers) = 'object'),
  submitted_answers jsonb check (jsonb_typeof(submitted_answers) = 'object'),
  attachments jsonb not null default '{}' check (jsonb_typeof(attachments) = 'object'),
  extracted jsonb not null default '{}' check (jsonb_typeof(extracted) = 'object'),
  clarification jsonb,
  version integer not null default 0 check (version >= 0),
  job_token uuid not null default gen_random_uuid(),
  timezone text not null default 'UTC',
  lease_holder uuid,
  lease_since timestamptz,
  lease_until timestamptz,
  started_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, request_id),
  check (case when paper_code = 'Mains-Mathematics' then paper_variant in ('I','II') else paper_variant = '' end),
  check ((kind = 'objective') = (unit_scale = 6)),
  check (kind = 'objective' or (remaining_ms is null and lease_holder is null)),
  check ((lease_holder is null) = (lease_since is null) and (lease_holder is null) = (lease_until is null))
);

create unique index chapter_simulation_one_open on public.chapter_simulations
  (user_id,paper_code,paper_variant,chapter_path,revision)
  where status not in ('complete','generation-failed');
create index chapter_simulation_timer on public.chapter_simulations (lease_until)
  where status = 'active' and kind = 'objective' and lease_holder is not null;

create table public.chapter_simulation_guides (
  simulation_id uuid primary key references public.chapter_simulations(id) on delete cascade,
  guide jsonb not null check (jsonb_typeof(guide) = 'array')
);

create table public.chapter_simulation_results (
  simulation_id uuid primary key references public.chapter_simulations(id) on delete cascade,
  score_units integer not null,
  max_units integer not null check (max_units > 0),
  feedback jsonb not null check (jsonb_typeof(feedback) = 'object'),
  recommendations jsonb not null check (jsonb_typeof(recommendations) = 'array' and jsonb_array_length(recommendations) > 0),
  scheduled_for date,
  next_due date,
  finalized_at timestamptz not null default now(),
  check (score_units <= max_units)
);

create table public.chapter_simulation_refreshers (
  simulation_id uuid primary key references public.chapter_simulation_results(simulation_id) on delete cascade,
  completed boolean not null default false
);

create table public.chapter_simulation_revision_tasks (
  user_id uuid not null,
  paper_code text not null,
  paper_variant text not null default '' check (paper_variant in ('','I','II')),
  chapter_path text not null,
  revision text not null,
  due_on date not null,
  primary key (user_id,paper_code,paper_variant,chapter_path,revision),
  foreign key (user_id,paper_code,chapter_path,revision)
    references public.chapter_checkpoint_qualifications (user_id,paper_code,chapter_path,revision) on delete cascade,
  check (case when paper_code = 'Mains-Mathematics' then paper_variant in ('I','II') else paper_variant = '' end)
);

alter table public.chapter_simulation_revision_tasks enable row level security;
revoke all on public.chapter_simulation_revision_tasks from public, anon, authenticated;
grant select,insert,update on public.chapter_simulation_revision_tasks to service_role;

alter table public.chapter_simulations enable row level security;
alter table public.chapter_simulation_guides enable row level security;
alter table public.chapter_simulation_results enable row level security;
alter table public.chapter_simulation_refreshers enable row level security;
revoke all on public.chapter_simulations, public.chapter_simulation_guides, public.chapter_simulation_results,
  public.chapter_simulation_refreshers from public, anon, authenticated;
grant select,insert,update on public.chapter_simulations to service_role;
grant select,insert on public.chapter_simulation_guides, public.chapter_simulation_results,
  public.chapter_simulation_refreshers to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chapter-simulation-answers','chapter-simulation-answers',false,2097152,
  array['application/pdf','image/jpeg','image/png']);

create function public.publish_chapter_simulation(
  p_id uuid, p_token uuid, p_questions jsonb, p_guide jsonb, p_duration integer, p_max_units integer
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  simulation public.chapter_simulations%rowtype;
begin
  select * into simulation from public.chapter_simulations where id = p_id for update;
  if not found or simulation.job_token <> p_token or simulation.status <> 'generating' then return false; end if;
  if jsonb_array_length(p_questions) < 1 or jsonb_array_length(p_questions) <> jsonb_array_length(p_guide) then
    raise exception 'Question count does not match the marking guide';
  end if;
  insert into public.chapter_simulation_guides values (p_id,p_guide);
  update public.chapter_simulations set
    status = 'ready', questions = p_questions, duration_seconds = p_duration,
    remaining_ms = case when kind = 'objective' then p_duration * 1000 end,
    max_units = p_max_units
    where id = p_id;
  return true;
end;
$$;

create function public.update_chapter_simulation(
  p_user uuid, p_id uuid, p_tab uuid, p_action text, p_version integer,
  p_answers jsonb, p_question text, p_attachment jsonb, p_timezone text
)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  simulation public.chapter_simulations%rowtype;
  instant timestamptz;
  held boolean := false;
  error_code text;
  previous_file text;
  expires_at timestamptz;
begin
  select * into simulation from public.chapter_simulations
    where id = p_id and user_id = p_user for update;
  if not found then return null; end if;
  instant := clock_timestamp();

  -- Settle a lease before accepting answers. Network loss consumes only the
  -- remaining acknowledged lease, even if no requests arrive for hours.
  if simulation.status = 'active' and simulation.lease_holder is not null then
    expires_at := simulation.lease_since + simulation.remaining_ms * interval '1 millisecond';
    simulation.remaining_ms := greatest(0, simulation.remaining_ms - floor(extract(epoch from
      least(instant, simulation.lease_until) - simulation.lease_since) * 1000)::integer);
    simulation.lease_since := least(instant, simulation.lease_until);
    if simulation.remaining_ms = 0 then
      simulation.status := 'submitted';
      simulation.submitted_at := expires_at;
      simulation.submitted_answers := simulation.answers;
    end if;
    if instant >= simulation.lease_until or simulation.status = 'submitted' then
      simulation.lease_holder := null;
      simulation.lease_since := null;
      simulation.lease_until := null;
    end if;
  end if;

  if p_action = 'start' and simulation.status = 'ready' then
    simulation.status := 'active';
    simulation.started_at := instant;
    if exists (select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then
      simulation.timezone := p_timezone;
    end if;
  end if;

  if simulation.status = 'active' and simulation.kind = 'objective' then
    held := simulation.lease_holder is not null and simulation.lease_holder <> p_tab;
    if not held and p_tab is not null and p_action in ('pulse','save','submit') then
      simulation.lease_holder := p_tab;
      simulation.lease_since := instant;
      simulation.lease_until := instant + interval '15 seconds';
    end if;
  end if;

  if p_action in ('save','submit','attach','detach','confirm') then
    if held then
      error_code := 'other-tab';
    elsif simulation.version <> p_version then
      error_code := 'conflict';
    elsif simulation.status = 'review' and p_action = 'confirm' then
      simulation.answers := p_answers;
      simulation.version := simulation.version + 1;
      simulation.status := 'submitted';
      simulation.job_token := gen_random_uuid();
      simulation.clarification := null;
    elsif simulation.status = 'active' then
      if p_action in ('save','submit') then
        simulation.answers := p_answers;
        simulation.version := simulation.version + 1;
        if p_action = 'submit' then
          simulation.status := 'submitted';
          simulation.submitted_at := instant;
          simulation.submitted_answers := simulation.answers;
        end if;
      elsif simulation.kind = 'descriptive' and p_action in ('attach','detach') then
        previous_file := simulation.attachments -> p_question ->> 'path';
        simulation.attachments := case when p_action = 'attach'
          then jsonb_set(simulation.attachments,array[p_question],p_attachment)
          else simulation.attachments - p_question end;
        simulation.version := simulation.version + 1;
      end if;
    end if;
  end if;

  if simulation.status <> 'active' then
    simulation.lease_holder := null;
    simulation.lease_since := null;
    simulation.lease_until := null;
  end if;

  update public.chapter_simulations set
    status = simulation.status, answers = simulation.answers, attachments = simulation.attachments,
    submitted_answers = simulation.submitted_answers,
    version = simulation.version, timezone = simulation.timezone, lease_holder = simulation.lease_holder,
    job_token = simulation.job_token, clarification = simulation.clarification,
    lease_since = simulation.lease_since, lease_until = simulation.lease_until,
    remaining_ms = simulation.remaining_ms, started_at = simulation.started_at, submitted_at = simulation.submitted_at
    where id = p_id;
  return jsonb_build_object(
    'status',simulation.status,'answers',simulation.answers,'version',simulation.version,
    'remainingMs',simulation.remaining_ms,'held',held,'error',error_code,
    'leaseMs',case when not held and simulation.lease_until is not null then 15000 else 0 end,
    'jobToken',simulation.job_token,'previousFile',previous_file
  );
end;
$$;

create function public.expire_chapter_simulations()
returns table (id uuid, job_token uuid) language sql security invoker set search_path = '' as $$
  with expired as (
    update public.chapter_simulations s set status = 'submitted', submitted_answers = s.answers,
      remaining_ms = 0, submitted_at = least(s.lease_until, s.lease_since + s.remaining_ms * interval '1 millisecond'),
      lease_holder = null, lease_since = null, lease_until = null
    where s.kind = 'objective' and s.status = 'active' and s.lease_holder is not null
      and s.lease_since + s.remaining_ms * interval '1 millisecond' <= least(clock_timestamp(),s.lease_until)
    returning s.id,s.job_token
  )
  select e.id,e.job_token from expired e
  union all
  select s.id,s.job_token from public.chapter_simulations s
    where s.status = 'submitted'
  limit 100;
$$;

create function public.finalize_chapter_simulation(
  p_id uuid, p_token uuid, p_current_revision text, p_score_units integer, p_feedback jsonb, p_recommendations jsonb
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  simulation public.chapter_simulations%rowtype;
  actual_date date;
  previous_due date;
  next_due date;
  score numeric;
begin
  select * into simulation from public.chapter_simulations where id = p_id for update;
  if not found or simulation.job_token <> p_token or simulation.status <> 'evaluating' then return false; end if;
  if p_score_units > simulation.max_units or p_score_units <
    (case when simulation.kind = 'objective' then -(simulation.max_units/3) else 0 end) then
    raise exception 'Invalid score for chapter simulation';
  end if;

  if p_current_revision = simulation.revision and exists (
    select 1 from public.chapter_checkpoint_qualifications q
    where (q.user_id,q.paper_code,q.chapter_path,q.revision) =
      (simulation.user_id,simulation.paper_code,simulation.chapter_path,simulation.revision)
  ) then
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
        and r.next_due is not null
    ) then
      actual_date := (simulation.submitted_at at time zone simulation.timezone)::date;
      score := 100::numeric * p_score_units / simulation.max_units;
      next_due := actual_date + case
        when score < 40 then 1 when score < 60 then 2 when score < 75 then 4
        when score < 90 then 7 else 14 end;
      insert into public.chapter_simulation_revision_tasks (user_id,paper_code,paper_variant,chapter_path,revision,due_on)
        values (simulation.user_id,simulation.paper_code,simulation.paper_variant,simulation.chapter_path,simulation.revision,next_due)
        on conflict (user_id,paper_code,paper_variant,chapter_path,revision) do update set due_on = excluded.due_on;
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

revoke all on function public.publish_chapter_simulation(uuid,uuid,jsonb,jsonb,integer,integer),
  public.update_chapter_simulation(uuid,uuid,uuid,text,integer,jsonb,text,jsonb,text),
  public.expire_chapter_simulations(),
  public.finalize_chapter_simulation(uuid,uuid,text,integer,jsonb,jsonb)
  from public, anon, authenticated;
grant execute on function public.publish_chapter_simulation(uuid,uuid,jsonb,jsonb,integer,integer),
  public.update_chapter_simulation(uuid,uuid,uuid,text,integer,jsonb,text,jsonb,text),
  public.expire_chapter_simulations(),
  public.finalize_chapter_simulation(uuid,uuid,text,integer,jsonb,jsonb)
  to service_role;
