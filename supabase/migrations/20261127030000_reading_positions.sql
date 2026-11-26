create table public.reading_positions (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chapter_path text not null check (length(chapter_path) between 1 and 260),
  source_commit text not null check (source_commit ~ '^[a-f0-9]{40}$'),
  anchor jsonb not null check (
    jsonb_typeof(anchor) = 'object' and anchor ?& array['version','path','heading','blob'] and
    anchor->'version' = '1'::jsonb and jsonb_typeof(anchor->'path') = 'string' and
    jsonb_typeof(anchor->'heading') = 'string' and length(anchor->>'heading') <= 500 and
    jsonb_typeof(anchor->'blob') = 'string' and anchor->>'blob' ~ '^[a-f0-9]{64}$' and
    length(anchor->>'path') between 1 and 260
  ),
  check (chapter_path = regexp_replace(anchor->>'path', '-part-[0-9]+\.md$', '.md')),
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, chapter_path)
);
create index reading_positions_owner_updated on public.reading_positions (user_id, updated_at desc);
alter table public.reading_positions enable row level security;
revoke all on public.reading_positions from public, anon, authenticated;
grant select on public.reading_positions to authenticated;
grant insert (chapter_path, source_commit, anchor), update (source_commit, anchor) on public.reading_positions to authenticated;
create policy owner_reading_positions on public.reading_positions for all to authenticated
  using ((select auth.uid()) = user_id and (select reader_private.is_owner()))
  with check ((select auth.uid()) = user_id and (select reader_private.is_owner()));
create trigger bump_reading_position_version before update on public.reading_positions
for each row execute function reader_private.bump_bookmark_version();
