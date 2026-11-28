create function public.dashboard_assessment_work(p_user uuid)
returns table (
  id uuid, paper_code text, paper_variant text, chapter_path text,
  mode text, status text, created_at timestamptz, work text
)
language sql stable security invoker set search_path = '' as $$
  select * from (
    select s.id,s.paper_code,s.paper_variant,s.chapter_path,s.mode,s.status,s.created_at,'exam'::text as work
    from public.chapter_simulations s
    where s.user_id=p_user and s.status <> 'complete'
    order by s.created_at desc,s.id desc
    limit 8
  ) exams
  union all
  select * from (
    select s.id,s.paper_code,s.paper_variant,s.chapter_path,s.mode,s.status,r.finalized_at,'refresher'::text
    from public.chapter_simulations s
    join public.chapter_simulation_results r on r.simulation_id=s.id
    join public.chapter_simulation_refreshers f on f.simulation_id=s.id
    where s.user_id=p_user and s.status='complete' and not f.completed
    order by r.finalized_at desc,s.id desc
    limit 8
  ) refreshers;
$$;
revoke all on function public.dashboard_assessment_work(uuid) from public, anon, authenticated;
grant execute on function public.dashboard_assessment_work(uuid) to service_role;
