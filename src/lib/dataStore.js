// Data layer for the class's shared roster, backed by the dorm-mates-proxy
// Worker (github.js), which is the only thing holding write credentials.

import { getUsers, putUsers, GithubConflictError } from './github.js';

const USERS_PATH_MESSAGE = 'Upsert profile';

export async function loadUsers() {
  const { data } = await getUsers();
  return data || [];
}

function applyUpsert(users, user) {
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) return [...users, user];
  const next = users.slice();
  next[idx] = user;
  return next;
}

// Adds or replaces `user` by id. On a 409, refetch the latest file, re-apply
// this user's change on top of it, and retry once (last-write-wins).
export async function upsertUser(user) {
  const { data, sha } = await getUsers();
  const users = data || [];
  const next = applyUpsert(users, user);
  try {
    await putUsers(next, sha, `${USERS_PATH_MESSAGE}: ${user.name}`);
  } catch (err) {
    if (!(err instanceof GithubConflictError)) throw err;
    const retry = await getUsers();
    const retryNext = applyUpsert(retry.data || [], user);
    await putUsers(retryNext, retry.sha, `${USERS_PATH_MESSAGE}: ${user.name} (retry)`);
  }
}
