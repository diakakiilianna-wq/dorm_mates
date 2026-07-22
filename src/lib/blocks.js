import { supabase } from './supabaseClient.js';

// Set of user ids blocked in either direction (I blocked them, or they
// blocked me) — used to filter Browse/Favorites/Messages client-side.
export async function fetchBlockedUserIds(userId) {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocker_id, blocked_id')
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
  if (error) throw error;
  const ids = new Set();
  for (const row of data) {
    ids.add(row.blocker_id === userId ? row.blocked_id : row.blocker_id);
  }
  return ids;
}

export async function blockUser(blockerId, blockedId) {
  const { error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) throw error;
}
