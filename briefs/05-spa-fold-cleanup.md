# SPA Fold — Brief 05 of 05: Cleanup (surgical — preserve the payment stack)

**Status:** Ready for Cody
**Type:** Read-and-report FIRST (over-deletion is the risk), then delete only what's confirmed dead.
**Depends on:** Briefs 02–04 (new pages live, redirect live, internal links migrated). This is the final teardown of the old SPA.

## Goal

Remove the dead standalone driver SPA and the now-unused **content-gating** code, while **preserving the entire payment stack** (Stripe, Netlify Blobs, `f1-access.js`, the access-check module) — which will be reused for an upcoming **"Go Ad-Free" one-time payment** feature (its own later brief, after AdSense approves).

**The critical line to draw:**
- **DELETE:** the old SPA files, and the *content*-gating logic that's now unused (e.g. `freeView()`, the H2H gate path) — the new static pages don't call any of it.
- **PRESERVE (do not delete):** Stripe integration, Netlify Blobs subscriber storage, `f1-access.js`, and the underlying access/identity mechanism. This is the ad-removal foundation. Deleting it means rebuilding it later.
- **PRESERVE — CRITICAL, NEW since this brief was drafted:** the **driver-redirect edge function** (the Netlify Edge Function that 301s `/driver?d=<id>` → `/drivers/<id>`). The redirect was moved from a `netlify.toml` `[[redirects]]` rule to an **edge function** during troubleshooting — that edge function is now the live redirect and is load-bearing. **Do NOT delete it or mistake it for a dead function.** Identify it explicitly in Step 1 and leave it untouched.

Over-deleting here recreates the exact "little fix later" we're avoiding. So this brief **reads and reports before removing anything.**

## Step 1 — Read and report (NO deletion yet)

Map the dependency graph so we cut precisely:

1. **`public/driver.html` + `public/f1-driver.jsx`:** confirm nothing else references them (grep the repo for both filenames, and for `driver.html`). The Brief 03 redirect intercepts `/driver?d=X`, and Brief 04 migrated internal links — confirm `f1-driver.jsx`'s 3 remaining `/driver?d=` occurrences are all self-internal (comment, its own API call, self-ref) and vanish with the file. Safe to delete? Report.
2. **`netlify/functions/driver.mjs` (`/api/driver`):** report exactly what it imports and what it does. Is it now called by anything on the site? (The new pages read `data/drivers/*.json` directly, so it should be uncalled.) **Report what it imports from the shared access/payment module** — we need to know whether deleting `/api/driver` would break anything the payment stack needs, or whether it's purely a content endpoint that's safe to remove while leaving the shared module intact.
3. **The shared access/payment module** (the one providing `hasAccess`/`verifyToken`/`readSub`/`isActive`, and whatever `f1-access.js` + Stripe + Blobs use): map what imports it. Report which importers are **content-gating** (dead) vs **payment infrastructure** (preserve). Draw the exact boundary.
4. **`f1-access.js`:** report what it does and what references it. Confirm it's part of the payment path to **preserve**, not content-gating to delete.
5. **Other functions:** `create-checkout`, `check-access`, `verify-session` (or whatever exists) — report which are payment infrastructure (preserve for ad-removal) vs anything purely content-gating (delete).
6. **The driver-redirect edge function:** locate it (likely under `netlify/edge-functions/` or wherever edge functions live in this repo), and identify it clearly so it is NOT confused with a dead content function. Confirm the old `netlify.toml` `[[redirects]]` block for `/driver` was removed when the edge function took over (if a stale rule remains, report it — but do not touch the edge function itself). This file is PRESERVE.
7. **The 6 dead JSX files** flagged in earlier audits (`f1-home.jsx`, `f1-app.jsx`, `f1-sections.jsx`, `f1-fantasy.jsx`, `f1-timing.jsx`, `tweaks-panel.jsx`) and the orphaned `SiteNav.astro` — re-grep each for references. Report which are confirmed unreferenced and safe to sweep in this cleanup. **Note:** `f1-home.jsx` was edited in Brief 04 (link update) — confirm it's actually still dead/unreferenced before deleting, don't assume.

**Output:** a clear two-column map — **DELETE** (old SPA files, dead content-gating, confirmed-dead JSX/orphans) vs **PRESERVE** (Stripe, Blobs, `f1-access.js`, access module, payment functions). **Report and wait for confirmation before deleting anything.**

## Step 2 — Delete (only what's confirmed dead, after sign-off)

- Delete `public/driver.html` and `public/f1-driver.jsx`.
- Delete `/api/driver` (`driver.mjs`) **only if** Step 1 confirms it's an uncalled content endpoint and its removal doesn't touch the preserved payment module. If it's entangled, STOP and report — don't force it.
- Remove dead content-gating code paths (e.g. `freeView`) **only** where they're not shared with preserved payment logic.
- Sweep the confirmed-dead JSX files + `SiteNav.astro`.
- **Do NOT touch** anything in the PRESERVE column — Stripe, Blobs, `f1-access.js`, the access/identity module, payment functions all stay.

## Step 3 — Verify

- `https://f1delta.com/drivers/max-verstappen` (and 2 others) still render fully — the new pages don't depend on anything deleted.
- **The driver redirect still works after deletion** — run `curl -I "https://f1delta.com/driver?d=max-verstappen"` on the live site: must return `301` with `location: https://f1delta.com/drivers/max-verstappen` and NO `?d=`. (The redirect is now an edge function — confirm deleting old files didn't disturb it.)
- Build succeeds; no import errors from deleted files.
- Grep the repo: no remaining references to the deleted files/functions.
- The preserved payment files still exist and still build (even though unused right now) — confirm Stripe/Blobs/`f1-access.js`/access module are intact.
- The driver-redirect **edge function still exists** and the redirect fires (per the curl check above).
- Nothing else on the site regressed (spot-check a few pages).

## Step 4 — Commit

Scoped to the deleted files only. No `git add -A`. Quote bracketed paths.

## Push
Step 1 is read-only (**no push**). The deletion commit (Step 2) **ends in a push** — after sign-off on the DELETE/PRESERVE map.

## After this brief
The SPA fold is **complete**: driver pages are 792 static Astro pages under BaseLayout, correct nav, shared tables, ungated, old URLs redirected, old SPA gone. The payment stack sits preserved and ready for the **"Go Ad-Free"** feature — a separate brief once AdSense approves and real ads exist to remove.
