-- Run this once in the Supabase SQL editor, after contact_requests.sql.
--
-- Adds blocking (real enforcement: messaging and contact requests between a
-- blocked pair are rejected at the RLS/insert-policy level) and a minimal
-- report table for manual review.

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (blocker_id <> blocked_id),
  unique (blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

drop policy if exists "Either side of a block can see it" on public.blocks;
create policy "Either side of a block can see it"
  on public.blocks for select
  using (auth.uid() = blocker_id or auth.uid() = blocked_id);

drop policy if exists "Users can create blocks as themselves" on public.blocks;
create policy "Users can create blocks as themselves"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

drop policy if exists "Users can remove their own blocks" on public.blocks;
create policy "Users can remove their own blocks"
  on public.blocks for delete
  using (auth.uid() = blocker_id);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reported_id uuid not null references auth.users (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

alter table public.reports enable row level security;

drop policy if exists "Users can file reports as themselves" on public.reports;
create policy "Users can file reports as themselves"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "Users can see their own filed reports" on public.reports;
create policy "Users can see their own filed reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- Block a pair and messaging between them is rejected server-side, not just
-- hidden client-side.
drop policy if exists "Users can send messages as themselves" on public.messages;
create policy "Users can send messages as themselves"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and not exists (
      select 1 from public.blocks
      where (blocker_id = sender_id and blocked_id = recipient_id)
         or (blocker_id = recipient_id and blocked_id = sender_id)
    )
  );

drop policy if exists "Users can create requests as themselves" on public.contact_requests;
create policy "Users can create requests as themselves"
  on public.contact_requests for insert
  with check (
    auth.uid() = requester_id
    and not exists (
      select 1 from public.blocks
      where (blocker_id = requester_id and blocked_id = owner_id)
         or (blocker_id = owner_id and blocked_id = requester_id)
    )
  );

-- A block also revokes any contact access approved before the block existed.
create or replace function public.get_contact_value(owner_id uuid, field text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if field not in ('email', 'phone') then
    raise exception 'invalid field: %', field;
  end if;

  if exists (
    select 1 from public.blocks
    where (blocker_id = auth.uid() and blocked_id = get_contact_value.owner_id)
       or (blocker_id = get_contact_value.owner_id and blocked_id = auth.uid())
  ) then
    return null;
  end if;

  if auth.uid() <> owner_id and not exists (
    select 1 from public.contact_requests
    where requester_id = auth.uid()
      and contact_requests.owner_id = get_contact_value.owner_id
      and contact_requests.field = get_contact_value.field
      and status = 'approved'
  ) then
    return null;
  end if;

  if field = 'email' then
    return (select email from public.profiles where id = owner_id);
  else
    return (select phone from public.profiles where id = owner_id);
  end if;
end;
$$;

grant execute on function public.get_contact_value(uuid, text) to authenticated;
