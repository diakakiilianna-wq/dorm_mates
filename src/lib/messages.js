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

export async function sendMessage(senderId, recipientId, body) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, recipient_id: recipientId, body })
    .select()
    .single();
  if (error) throw error;
  return data;
}
