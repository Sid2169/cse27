grant update (anchor) on public.annotations to authenticated;
alter table public.annotations add constraint annotation_highlight_color
  check (not (anchor ? 'color') or
    (kind = 'highlight' and jsonb_typeof(anchor->'color') = 'string'
      and anchor->>'color' in ('yellow', 'green', 'blue', 'pink')));
