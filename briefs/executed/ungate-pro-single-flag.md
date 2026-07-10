# Brief: Ungate all Pro content behind a single server-side flag

**Status:** Ready for Cody
**Type:** Reversible toggle — gated path must stay intact (no teardown)

## Context

Making everything free until the site is more built out. Confirmed from the gating map: the real gate is `hasAccess()` in the Netlify Functions, **not** the client `PRO_ENABLED` flag. `PRO_ENABLED` only guards the subscribe button.

We are **NOT** deleting gate logic. We're adding the single server switch the site currently lacks and making every gate honor it, so re-gating later is one boolean.

## Design — decided, implement this, don't substitute

- One server flag, `GATING_ENABLED`, initial value `false`. Put it in the shared module the functions already import for `hasAccess` / `verifyToken` / `readSub` / `isActive` (confirm that module's path on read).
- Gate by **prepending a guard**, never rewriting or removing existing checks — the dormant gated path must stay byte-for-byte what it is today.
  - Each `hasAccess()`: first line `if (!GATING_ENABLED) return true;`. Leave the `verifyToken → readSub → isActive` body untouched below it.
  - `fantasy-data.mjs` 403: `if (GATING_ENABLED && !pro) return json(403, {error:"pro_required"});` — wrap, don't delete.
- Leave `PRO_ENABLED` in `f1-access.js` exactly as-is (`false`). Separate concern (checkout). Do **NOT** merge the two flags.
- `f1-driver.jsx`: no change. It renders off `data.pro`; `driver.mjs` will return `pro: true` for everyone once its `hasAccess()` short-circuits. Confirm and touch nothing there.

## Step 1 — Read in full, confirm placement (no code yet)

- Read the shared helper module, `driver.mjs`, `fantasy-data.mjs`, and `fantasy.astro` completely.
- Grep all functions for `hasAccess(`; list every callsite. Confirm the three known surfaces are the **only** ones — flag any fourth (e.g. a separate price-history endpoint) before proceeding.
- Report the shared-module path and confirm the guard drops cleanly into each `hasAccess()`.

## Step 2 — The unknown: `fantasy.astro`'s client gate

It runs `access.check()` and only fetches `/api/fantasy-data` if active, so a non-subscriber's browser never fetches — skipping the server 403 alone won't surface data there. It must consult the same `GATING_ENABLED` value and fetch regardless when gating is off.

If reading the flag cleanly in the client/build context is awkward given the no-bundler `public/` setup, acceptable fallback: always fetch, and ensure the 403 path (for when gating returns) still renders the current gate UI. Pick based on what the file actually looks like. **If neither is clean, STOP and report — don't improvise.**

## Step 3 — Implement (only if Steps 1–2 are clean)

- Add the flag, prepend the guards, wire `fantasy.astro`.
- If sharing the flag across contexts (functions ↔ client) needs a build/bundler change, **STOP and report** — don't add a bundler on the fly.

## Step 4 — Verify before commit

- **Gating OFF (now):** signed-out visitor gets full H2H on a driver page, full `/fantasy` sortable + price-history tab, no 403s, no fade overlay.
- **Re-gate sanity:** flip `GATING_ENABLED = true` locally (don't commit that), confirm behavior returns to exactly today's gated state — H2H teaser + overlay, fantasy 403 — then flip back to `false`.

## Step 5 — Commit

Scoped to only the files touched (shared flag module, `driver.mjs`, `fantasy-data.mjs`, `fantasy.astro`). No `git add -A`. Quote bracketed paths.
