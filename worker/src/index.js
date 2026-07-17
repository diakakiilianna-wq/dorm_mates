// Proxies the two GitHub Contents API calls the RoomieFit client needs, so the
// write token lives only in this Worker's secret bindings and never reaches
// the browser. Repo/branch/path are fixed on purpose — the client can't
// redirect this at anyone else's repo.

const REPO = { owner: 'diakakiilianna-wq', repo: 'dorm_mates', branch: 'main' };
const USERS_PATH = 'data/users.json';
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

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dorm-mates-proxy',
  };
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env.ALLOWED_ORIGIN);
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (url.pathname !== '/api/users') return json({ error: 'Not found' }, 404, cors);

    if (request.method === 'GET') {
      const res = await fetch(
        `${API_ROOT}/repos/${REPO.owner}/${REPO.repo}/contents/${USERS_PATH}?ref=${REPO.branch}`,
        { headers: githubHeaders(env.GITHUB_TOKEN) },
      );
      if (res.status === 404) return json({ data: null, sha: null }, 200, cors);
      if (!res.ok) return json({ error: await res.text() }, res.status, cors);
      const body = await res.json();
      const data = JSON.parse(base64ToUtf8(body.content));
      return json({ data, sha: body.sha }, 200, cors);
    }

    if (request.method === 'PUT') {
      const { data, sha, message } = await request.json();
      const res = await fetch(`${API_ROOT}/repos/${REPO.owner}/${REPO.repo}/contents/${USERS_PATH}`, {
        method: 'PUT',
        headers: { ...githubHeaders(env.GITHUB_TOKEN), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          content: utf8ToBase64(JSON.stringify(data, null, 2)),
          branch: REPO.branch,
          ...(sha ? { sha } : {}),
        }),
      });
      if (res.status === 409) return json({ error: 'conflict' }, 409, cors);
      if (!res.ok) return json({ error: await res.text() }, res.status, cors);
      const body = await res.json();
      return json({ sha: body.content.sha }, 200, cors);
    }

    return json({ error: 'Method not allowed' }, 405, cors);
  },
};
