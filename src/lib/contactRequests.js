import { supabase } from './supabaseClient.js';

// Every request the current user is party to, either side.
export async function fetchContactRequests(userId) {
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Most recent request the current user made for this owner/field, if any.
export async function fetchRequestStatus(requesterId, ownerId, field) {
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .eq('requester_id', requesterId)
    .eq('owner_id', ownerId)
    .eq('field', field)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function requestContact(requesterId, ownerId, field) {
  const { error } = await supabase
    .from('contact_requests')
    .insert({ requester_id: requesterId, owner_id: ownerId, field });
  if (error) throw error;
}

export async function respondToContactRequest(requestId, approve) {
  const { error } = await supabase.rpc('respond_to_contact_request', { request_id: requestId, approve });
  if (error) throw error;
}

export async function getMaskedContact(ownerId, field) {
  const { data, error } = await supabase.rpc('get_masked_contact', { owner_id: ownerId, field });
  if (error) throw error;
  return data;
}

export async function hasContactValue(ownerId, field) {
  const { data, error } = await supabase.rpc('has_contact_value', { owner_id: ownerId, field });
  if (error) throw error;
  return data;
}

export async function getContactValue(ownerId, field) {
  const { data, error } = await supabase.rpc('get_contact_value', { owner_id: ownerId, field });
  if (error) throw error;
  return data;
}

export async function updateOwnPhone(userId, phone) {
  const { error } = await supabase.from('profiles').update({ phone }).eq('id', userId);
  if (error) throw error;
}
