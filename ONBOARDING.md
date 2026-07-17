# RoomieFit — Ownership Handoff (to diakakiilianna-wq)

This project has **no traditional backend and no user accounts** for the ~30
classmates using it — but *you* (the new owner) need access to two accounts
to keep it running. See `README.md` for what the app actually does.

Current live app: https://valerion-exe.github.io/dorm_mates/
**New URL after transfer:** https://diakakiilianna-wq.github.io/dorm_mates/

diakakiilianna-wq is already a GitHub collaborator on this repo. What's left
is the actual ownership transfer plus the two things that break the moment
it happens (a CORS check and an API path), which are already staged and
ready to deploy.

## The two accounts that matter

### 1. GitHub — repo (currently `Valerion-exe/dorm_mates`)
The code, the GitHub Pages hosting, **and** the shared data store
(`data/users.json` — every profile save is a commit to this file).

### 2. Cloudflare — hosts the Worker proxy
Currently under Valerion-exe's account (`dorm-mates-proxy.ajay-jagan2020.workers.dev`).
It holds the **`GITHUB_TOKEN`** secret — a fine-grained GitHub PAT, scoped to
only this repo with Contents: Read & write — which is the only thing that
can write to `data/users.json`. diakakiilianna-wq will set up their **own**
Cloudflare account and deploy their own copy of this Worker (decided during
this handoff), rather than sharing Valerion-exe's account.

## The transfer sequence (do this in order)

**Step 1 — Valerion-exe transfers the repo.**
Repo → Settings → General → "Danger Zone" → **Transfer ownership** → type
`diakakiilianna-wq`. Repo name stays `dorm_mates`.

⚠️ When GitHub asks whether to keep the outgoing owner as a collaborator,
**say yes, for now** — the existing `GITHUB_TOKEN` still in the bridge Worker
was issued as Valerion-exe's fine-grained PAT, and it needs Valerion-exe to
still have repo access for that token to keep working during the bridge
period below. Once diakakiilianna-wq rotates the token (Step 3), Valerion-exe
can be removed.

**Step 2 — Valerion-exe redeploys the existing (bridge) Worker immediately.**
The moment Step 1 completes, tell whoever has this terminal open (or run it
yourself) so the Worker's CORS check and API path match the new URL:
```
cd worker
npx wrangler deploy
```
This has *already been staged* in the repo — `wrangler.toml`'s
`ALLOWED_ORIGIN` and `src/index.js`'s `REPO.owner` were updated to
`diakakiilianna-wq` ahead of time. Deploying them **before** the transfer
would have broken the currently-live app (it'd reject requests from the
still-in-use old URL), so this step must happen right after, not before.
This closes the gap to well under a minute.

At this point the app is fully working again at the new URL, still riding on
Valerion-exe's Cloudflare account and (temporarily) their GitHub token. Steps
3–4 are not time-pressured — do them whenever convenient.

**Step 3 — diakakiilianna-wq generates their own token and rotates the secret.**
1. `github.com/settings/personal-access-tokens/new`
   - Resource owner: diakakiilianna-wq
   - Repository access: **Only select repositories** → `dorm_mates`
   - Permissions: **Contents → Read and write** (nothing else)
2. From `worker/`:
   ```
   npx wrangler secret put GITHUB_TOKEN
   ```
   (this still targets the bridge Worker, still on Valerion-exe's Cloudflare
   account — that's fine, secrets aren't tied to whose GitHub token they hold)
3. Valerion-exe revokes their old token from
   `github.com/settings/personal-access-tokens`, and can now be removed as a
   collaborator if desired.

**Step 4 — diakakiilianna-wq migrates the Worker to their own Cloudflare account (optional, whenever).**
```
cd worker
npx wrangler login              # "Sign in with GitHub" is fine
npx wrangler secret put GITHUB_TOKEN   # their own repo-scoped token
npx wrangler deploy
```
First deploy under a fresh account prompts you to register a free
`workers.dev` subdomain (one-time, no cost — pick anything available). The
deploy output prints the final URL, e.g.
`https://dorm-mates-proxy.<subdomain>.workers.dev`. Then update
`src/lib/github.js`:
```js
const WORKER_URL = 'https://dorm-mates-proxy.<subdomain>.workers.dev/api/users';
```
Commit and push to `main` — Pages picks it up automatically. Once confirmed
working, Valerion-exe's Cloudflare account is no longer involved at all.

## Other things to check right after the transfer (Step 1)

- **Settings → Pages → Source → GitHub Actions** — this setting does not
  reliably carry over on a transfer and defaults to "Deploy from a branch,"
  which serves raw source and shows a blank page. Verify it's still set to
  GitHub Actions; if not, flip it (see git history around commit `2031308`
  for what this exact failure looks like).
- `vite.config.js`'s `base: '/dorm_mates/'` does **not** need to change —
  it's keyed on repo name, which isn't changing.

## Verifying it worked

```
curl -s "https://dorm-mates-proxy.<subdomain>.workers.dev/api/users" \
  -H "Origin: https://diakakiilianna-wq.github.io"
```
Should return `{"data":[...],"sha":"..."}` with the current roster (17+
profiles as of this handoff). A `401`/`403` means the token is wrong or its
permissions/collaborator access lapsed; a browser CORS error means
`ALLOWED_ORIGIN` doesn't match the Pages origin exactly.

Do **not** run a test write (PUT) against the live endpoint — it's real
classmates' data. Confirm writes through the actual app UI (edit your own
profile and save) instead of scripting a raw request.

## Everything else

Nothing else needs transferring. The ~30 classmates using the app have no
accounts, tokens, or logins of any kind — they just open the site and type
their name.
