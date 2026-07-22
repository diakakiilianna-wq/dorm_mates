-- Run this once in the Supabase SQL editor, after messages_read_delete.sql.
--
-- Adds a gated "request email / request phone" flow. Real email and phone
-- values never leave the database except through the two RPCs below, so the
-- approve/deny gate is enforced server-side, not just hidden in the UI.

alter table public.profiles add column if not exists phone text;

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  field text not null check (field in ('email', 'phone')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> owner_id)
);

-- Only one *pending* request per (requester, owner, field) at a time — you
-- can still re-request after a decline, since that row is no longer pending.
create unique index if not exists contact_requests_pending_unique
  on public.contact_requests (requester_id, owner_id, field)
  where status = 'pending';

create index if not exists contact_requests_owner_idx on public.contact_requests (owner_id, status);
create index if not exists contact_requests_requester_idx on public.contact_requests (requester_id);

alter table public.contact_requests enable row level security;

drop policy if exists "Participants can view their own requests" on public.contact_requests;
create policy "Participants can view their own requests"
  on public.contact_requests for select
  using (auth.uid() = requester_id or auth.uid() = owner_id);

drop policy if exists "Users can create requests as themselves" on public.contact_requests;
create policy "Users can create requests as themselves"
  on public.contact_requests for insert
  with check (auth.uid() = requester_id);

-- No UPDATE policy — responding happens only through respond_to_contact_request,
-- so a requester can never flip their own request to "approved".

-- Returns a masked value ("j***@***.edu" / "•••• 4321") for anyone — this is
-- the only way another user's email/phone ever reaches the client before a
-- request is approved.
create or replace function public.get_masked_contact(owner_id uuid, field text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_phone text;
  v_local text;
  v_domain text;
  v_tld text;
begin
  if field not in ('email', 'phone') then
    raise exception 'invalid field: %', field;
  end if;

  if field = 'email' then
    select email into v_email from public.profiles where id = owner_id;
    if v_email is null then
      return null;
    end if;
    v_local := split_part(v_email, '@', 1);
    v_domain := split_part(v_email, '@', 2);
    v_tld := substring(v_domain from '\.[^.]+$');
    return left(v_local, 1) || '***@***' || coalesce(v_tld, '');
  else
    select phone into v_phone from public.profiles where id = owner_id;
    if v_phone is null or length(v_phone) = 0 then
      return null;
    end if;
    if length(v_phone) <= 4 then
      return repeat('•', length(v_phone));
    end if;
    return '•••• ' || right(v_phone, 4);
  end if;
end;
$$;

grant execute on function public.get_masked_contact(uuid, text) to authenticated;

-- Lets the client know whether to show a "Request phone number" button at
-- all, without leaking the value itself.
create or replace function public.has_contact_value(owner_id uuid, field text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if field not in ('email', 'phone') then
    raise exception 'invalid field: %', field;
  end if;
  if field = 'email' then
    return exists (select 1 from public.profiles where id = owner_id and email is not null and length(email) > 0);
  else
    return exists (select 1 from public.profiles where id = owner_id and phone is not null and length(phone) > 0);
  end if;
end;
$$;

grant execute on function public.has_contact_value(uuid, text) to authenticated;

-- Returns the real email or phone for `owner_id`, but only if the caller IS
-- owner_id, or has an approved contact_requests row for that field.
-- Returns null otherwise (not an error) so the client can treat "no access"
-- as a normal, expected state.
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

-- Owner approves/declines; only they can call this, and only on their own
-- pending requests.
create or replace function public.respond_to_contact_request(request_id uuid, approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.contact_requests
  set status = case when approve then 'approved' else 'declined' end,
      responded_at = now()
  where id = request_id
    and owner_id = auth.uid()
    and status = 'pending';
end;
$$;

grant execute on function public.respond_to_contact_request(uuid, boolean) to authenticated;
