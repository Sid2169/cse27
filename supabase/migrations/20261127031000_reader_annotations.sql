create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chapter_path text not null check (length(chapter_path) between 1 and 260),
  source_commit text not null check (source_commit ~ '^[a-f0-9]{40}$'),
  anchor jsonb not null check (
    jsonb_typeof(anchor) = 'object' and anchor ?& array['version','path','heading','blob'] and
    anchor->'version' = '1'::jsonb and jsonb_typeof(anchor->'path') = 'string' and
    jsonb_typeof(anchor->'heading') = 'string' and length(anchor->>'heading') <= 500 and
    jsonb_typeof(anchor->'blob') = 'string' and anchor->>'blob' ~ '^[a-f0-9]{64}$' and length(anchor->>'path') between 1 and 260
  ),
  check (chapter_path = regexp_replace(anchor->>'path', '-part-[0-9]+\.md$', '.md')),
  kind text not null check (kind in ('note', 'highlight')),
  body text not null default '' check (length(body) <= 8000),
  check (kind <> 'note' or length(btrim(body)) > 0),
  check (kind <> 'highlight' or (
    anchor ? 'quote' and jsonb_typeof(anchor->'quote') = 'string' and
    length(anchor->>'quote') between 1 and 2000 and
    anchor ?& array['prefix','suffix'] and jsonb_typeof(anchor->'prefix') = 'string' and
    jsonb_typeof(anchor->'suffix') = 'string' and
    length(anchor->>'prefix') <= 160 and length(anchor->>'suffix') <= 160
  )),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index annotations_owner_chapter on public.annotations (user_id, chapter_path, updated_at desc);
alter table public.annotations enable row level security;
revoke all on public.annotations from public, anon, authenticated;
grant select, delete on public.annotations to authenticated;
grant insert (chapter_path, source_commit, anchor, kind, body), update (body) on public.annotations to authenticated;
create policy owner_reader_annotations on public.annotations for all to authenticated
  using ((select auth.uid()) = user_id and (select reader_private.is_owner()))
  with check ((select auth.uid()) = user_id and (select reader_private.is_owner()));
create trigger bump_reader_annotation_version before update on public.annotations
for each row execute function reader_private.bump_bookmark_version();
