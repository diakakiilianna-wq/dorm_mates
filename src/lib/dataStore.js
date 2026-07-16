// Data layer abstraction, backed by the class's shared GitHub repo via the
// Contents API (github.js), with an automatic localStorage fallback until a
// token has been entered (so the app never hard-fails before setup).
//
// Repo/branch are fixed for this deployment — Valerion-exe/dorm_mates, the
// same repo this app itself is hosted from via GitHub Pages. Only the access
// token is user-supplied (Settings screen), since it's the one piece that
// can't be committed to source.

import { getFile, putFile, GithubConflictError } from './github.js';

const CONFIG_KEY = 'roomiefit_config';
const LOCAL_USERS_KEY = 'roomiefit_local_users';
const USERS_PATH = 'data/users.json';

export const REPO = { owner: 'Valerion-exe', repo: 'dorm_mates', branch: 'main' };

const DEFAULT_CONFIG = { token: '' };

export function getConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function setConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function isGithubConfigured(config) {
  return !!(config || getConfig()).token;
}

function githubTarget() {
  const { token } = getConfig();
  return { ...REPO, token };
}

function loadLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export async function loadUsers() {
  if (!isGithubConfigured()) return loadLocalUsers();
  const { data } = await getFile(githubTarget(), USERS_PATH);
  return data || [];
}

function applyUpsert(users, user) {
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) return [...users, user];
  const next = users.slice();
  next[idx] = user;
  return next;
}

// Adds or replaces `user` by id. Against GitHub, follows BACKEND_SPEC.md §7's
// last-write-wins handling: on a 409, refetch the latest file, re-apply this
// user's change on top of it, and retry once.
export async function upsertUser(user) {
  if (!isGithubConfigured()) {
    saveLocalUsers(applyUpsert(loadLocalUsers(), user));
    return;
  }

  const target = githubTarget();
  const { data, sha } = await getFile(target, USERS_PATH);
  const users = data || [];
  const next = applyUpsert(users, user);
  try {
    await putFile(target, USERS_PATH, next, sha, `Upsert profile: ${user.name}`);
  } catch (err) {
    if (!(err instanceof GithubConflictError)) throw err;
    const retry = await getFile(target, USERS_PATH);
    const retryNext = applyUpsert(retry.data || [], user);
    await putFile(target, USERS_PATH, retryNext, retry.sha, `Upsert profile: ${user.name} (retry)`);
  }
}
