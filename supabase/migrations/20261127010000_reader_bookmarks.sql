create schema if not exists reader_private;
revoke all on schema reader_private from public;
create table reader_private.owners (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create function reader_private.is_owner() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from reader_private.owners where user_id = auth.uid()) $$;
revoke all on function reader_private.is_owner() from public;
grant execute on function reader_private.is_owner() to authenticated;

create table public.bookmarks (
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
  label text not null default '' check (length(label) <= 160),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bookmarks_owner_updated on public.bookmarks (user_id, updated_at desc);
alter table public.bookmarks enable row level security;
revoke all on public.bookmarks from public, anon, authenticated;
grant select, delete on public.bookmarks to authenticated;
grant insert (chapter_path, source_commit, anchor, label), update (label) on public.bookmarks to authenticated;
create policy owner_bookmarks on public.bookmarks for all to authenticated
  using ((select auth.uid()) = user_id and (select reader_private.is_owner()))
  with check ((select auth.uid()) = user_id and (select reader_private.is_owner()));

create function reader_private.bump_bookmark_version() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end;
$$;
create trigger bump_bookmark_version before update on public.bookmarks
for each row execute function reader_private.bump_bookmark_version();
