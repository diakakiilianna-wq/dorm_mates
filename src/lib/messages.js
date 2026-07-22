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
