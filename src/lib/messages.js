import { supabase } from './supabaseClient.js';

// All messages between the current user and `otherUserId`, oldest first.
export async function fetchThread(currentUserId, otherUserId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),` +
      `and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`
    )
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

// One entry per conversation partner, holding the most recent message,
// sorted by recency. Used for the Messages tab inbox list.
export async function fetchConversations(userId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const byOtherUser = new Map();
  for (const m of data) {
    const otherId = m.sender_id === userId ? m.recipient_id : m.sender_id;
    if (!byOtherUser.has(otherId)) byOtherUser.set(otherId, { otherId, lastMessage: m });
  }
  return Array.from(byOtherUser.values());
}

export async function sendMessage(senderId, recipientId, body) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, recipient_id: recipientId, body })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMessage(id) {
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw error;
}

// Marks every unread message from `otherUserId` to the caller as read, via
// an RPC (rather than a general UPDATE policy) so recipients can't edit
// message bodies while flipping the read flag.
export async function markThreadRead(otherUserId) {
  const { error } = await supabase.rpc('mark_thread_read', { other_user_id: otherUserId });
  if (error) throw error;
}
