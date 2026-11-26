create table public.reading_preferences (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  theme text not null check (theme in ('system', 'light', 'dark')),
  text_size smallint not null check (text_size between 16 and 28),
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now()
);
alter table public.reading_preferences enable row level security;
revoke all on public.reading_preferences from public, anon, authenticated;
grant select on public.reading_preferences to authenticated;
grant insert (theme,text_size), update (theme,text_size) on public.reading_preferences to authenticated;
create policy owner_reading_preferences on public.reading_preferences for all to authenticated
  using ((select auth.uid()) = user_id and (select reader_private.is_owner()))
  with check ((select auth.uid()) = user_id and (select reader_private.is_owner()));
create trigger bump_reading_preference_version before update on public.reading_preferences
for each row execute function reader_private.bump_bookmark_version();
