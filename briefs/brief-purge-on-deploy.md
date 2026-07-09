# Brief: Purge Cloudflare cache on deploy

**Status:** Ready — part Tom (dashboard), part Cody (function)
**Type:** Infrastructure. Do this BEFORE the design overhaul.

## Why this first

Cloudflare holds HTML for 1 hour (Edge TTL, `Cache HTML pages` rule). After every deploy, the edge keeps serving the old HTML until that expires or someone manually clicks **Purge Everything**.

This has already produced multiple false bug reports — a "missing footer," a "nav that didn't update," pages that looked broken but were fine. The overhaul means many deploys in a row. Automating the purge stops every one of them from opening with a phantom bug.

## Design (decided — implement this, don't substitute)

**Netlify "Deploy succeeded" outgoing webhook → a Netlify Function → Cloudflare purge API.**

Why not purge from GitHub Actions: the bake cron commits to `main`, and *Netlify* deploys after that. Purging when the Action finishes races the deploy — Cloudflare could re-cache the old content before the new deploy is live. The deploy-succeeded webhook fires only once the deploy is actually serving.

Why a function at all: Netlify's outgoing webhook can't attach an `Authorization` header, so it can't call Cloudflare directly. The function receives the webhook and makes the authenticated call.

## Tom's steps (dashboard)

1. **Cloudflare → My Profile → API Tokens → Create Token.** Use the *Zone → Cache Purge* template if present, else a custom token with **only** the cache-purge permission. Scope it to the `f1delta.com` zone and nothing else. Copy the token — it's shown once.
2. **Cloudflare → f1delta.com → Overview.** Copy the **Zone ID** from the right sidebar.
3. **Netlify → the f1delta site → Environment variables.** Add:
   - `CF_API_TOKEN` — the token from step 1
   - `CF_ZONE_ID` — the zone ID from step 2
   - `PURGE_SECRET` — a long random string you generate (e.g. `openssl rand -hex 32`)
4. **After Cody ships the function**, add the trigger: **Netlify → Site configuration → Build & deploy → Deploy notifications → Add notification → Deploy succeeded → Outgoing webhook**, URL:
   `https://f1delta.com/.netlify/functions/purge-cache?key=<PURGE_SECRET>`

The token is never committed. It lives only in Netlify env vars.

## Cody's steps

### Step 1 — Read and report (no code yet)
- Report the existing `netlify/functions/` layout and the Functions v2 conventions already in use (handler signature, how env vars are read, how JSON responses are returned, any shared `lib/` helpers).
- Confirm the Cloudflare cache rule excludes `/.netlify/` — the purge function itself must never be cached. (It does; verify.)
- **Verify the current Cloudflare purge API endpoint, required permission name, and request shape against Cloudflare's live documentation.** Do not rely on memory or on the shape sketched below. Report what the docs actually say.
- Report back, then implement.

### Step 2 — Create `netlify/functions/purge-cache.mjs`

- Accept **POST only**; reject anything else with 405.
- **Require the shared secret**: compare the `key` query param against `process.env.PURGE_SECRET`. If absent or mismatched, return 401 and do nothing. A publicly callable purge endpoint would let anyone repeatedly bust your cache.
- On success, call Cloudflare's purge endpoint for `CF_ZONE_ID` with `Authorization: Bearer ${CF_API_TOKEN}` and a `purge_everything` body. (Confirm exact shape from the docs in Step 1 — expected to be `POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache` with `{"purge_everything": true}`.)
- Return 200 with Cloudflare's success flag on success; return the upstream status and error on failure.
- **Never log `CF_API_TOKEN` or `PURGE_SECRET`.** Log the Cloudflare response status and any error message only.
- Fail loudly in the function log if `CF_API_TOKEN`, `CF_ZONE_ID`, or `PURGE_SECRET` is missing.

## Verify

1. Deploy. Netlify → Functions → `purge-cache` logs should show an invocation with a Cloudflare success response shortly after the deploy goes live.
2. Immediately after a deploy, load f1delta.com → DevTools → Network → document request → `cf-cache-status` should read `MISS` (cache was cleared), and `HIT` on reload.
3. Make a visible content change, deploy, and confirm it appears immediately — no 1-hour wait, no manual purge.
4. Hit `https://f1delta.com/.netlify/functions/purge-cache` with no `key` → must return 401.

## Notes

- `purge_everything` clears CSS/JS/images too. They re-fetch from Netlify on next request — a negligible origin blip per deploy, and it means asset changes propagate immediately (relevant to the token-consolidation phase, which ships a new unhashed stylesheet).
- The bake cron only commits when the derived data actually changes, so this fires roughly per real deploy, well within Cloudflare's purge rate limits.

## Commit

Scoped to the new function file (and `netlify.toml` only if the function needs registering). No `git add -A`. Quote bracketed paths.
