# SPA Fold — Brief 03 of 05: Redirect old driver URLs → new route

**Status:** Ready for Cody
**Type:** Build — small but high-stakes (SEO cutover). Read-confirm, implement, verify carefully.
**Depends on:** Brief 02 (new `/drivers/[id]` pages live and verified). The new pages are confirmed good across current/retired/obscure drivers.

## Goal

301-redirect the old SPA URL `/driver?d=<id>` → the new `/drivers/<id>`, and update the sitemap. This is the cutover: old URLs are indexed by Google and linked/bookmarked externally, so the redirect must be a clean permanent (301) that transfers ranking and keeps old links working. Getting it wrong (loops, 404s) loses SEO on the highest-traffic pages, so verification matters as much as the change.

**Note (already decided by owner):** this URL change is the piece that could nudge the in-review AdSense application. Owner has accepted that tradeoff ("do it right"). Proceed.

## Step 1 — Read and report (before changing)

- Report how redirects are currently configured (`netlify.toml` `[[redirects]]`, a `_redirects` file, or none) and where to add this one.
- Confirm Netlify supports the query-param → path redirect syntax for this case. Expected shape (verify against current Netlify docs, don't rely on memory):
  ```toml
  [[redirects]]
    from = "/driver"
    to = "/drivers/:d"
    status = 301
    force = true
    [redirects.query]
      d = ":d"
  ```
- Report `src/pages/sitemap-drivers.xml.ts` line 12 (the driver URL it emits) — it currently points at the old `/driver?d=` form and must emit `/drivers/<id>`.
- **Report, then implement.**

## Step 2 — Implement

- Add the 301 redirect: `/driver?d=<id>` → `/drivers/<id>`, permanent, forced.
- Update `sitemap-drivers.xml.ts` to emit the new `/drivers/<id>` URLs (so Google is pointed at the canonical new URLs).
- Do **not** delete the old SPA files yet (Brief 05). The redirect will intercept `/driver?d=X` before the old page serves — that's intended.
- Do **not** touch the 35+ internal `/driver?d=X` links yet — that's Brief 04. (They'll still work via this redirect in the meantime, but Brief 04 updates them to point directly at the new URL to avoid an unnecessary redirect hop.)

## Step 3 — Verify (do this thoroughly — it's the cutover)

- **Redirect fires and lands right:** visit `https://f1delta.com/driver?d=charles-leclerc` → must 301 to `https://f1delta.com/drivers/charles-leclerc` and render the new page. Test 2–3 drivers, including one with a less-obvious slug (e.g. `carlos-sainz-jr`).
- **Status is 301, not 302:** check the response (DevTools Network → the `/driver` request → Status should be 301 Moved Permanently). A 302 (temporary) wouldn't transfer SEO — must be 301.
- **No redirect loop:** the new `/drivers/<id>` page must load normally and NOT redirect again.
- **No 404:** an old-style link that previously worked must resolve to a live new page, not a not-found.
- **Bare `/driver` with no `?d=`:** decide/verify behavior — should redirect somewhere sane (e.g. `/drivers` index) rather than erroring. Report what it does.
- **Sitemap:** `https://f1delta.com/sitemap-drivers.xml` now lists `/drivers/<id>` URLs, not the old form.
- **Purge Cloudflare after deploy** (should be automatic via the deploy webhook) and confirm the redirect via a fresh load, not a cached one.

## Step 4 — Commit

Scoped to: the redirect config (`netlify.toml` or `_redirects`) and `sitemap-drivers.xml.ts`. No `git add -A`. Quote bracketed paths.

## Push
Build brief — **it ends in a push.** Push after review, then run the Step 3 verifications on the live site before Brief 04.

## After this brief
Old `/driver?d=X` links (including the 35+ internal ones still in the code) now redirect to the new pages, so nothing is broken. Brief 04 updates those internal links to point directly at `/drivers/X` (removing the redirect hop); Brief 05 deletes the old SPA files and decides `/api/driver`'s fate.
