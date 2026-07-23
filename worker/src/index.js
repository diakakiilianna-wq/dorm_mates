// Proxies the two GitHub Contents API calls the RoomieFit client needs, so the
// write token lives only in this Worker's secret bindings and never reaches
// the browser. Repo/branch/path are fixed on purpose — the client can't
// redirect this at anyone else's repo.

const REPO = { owner: 'diakakiilianna-wq', repo: 'dorm_mates', branch: 'main' };
const USERS_PATH = 'data/users.json';
const ROSTER_PATH = 'data/roster.json';
const API_ROOT = 'https://api.github.com';
const RESEND_API_ROOT = 'https://api.resend.com';

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

// env.ALLOWED_ORIGINS is a comma-separated allowlist. We echo back the
// request's Origin only if it's on the list (never a wildcard), so multiple
// known origins (prod + local dev) can call this Worker.
function resolveOrigin(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const origin = request.headers.get('Origin');
  return allowed.includes(origin) ? origin : allowed[0];
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
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

async function getFile(path, env) {
  const res = await fetch(
    `${API_ROOT}/repos/${REPO.owner}/${REPO.repo}/contents/${path}?ref=${REPO.branch}`,
    { headers: githubHeaders(env.GITHUB_TOKEN) },
  );
  if (res.status === 404) return { ok: true, data: null, sha: null };
  if (!res.ok) return { ok: false, status: res.status, error: await res.text() };
  const body = await res.json();
  return { ok: true, data: JSON.parse(base64ToUtf8(body.content)), sha: body.sha };
}

async function putFile(path, env, { data, sha, message }) {
  const res = await fetch(`${API_ROOT}/repos/${REPO.owner}/${REPO.repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...githubHeaders(env.GITHUB_TOKEN), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: utf8ToBase64(JSON.stringify(data, null, 2)),
      branch: REPO.branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (res.status === 409) return { ok: false, status: 409, conflict: true };
  if (!res.ok) return { ok: false, status: res.status, error: await res.text() };
  const body = await res.json();
  return { ok: true, sha: body.content.sha };
}

async function handleFileRoute(path, request, env, cors) {
  if (request.method === 'GET') {
    const result = await getFile(path, env);
    if (!result.ok) return json({ error: result.error }, result.status, cors);
    return json({ data: result.data, sha: result.sha }, 200, cors);
  }
  if (request.method === 'PUT') {
    const { data, sha, message } = await request.json();
    const result = await putFile(path, env, { data, sha, message });
    if (result.conflict) return json({ error: 'conflict' }, 409, cors);
    if (!result.ok) return json({ error: result.error }, result.status, cors);
    return json({ sha: result.sha }, 200, cors);
  }
  return json({ error: 'Method not allowed' }, 405, cors);
}

// Sends one email per recipient via Resend. Best-effort — a failure for one
// recipient doesn't stop the rest; per-recipient results are returned so the
// admin dashboard can show exactly who succeeded/failed.
async function handleRemind(request, env, cors) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);
  if (!env.RESEND_API_KEY) return json({ error: 'Reminder email is not configured (missing RESEND_API_KEY)' }, 500, cors);

  const { recipients, subject, message } = await request.json();
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return json({ error: 'recipients must be a non-empty array' }, 400, cors);
  }

  const from = env.RESEND_FROM || 'RoomieFit <onboarding@resend.dev>';
  const results = await Promise.all(recipients.map(async r => {
    try {
      const res = await fetch(`${RESEND_API_ROOT}/emails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [r.email],
          subject: subject || "Reminder: finish your RoomieFit roommate quiz",
          text: message || `Hi ${r.name},\n\nYou haven't finished the RoomieFit roommate-matching quiz yet. It only takes a few minutes: https://diakakiilianna-wq.github.io/dorm_mates/\n\nThanks!`,
        }),
      });
      if (!res.ok) return { email: r.email, ok: false, error: await res.text() };
      return { email: r.email, ok: true };
    } catch (err) {
      return { email: r.email, ok: false, error: String(err) };
    }
  }));

  return json({ results }, 200, cors);
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(resolveOrigin(request, env));
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    if (url.pathname === '/api/users') return handleFileRoute(USERS_PATH, request, env, cors);
    if (url.pathname === '/api/roster') return handleFileRoute(ROSTER_PATH, request, env, cors);
    if (url.pathname === '/api/remind') return handleRemind(request, env, cors);

    return json({ error: 'Not found' }, 404, cors);
  },
};
