-- Run this once in the Supabase SQL editor, after schema.sql.
--
-- Real cross-account messaging: a flat `messages` table (sender → recipient),
-- RLS so each person can only see messages they sent or received. Polling for
-- now — Realtime can be layered on top of the same table later.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  -- No FK on recipient_id: the roster (data/users.json) still includes
  -- legacy profiles created before Supabase auth existed, which have no
  -- matching auth.users row. Messaging one of those just won't be visible
  -- to a "recipient" who can never log in — not a constraint violation.
  recipient_id uuid not null,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create index if not exists messages_sender_recipient_idx
  on public.messages (sender_id, recipient_id, created_at);
create index if not exists messages_recipient_sender_idx
  on public.messages (recipient_id, sender_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "Users can view their own conversations" on public.messages;
create policy "Users can view their own conversations"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Users can send messages as themselves" on public.messages;
create policy "Users can send messages as themselves"
  on public.messages for insert
  with check (auth.uid() = sender_id);
