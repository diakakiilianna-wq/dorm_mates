// Minimal GitHub Contents API client — reads/writes a single JSON file as a
// commit, per BACKEND_SPEC.md §1/§7 (no server, browser calls the API directly).

const API_ROOT = 'https://api.github.com';

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export class GithubConflictError extends Error {
  constructor() {
    super('GitHub contents API returned 409 (file changed since last read)');
    this.name = 'GithubConflictError';
  }
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
}

// Returns { data, sha } or { data: null, sha: null } if the file doesn't exist yet.
export async function getFile({ owner, repo, branch, token }, path) {
  const url = `${API_ROOT}/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: headers(token) });
  if (res.status === 404) return { data: null, sha: null };
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  const data = JSON.parse(base64ToUtf8(body.content));
  return { data, sha: body.sha };
}

// Creates or updates the file with `data` (any JSON-serializable value).
// Throws GithubConflictError on a 409 (sha mismatch) so callers can refetch-reapply-retry.
export async function putFile({ owner, repo, branch, token }, path, data, sha, message) {
  const url = `${API_ROOT}/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({
      message,
      content: utf8ToBase64(JSON.stringify(data, null, 2)),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (res.status === 409) throw new GithubConflictError();
  if (!res.ok) throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.content.sha;
}
