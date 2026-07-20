// Client for the roster of students expected to take the survey (name +
// email), used by the admin dashboard to compute completion and pick who to
// remind. Stored the same way as user profiles — as data/roster.json via the
// dorm-mates-proxy Worker.

import { WORKER_BASE } from './github.js';

const ROSTER_URL = `${WORKER_BASE}/api/roster`;

export class RosterConflictError extends Error {
  constructor() {
    super('Proxy returned 409 (roster changed since last read)');
    this.name = 'RosterConflictError';
  }
}

// Returns { entries, sha }. `entries` is [] if the file doesn't exist yet.
export async function loadRoster() {
  const res = await fetch(ROSTER_URL);
  if (!res.ok) throw new Error(`Failed to load roster: ${res.status} ${await res.text()}`);
  const { data, sha } = await res.json();
  return { entries: data || [], sha };
}

async function saveRoster(entries, sha, message) {
  const res = await fetch(ROSTER_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: entries, sha, message }),
  });
  if (res.status === 409) throw new RosterConflictError();
  if (!res.ok) throw new Error(`Failed to save roster: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.sha;
}

// Adds entries ({ name, email }) that aren't already on the roster
// (case-insensitive match on email), refetch-reapply-retry once on conflict.
export async function addRosterEntries(newEntries) {
  const { entries, sha } = await loadRoster();
  const next = mergeEntries(entries, newEntries);
  try {
    await saveRoster(next, sha, `Add ${newEntries.length} roster entr${newEntries.length === 1 ? 'y' : 'ies'}`);
  } catch (err) {
    if (!(err instanceof RosterConflictError)) throw err;
    const retry = await loadRoster();
    await saveRoster(mergeEntries(retry.entries, newEntries), retry.sha, 'Add roster entries (retry)');
  }
}

export async function removeRosterEntry(email) {
  const { entries, sha } = await loadRoster();
  const next = entries.filter(e => e.email.toLowerCase() !== email.toLowerCase());
  await saveRoster(next, sha, `Remove roster entry: ${email}`);
}

function mergeEntries(existing, additions) {
  const byEmail = new Map(existing.map(e => [e.email.toLowerCase(), e]));
  for (const a of additions) {
    if (!a.email) continue;
    byEmail.set(a.email.toLowerCase(), { name: a.name || '', email: a.email });
  }
  return [...byEmail.values()];
}
