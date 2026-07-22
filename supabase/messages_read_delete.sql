-- Run this once in the Supabase SQL editor, after messages_schema.sql.
--
-- Adds read-tracking (for the unread badge/toast) and lets senders delete
-- their own messages.

alter table public.messages add column if not exists read boolean not null default false;

create index if not exists messages_recipient_unread_idx
  on public.messages (recipient_id, read);

-- Recipients mark a thread read via this function rather than a general
-- UPDATE policy, so they can flip `read` on messages addressed to them
-- without also being able to edit anyone's message body.
create or replace function public.mark_thread_read(other_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.messages
  set read = true
  where recipient_id = auth.uid()
    and sender_id = other_user_id
    and read = false;
end;
$$;

grant execute on function public.mark_thread_read(uuid) to authenticated;

drop policy if exists "Users can delete their own sent messages" on public.messages;
create policy "Users can delete their own sent messages"
  on public.messages for delete
  using (auth.uid() = sender_id);
