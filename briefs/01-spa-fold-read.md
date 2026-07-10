# SPA Fold — Brief 1 of N: Read the driver SPA (no code)

**Status:** Ready for Cody
**Type:** Read-and-report ONLY. No code. Foundation for the numbered SPA-fold project.
**Context:** We're folding the driver page out of the standalone SPA (`public/driver.html` + `public/f1-driver.jsx`) into a real Astro route under BaseLayout. This fixes the stale nav (inherits BaseLayout's) and lets the tables use the shared table system. It also migrates URLs (`/driver?d=X` → `/drivers/X`). This is the biggest change in the project and touches the highest-traffic pages, so nothing changes until the SPA is fully mapped. Confirmed by the owner: **there is no live/real-time data — everything is sourced from F1DB (static/baked).**

Read `public/driver.html`, `public/f1-driver.jsx`, and anything they load or reference. Report the following. **No code changes.**

## 1. Files + bootstrap
- Every file the driver page comprises and loads (the HTML shell, the JSX, React/Babel-standalone CDN scripts, any CSS, any other JS). How does `driver.html` boot the React app? List the `<script>` tags and load order.

## 2. Routing & ID format
- How does the page read the driver from the URL? (`/driver?d=X` — how is `d` parsed, what does the app do with it?)
- **What exactly is `X`** — an F1DB driver slug? a numeric ID? Report the exact format with real examples (e.g. `?d=fernando-alonso` vs `?d=alonso`), because the new route `/drivers/[id]` and the redirects depend on it.

## 3. Data source — the key architectural question
- Where does the driver page get its data? (Earlier context suggests an `/api/driver` Netlify function.) Trace it: does `/api/driver` read a **baked static JSON file** (e.g. `data/drivers/[id].json`), or compute on the fly from F1DB source?
- **Can an Astro route read that same data source directly at build time?** i.e. is there a per-driver JSON (or a single drivers dataset) that a `getStaticPaths` could iterate to **prerender every driver page as static HTML** — matching the rest of the site's prerendered, Cloudflare-cacheable pages? Report whether prerender-all-drivers is feasible, or whether SSR / a client fetch would be needed instead. This decision shapes Brief 2.
- Roughly how many driver pages would that be (the drivers index says ~792)?

## 4. Full section/component inventory (so nothing is dropped in the port)
List EVERY section and component the SPA renders, top to bottom — e.g. the stale `TopBar` nav, the driver header (code + name), the stat boxes (Starts/Wins/Podiums/Poles/Titles/Points), season-by-season table, teammate H2H table, f1δ Score table, salary section, race-engineer section, Road to F1, footer (or lack of one), etc. For each, note what data it needs. This inventory is the port's checklist — anything missed gets lost.

## 5. Interactivity inventory (what must survive the port)
- What on the page is interactive? Sortable tables (React sort), any tabs/filters, the (not-yet-built) H2H toggles, anything else.
- For each interactive piece: could it be reimplemented with the site's existing Astro pattern (plain HTML tables + `f1-records.js` sorter, like the other tables), or does it need a client-side island? Assess feasibility per piece — the goal is to match the rest of the site (plain tables + shared sorter) where possible.

## 6. Styling map
- What CSS does the SPA use for its look (fonts — the Inter body, JetBrains Mono; the driver-header styling; stat-box styling; salary-card colors; anything component-specific)? It already consumes `tokens.css` (its `:root` was removed earlier).
- Which parts should adopt the **shared table CSS** (`f1-table.css`) in the port (the tables), and which are bespoke driver-page styling to preserve (header, stat boxes, salary card)?

## 7. The stale nav (being replaced)
- Report the exact `TopBar` markup and its link set (the stale 6-link nav with the dead `/pro`). This is what BaseLayout's nav replaces — confirm it's fully self-contained in `f1-driver.jsx` so removing it is clean.

## 8. Inbound links to migrate
- Grep the whole site for everywhere a `/driver?d=` URL is generated or linked (other pages link to driver pages this way — e.g. drivers index, standings, records, team pages, H2H teammate links). List every location. Brief 4 must update all of these to `/drivers/X`.

## 9. Proposed fold plan
Given all the above, propose the sequenced build plan:
- The recommended data/render approach (prerender-all via `getStaticPaths` preferred if feasible — say so, or explain why not).
- How many build briefs the port realistically needs and what each covers.
- Any risks or surprises found (anything that makes the port harder than "move the sections into an Astro page").

## Output
A complete map covering 1–9, ending with the proposed sequenced plan and recommended architecture. **No code, no commits.** We scope Briefs 2+ from this.

## Push
Read-only — **no push** (nothing changes).
