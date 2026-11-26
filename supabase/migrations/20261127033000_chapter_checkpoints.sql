create table public.chapter_checkpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paper_code text not null,
  chapter_path text not null,
  sequence integer not null check (sequence > 0),
  revision text not null check (revision ~ '^[a-f0-9]{64}$'),
  source_commit text not null check (source_commit ~ '^[a-f0-9]{40}$'),
  model text not null,
  questions jsonb not null check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) > 0),
  created_at timestamptz not null default now(),
  unique (user_id, paper_code, chapter_path, sequence)
);

create table public.chapter_checkpoint_keys (
  checkpoint_id uuid primary key references public.chapter_checkpoints(id) on delete cascade,
  answers jsonb not null check (jsonb_typeof(answers) = 'array')
);

create table public.chapter_checkpoint_results (
  checkpoint_id uuid primary key references public.chapter_checkpoints(id) on delete cascade,
  responses jsonb not null check (jsonb_typeof(responses) = 'array'),
  correct integer not null check (correct >= 0),
  wrong integer not null check (wrong >= 0),
  blank integer not null check (blank >= 0),
  excluded integer not null check (excluded >= 0),
  qualified boolean not null,
  finalized_at timestamptz not null default now(),
  check (not qualified or (correct + wrong + blank > 0 and 5::bigint * correct >= 4::bigint * (correct + wrong + blank)))
);

create table public.chapter_checkpoint_qualifications (
  user_id uuid not null references auth.users(id) on delete cascade,
  paper_code text not null,
  chapter_path text not null,
  revision text not null,
  checkpoint_id uuid not null unique references public.chapter_checkpoint_results(checkpoint_id),
  qualified_at timestamptz not null default now(),
  primary key (user_id, paper_code, chapter_path, revision)
);

alter table public.chapter_checkpoints enable row level security;
alter table public.chapter_checkpoint_keys enable row level security;
alter table public.chapter_checkpoint_results enable row level security;
alter table public.chapter_checkpoint_qualifications enable row level security;
revoke all on public.chapter_checkpoints, public.chapter_checkpoint_keys,
  public.chapter_checkpoint_results, public.chapter_checkpoint_qualifications from public, anon, authenticated;
grant select, insert on public.chapter_checkpoints, public.chapter_checkpoint_keys,
  public.chapter_checkpoint_results, public.chapter_checkpoint_qualifications to service_role;

create function public.record_chapter_checkpoint(
  p_user_id uuid,
  p_paper_code text,
  p_chapter_path text,
  p_revision text,
  p_source_commit text,
  p_model text,
  p_questions jsonb,
  p_answers jsonb
)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  checkpoint_id uuid;
  next_sequence integer;
begin
  if jsonb_array_length(p_questions) is distinct from jsonb_array_length(p_answers) then
    raise exception 'Question count does not match checkpoint key';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(
    concat_ws(':', p_user_id::text, p_paper_code, p_chapter_path), 0));
  select coalesce(max(sequence), 0) + 1 into next_sequence
  from public.chapter_checkpoints
  where user_id = p_user_id and paper_code = p_paper_code and chapter_path = p_chapter_path;
  insert into public.chapter_checkpoints (user_id,paper_code,chapter_path,sequence,revision,source_commit,model,questions)
    values (p_user_id,p_paper_code,p_chapter_path,next_sequence,p_revision,p_source_commit,p_model,p_questions)
    returning id into checkpoint_id;
  insert into public.chapter_checkpoint_keys values (checkpoint_id,p_answers);
  return checkpoint_id;
end;
$$;
revoke all on function public.record_chapter_checkpoint(uuid,text,text,text,text,text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.record_chapter_checkpoint(uuid,text,text,text,text,text,jsonb,jsonb) to service_role;
