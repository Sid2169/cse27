alter table public.chapter_simulations
  add column mode text not null default 'chapter' check (mode in ('chapter', 'cumulative')),
  add column coverage jsonb not null default '[]'::jsonb,
  add constraint simulation_coverage_shape check (
    jsonb_typeof(coverage) = 'array'
    and (case when mode = 'cumulative' then chapter_path = '' and jsonb_array_length(coverage) > 0
              else chapter_path <> '' and jsonb_array_length(coverage) = 0 end)
  );

create table public.cumulative_simulation_batches (
  simulation_id uuid not null references public.chapter_simulations(id) on delete cascade,
  position integer not null check (position >= 0),
  blueprint jsonb not null check (jsonb_typeof(blueprint) = 'object'),
  primary key (simulation_id, position)
);
alter table public.cumulative_simulation_batches enable row level security;
revoke all on public.cumulative_simulation_batches from public, anon, authenticated;
grant select, insert, update, delete on public.cumulative_simulation_batches to service_role;

create function public.latest_cumulative_results(p_user uuid)
returns table (id uuid, paper_code text, paper_variant text, score_units integer, max_units integer)
language sql stable security invoker set search_path = '' as $$
  select distinct on (s.paper_code, s.paper_variant)
    s.id, s.paper_code, s.paper_variant, r.score_units, r.max_units
  from public.chapter_simulations s
  join public.chapter_simulation_results r on r.simulation_id = s.id
  where s.user_id = p_user and s.mode = 'cumulative'
  order by s.paper_code, s.paper_variant, r.finalized_at desc, s.id desc;
$$;
revoke all on function public.latest_cumulative_results(uuid) from public, anon, authenticated;
grant execute on function public.latest_cumulative_results(uuid) to service_role;
