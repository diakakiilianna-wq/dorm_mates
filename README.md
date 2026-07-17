# RoomieFit

A no-login roommate-matching app for a class/dorm group. Everyone types just
their name, takes a compatibility quiz, and gets ranked matches — no accounts,
no passwords, nothing to sign up for.

Live at: https://valerion-exe.github.io/dorm_mates/

## Features

### Onboarding (no accounts)
- **Name gate** — type your name to start a new profile or resume an existing
  one (case-insensitive match). If more than one profile shares that name, you
  pick yours from a disambiguation list.
- **About you** — name, gender, optional bio.
- **Motivation screen** — a short prompt encouraging honest answers before the quiz.
- **Priority weighting** — six sliders (Cleaning, Sleep, Noise, Socializing,
  Conflict, Household rules) let you say how much each area matters to you.
  Each slider moves independently while you drag — nothing auto-rebalances
  mid-edit — and shows a bubble explaining what a low vs. high score on that
  axis means (e.g. Sleep: *Erratic is fine* ↔ *Consistent schedule*). Ratios
  are normalized into weights that sum to 100% only when you leave the screen.
- **21-question compatibility quiz** — multiple choice, interleaved across the
  six axes so no two consecutive questions share a category.
- **Results screen** — your score breakdown per axis, your top 5 ranked
  matches, and an editable bio box (prefilled from onboarding) with a prompt
  to add anything the quiz didn't capture, before saving your profile.

### Matching
- **Browse tab** — every other same-gender profile, ranked by compatibility
  score, with a minimum-match filter.
- **Favorites tab** — profiles you've hearted, ranked the same way.
- **Match scoring** (`src/lib/scoring.js`): each axis score is the average of
  your answers on that axis (1–5). A match score between two people is
  `100 − Σ(blended weight × score gap × 20)` across all six axes — "blended
  weight" is the average of both people's importance weighting for that axis.
  Any axis with a gap ≥ 3.5 gets flagged as a hard mismatch regardless of weighting.
- **Listing detail** — full profile view with plain-language bands (e.g. "Fairly
  tidy", "Early bird") instead of raw numbers.

### Messaging
- A message thread UI per favorited profile. **Fully mocked** — seeded with a
  few sample messages, nothing is persisted. This is intentional v1 scope, not
  a bug.

### Profile / settings
- Shows who's currently signed in, lets you edit/retake the quiz, and sign out
  ("different person's turn") to hand the device to someone else.

## Architecture

This is a **static site with no traditional backend**. The only shared state
is one file, `data/users.json`, committed to this repo via the GitHub Contents
API — every profile save is literally a git commit.

Because ~30 classmates never sign into anything, no user can hold a GitHub
credential. Instead, a small **Cloudflare Worker** (`worker/`) holds a
repo-scoped GitHub token as a server-side secret and proxies exactly two
operations — read and write `data/users.json` — over CORS. The browser never
sees a credential.

```
Browser (GitHub Pages, static)
  → fetch("https://dorm-mates-proxy.<subdomain>.workers.dev/api/users")
  → Cloudflare Worker (holds GITHUB_TOKEN secret)
  → GitHub Contents API
  → data/users.json in this repo (one commit per save)
```

- `src/lib/github.js` — thin client for the Worker's `/api/users` endpoint.
- `src/lib/dataStore.js` — `loadUsers()` / `upsertUser()`; on a write conflict
  (409, someone else saved in between) it refetches, reapplies your change on
  top, and retries once (last-write-wins per user).
- `worker/src/index.js` — the Worker itself. Repo/branch/path are hardcoded
  constants (not client-supplied), so it can't be redirected elsewhere.

## Local development

```
npm install
npm run dev      # local dev server
npm run build     # production build → dist/
npm run lint      # oxlint
```

The built app talks to the **live** Worker (the URL in `github.js` is
hardcoded), so local dev reads/writes the real shared roster. There is no
separate staging environment.

## Deployment

Push to `main` → `.github/workflows/deploy.yml` builds with Vite and publishes
`dist/` to GitHub Pages via GitHub Actions (Pages source must be set to
"GitHub Actions" in repo settings, not "Deploy from a branch").

The Worker deploys separately and only when its code changes — see
`worker/wrangler.toml` and `ONBOARDING.md` for how to redeploy it.

## Handing this off to someone else

See **`ONBOARDING.md`** — it covers every account this project depends on and
the exact steps to transfer or rotate each one.
