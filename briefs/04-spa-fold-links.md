# SPA Fold — Brief 04 of 05: Update internal links to the new driver URLs

**Status:** Ready for Cody
**Type:** Build — mechanical, low-risk. The Brief 03 redirect is a safety net for anything missed.
**Depends on:** Brief 03 (redirect live). Internal links still point at `/driver?d=X`; they currently work via the 301, but should point directly at `/drivers/X` to skip the redirect hop.

## Goal

Replace every internal `/driver?d=<id>` link with `/drivers/<id>` across the codebase, so internal navigation goes straight to the new pages (no redirect hop). Purely mechanical — the pattern is uniform.

**Low-risk by design:** if any callsite is missed, the Brief 03 redirect still routes it correctly (it just takes one extra hop). So nothing breaks; the goal is cleanliness/speed, not correctness-critical.

## The callsites (from the Brief 01 map — 35+ across 14 src files + 2 public files)

Transform in every case: `/driver?d=${driverId}` → `/drivers/${driverId}` (and any string-literal variants like `/driver?d=` + id).

| File | Approx. lines |
|---|---|
| `src/pages/index.astro` | 116, 138, 155, 212, 222, 250, 282 |
| `src/pages/standings/[year].astro` | 70, 110, 180, 183 |
| `src/components/GrandPrixPage.astro` | 49, 56, 131, 141, 146, 153 |
| `src/components/CircuitPage.astro` | 55, 62, 162, 172, 177 |
| `src/components/TeamPage.astro` | 96, 130 |
| `src/components/EngineerPage.astro` | 50, 82 |
| `src/components/PersonPage.astro` | 72, 107 |
| `src/components/RecordBoard.astro` | 12 |
| `src/components/EngineersHub.astro` | 32 |
| `src/pages/drivers/index.astro` | 75 |
| `src/pages/drivers/never-started.astro` | 77 |
| `src/pages/standings/index.astro` | 53 |
| `src/pages/fantasy.astro` | 102 |
| `public/f1-home.jsx` | 175, 184, 201, 227 |

(`src/pages/sitemap-drivers.xml.ts` was already handled in Brief 03. `public/f1-driver.jsx` line 630 is a self-reference that disappears when the file is deleted in Brief 05 — leave it.)

## Step 1 — Read and confirm scope

- Grep the **whole repo** for `/driver?d=` to get the authoritative current list (line numbers may have shifted since Brief 01). Report the full set of matches found — confirm it matches the table above, and flag any new/missing ones.
- Confirm the transform is uniformly `/driver?d=<id>` → `/drivers/<id>` with no callsite needing special handling (e.g. an id that isn't a clean slug). Report any oddities.
- **Report, then implement.**

## Step 2 — Implement

- Update every internal `/driver?d=<id>` → `/drivers/<id>`, across all `src/` files and `public/f1-home.jsx`.
- Leave `public/f1-driver.jsx` alone (deleted in Brief 05).
- Do not change anything else in these files — link string only.

## Step 3 — Verify

- Grep the repo again for `/driver?d=` — should return **only** `public/f1-driver.jsx` (the doomed self-ref) and nothing else. Every other occurrence gone.
- Spot-check the rendered output: on the drivers index, a team page, and the home page, hover/inspect a driver link — it should point at `/drivers/<id>` directly (not `/driver?d=`).
- Click a couple through — they land on the new pages with no redirect (check Network: direct 200, not a 301 hop).
- Nothing else visually changed on those pages.

## Step 4 — Commit

Scoped to the files touched (the 13 `src/` files + `public/f1-home.jsx`). No `git add -A`. Quote bracketed paths.

## Push
Build brief — **it ends in a push.** Push after review, verify the grep comes back clean, then Brief 05 (the final cleanup) is next.
