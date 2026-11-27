alter table public.chapter_simulations
  drop constraint chapter_simulations_mode_check,
  drop constraint simulation_coverage_shape,
  drop constraint simulation_source_details_shape,
  add constraint chapter_simulations_mode_check check (mode in ('chapter','cumulative','full','pyq')),
  add constraint simulation_coverage_shape check (
    jsonb_typeof(coverage) = 'array' and (
      (mode = 'chapter' and chapter_path <> '' and coverage = '[]'::jsonb)
      or (mode = 'cumulative' and chapter_path = '' and jsonb_array_length(coverage) > 0)
      or (mode = 'full' and paper_code in (
        'Prelims-CSAT','Prelims-General-Studies-I',
        'Mains-General-Studies-I','Mains-General-Studies-II','Mains-General-Studies-III','Mains-General-Studies-IV'
      ) and chapter_path = '' and coverage = '[]'::jsonb)
      or (mode='pyq' and paper_code='Prelims-CSAT' and chapter_path='' and coverage='[]'::jsonb
          and source_details is not null and source_details->>'year'='2024'
          and source_details->>'series'='A')
    )
  ),
  add constraint simulation_source_details_shape check (
    source_details is null or (mode in ('full','pyq') and jsonb_typeof(source_details) = 'object')
  );

create function public.latest_historical_results(p_user uuid)
returns table (id uuid, paper_code text, score_units integer, max_units integer)
language sql stable security invoker set search_path = '' as $$
  select distinct on (s.paper_code) s.id,s.paper_code,r.score_units,r.max_units
    from public.chapter_simulations s join public.chapter_simulation_results r on r.simulation_id=s.id
   where s.user_id=p_user and s.mode='pyq'
   order by s.paper_code,r.finalized_at desc,s.id desc;
$$;
revoke all on function public.latest_historical_results(uuid) from public, anon, authenticated;
grant execute on function public.latest_historical_results(uuid) to service_role;
