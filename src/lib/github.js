// Client for the dorm-mates-proxy Cloudflare Worker, which holds the GitHub
// write token server-side and proxies reads/writes of data/users.json. The
// browser never sees a token.

export const WORKER_BASE = 'https://dorm-mates-proxy.diakakiilianna.workers.dev';
const WORKER_URL = `${WORKER_BASE}/api/users`;

export class GithubConflictError extends Error {
  constructor() {
    super('Proxy returned 409 (file changed since last read)');
    this.name = 'GithubConflictError';
  }
}

// Returns { data, sha } or { data: null, sha: null } if the file doesn't exist yet.
export async function getUsers() {
  const res = await fetch(WORKER_URL);
  if (!res.ok) throw new Error(`Failed to load profiles: ${res.status} ${await res.text()}`);
  return res.json();
}

// Creates or updates the file with `data` (any JSON-serializable value).
// Throws GithubConflictError on a 409 (sha mismatch) so callers can refetch-reapply-retry.
export async function putUsers(data, sha, message) {
  const res = await fetch(WORKER_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, sha, message }),
  });
  if (res.status === 409) throw new GithubConflictError();
  if (!res.ok) throw new Error(`Failed to save profile: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.sha;
}
