import { supabase } from './supabaseClient.js';

export async function reportUser(reporterId, reportedId, reason) {
  const { error } = await supabase.from('reports').insert({ reporter_id: reporterId, reported_id: reportedId, reason: reason || null });
  if (error) throw error;
}
