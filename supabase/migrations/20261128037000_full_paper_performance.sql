create function public.full_paper_performance(p_user uuid)
returns table (
  id uuid, paper_code text, paper_variant text, score_units integer,
  max_units integer, finalized_at timestamptz
)
language sql stable security invoker set search_path = '' as $$
  with attempts as (
    select s.id,s.paper_code,s.paper_variant,r.score_units,r.max_units,r.finalized_at,
      row_number() over (partition by s.paper_code,s.paper_variant
                         order by r.finalized_at desc,s.id desc) as recent
    from public.chapter_simulations s
    join public.chapter_simulation_results r on r.simulation_id=s.id
    where s.user_id=p_user and s.mode='full'
  )
  select id,paper_code,paper_variant,score_units,max_units,finalized_at
  from attempts where recent <= 12
  order by finalized_at desc,id desc;
$$;
revoke all on function public.full_paper_performance(uuid) from public, anon, authenticated;
grant execute on function public.full_paper_performance(uuid) to service_role;
