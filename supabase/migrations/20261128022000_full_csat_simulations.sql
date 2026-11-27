alter table public.chapter_simulations
  drop constraint chapter_simulations_mode_check,
  drop constraint simulation_coverage_shape,
  add constraint chapter_simulations_mode_check check (mode in ('chapter','cumulative','full')),
  add constraint simulation_coverage_shape check (
    jsonb_typeof(coverage) = 'array' and (
      (mode = 'chapter' and chapter_path <> '' and coverage = '[]'::jsonb)
      or (mode = 'cumulative' and chapter_path = '' and jsonb_array_length(coverage) > 0)
      or (mode = 'full' and paper_code = 'Prelims-CSAT' and chapter_path = '' and coverage = '[]'::jsonb)
    )
  );

create function public.full_simulation_results(p_user uuid)
returns table (id uuid, paper_code text, score_units integer, max_units integer, finalized_at timestamptz)
language sql stable security invoker set search_path = '' as $$
  select s.id, s.paper_code, r.score_units, r.max_units, r.finalized_at
  from public.chapter_simulations s
  join public.chapter_simulation_results r on r.simulation_id = s.id
  where s.user_id = p_user and s.mode = 'full'
  order by r.finalized_at desc, s.id desc;
$$;
revoke all on function public.full_simulation_results(uuid) from public, anon, authenticated;
grant execute on function public.full_simulation_results(uuid) to service_role;
