-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- for https://cbhuczhttyxhhtnmyucc.supabase.co.
--
-- Creates a `profiles` table linked 1:1 to Supabase Auth users, with row
-- level security so each person can only read/write their own row. This
-- table only tracks account identity (email + display name); the app's
-- roommate-matching data continues to live in data/users.json via the
-- existing Cloudflare Worker.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profiles row whenever someone signs up, so the row exists
-- even if the client never gets a chance to insert one (e.g. email
-- confirmation is required and there's no session yet at sign-up time).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
