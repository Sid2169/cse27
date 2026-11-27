create function public.export_simulation_records(p_user uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with owned as (
    select s.* from public.chapter_simulations s where s.user_id = p_user
  )
  select jsonb_build_object(
    'simulations', coalesce((select jsonb_agg(to_jsonb(s)-'user_id') from owned s),'[]'::jsonb),
    'guides', coalesce((select jsonb_agg(to_jsonb(g)) from public.chapter_simulation_guides g join owned s on s.id=g.simulation_id),'[]'::jsonb),
    'results', coalesce((select jsonb_agg(to_jsonb(r)) from public.chapter_simulation_results r join owned s on s.id=r.simulation_id),'[]'::jsonb),
    'refreshers', coalesce((select jsonb_agg(to_jsonb(r)) from public.chapter_simulation_refreshers r join owned s on s.id=r.simulation_id),'[]'::jsonb),
    'batches', coalesce((select jsonb_agg(to_jsonb(b)) from public.cumulative_simulation_batches b join owned s on s.id=b.simulation_id),'[]'::jsonb),
    'revisionTasks', coalesce((select jsonb_agg(to_jsonb(t)-'user_id') from public.chapter_simulation_revision_tasks t where t.user_id=p_user),'[]'::jsonb),
    'revisionPreferences', coalesce((select jsonb_agg(to_jsonb(p)-'user_id') from public.chapter_revision_preferences p where p.user_id=p_user),'[]'::jsonb),
    'revisionHistory', coalesce((select jsonb_agg(to_jsonb(h)-'user_id') from public.chapter_revision_task_history h where h.user_id=p_user),'[]'::jsonb)
  );
$$;
revoke all on function public.export_simulation_records(uuid) from public, anon, authenticated;
grant execute on function public.export_simulation_records(uuid) to service_role;
