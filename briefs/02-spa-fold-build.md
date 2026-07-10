# SPA Fold — Brief 02 of 05: Build the Astro driver route

**Status:** Ready for Cody
**Type:** Build — the heavy lift. Read-confirm placement, then implement.
**Depends on:** Brief 01 report (the full map). This is the port.

## Goal

Create `src/pages/drivers/[id].astro` — a real Astro route under BaseLayout that **prerenders all 792 driver pages as static HTML** (`getStaticPaths` over `data/drivers/index.json`, reading `data/drivers/${id}.json` in frontmatter). This replaces the standalone SPA (`public/driver.html` + `public/f1-driver.jsx`). It fixes the stale nav (inherits BaseLayout's), puts the tables on the shared system, and turns the highest-traffic section into fast, cacheable, crawlable static pages.

**Do NOT delete the old SPA files or `/api/driver` in this brief** — that's Brief 05, after the new route is confirmed working. Old and new can coexist until then.

## Two locked decisions (do not reinterpret)

1. **Body font → system-ui.** The port shifts body text from the SPA's Inter to `var(--body)` / system-ui, matching every other page. Do NOT load Inter. Do NOT make Inter site-wide. (Barlow Condensed for display + JetBrains Mono for mono still load as elsewhere.)
2. **H2H fully ungated — no gate, no teaser, no upgrade panel, anywhere.** Pro is removed; nothing is gated. Render the **full teammate H2H table** to everyone, using the **complete** driver data including `teammates[]`. **Read `data/drivers/${id}.json` directly in frontmatter and use the full object — do NOT route through `/api/driver` or its `freeView()`.** The gate components (`H2HGate`, `gpanel`, ghost/skeleton rows, gradient overlay) are NOT ported — they cease to exist on the new page.

## Data sources (all read at build time in frontmatter)

- `data/drivers/index.json` → `getStaticPaths` (792 ids).
- `data/drivers/${id}.json` → the driver's full data (identity, `totals`, `career[]`, `teammates[]`).
- `data/people/by-driver.json` → engineer data (37 drivers; render nothing if absent).
- `public/fantasy/by-driver/${id}.json` → f1δ fantasy score (use `existsSync`; if missing, omit the section).
- **Salary:** move `window.F1_SALARIES` (currently inline in `driver.html`) into a data file — `data/salaries.json` (or a frontmatter import). 22 drivers; render the salary card only if the driver has an entry.
- **Road to F1:** move the hardcoded `RTF1` + `RTF1_TL` objects from the JSX into `data/rtf1.json` (or a frontmatter const). 22 current-grid drivers; render only if present.

## Sections to port (all 10 from the Brief 01 inventory — checklist)

Port every section. Order top to bottom. Three are **dropped** (replaced by BaseLayout), noted below.

1. ~~TopBar nav~~ → **DROP.** BaseLayout provides the nav (correct 8-link set + People dropdown + Donate). The page renders through BaseLayout; no page-level nav.
2. **Driver header (Identity):** code (red) + name (Barlow) + active/inactive years + 6 stat boxes (Starts/Wins/Podiums/Poles/Titles/Points). Bespoke CSS — preserve the look. `d.totals.championships ?? 0` for Titles.
3. **Season-by-season (CareerTable):** columns Season (→ `/standings/[year]`), Team (dot + → `/teams/[id]`, alt teams), ENT, R, Win, Pod, Pole, Pts, WDC. Championship rows keep gold tint + left border. **Use the shared table system** — `data-driver-table` + `f1-table.css` + `.table-scroll` (horizontal scroll, frozen first column). Sortable via the existing `f1-records.js` sorter — add `data-season`, `data-wins`, etc. to `<tr>`. **ENT is sparse** — some drivers lack it (Verstappen); render `?? ""` per cell, keep the column.
4. **Race engineer (EngineerSection):** current (red border, name → `/people/[id]`, team → `/teams/[id]`, since year) + past list. Bespoke CSS. Render nothing if no engineer data.
5. **Ad slot:** keep a simple ad placeholder div (it was previously free-tier-only; since nothing's gated, just always render the slot). Simplify as needed.
6. **Teammate H2H:** **full table, ungated** (see locked decision 2). Columns per the SPA's `H2HPro`: teammate (→ driver page), qualifying + race bars, points. Sorted "most races first" — **sort once in frontmatter**, emit static HTML. Shared table styling where it fits; the qualifying/race bar visuals are bespoke — preserve them.
7. **Road to F1 (RoadToF1 + RoadToF1Timeline):** two sub-cards (prose + visual timeline) from the moved `rtf1` data. Bespoke CSS. 22 drivers only.
8. **f1δ Fantasy Score (FantasySection):** Year/Races/Score/Avg table + career tfoot, from `public/fantasy/by-driver/${id}.json`. Shared table styling. Omit section if the file is absent.
9. **2026 Salary (SalarySection):** gold-border card (Est. annual / Contract through / Base-bonus / Source) from the moved salary data. Bespoke CSS (the gold `#d4b87a` / `#fbf3d0` is unique to this card — preserve). Render only if the driver has salary data.
10. ~~Mini footer~~ → **DROP.** BaseLayout's footer replaces it.

## Styling

- **Tables** (CareerTable, H2H, FantasySection) → shared `f1-table.css` + `tokens.css` + `.table-scroll`. Port the column-specific classes (`td.yr`, `td.tm`, `td.n`, `td.h2`, `td.wdc`, `td.who`, `td.pts`) as needed to preserve alignment/emphasis.
- **Bespoke, preserve:** driver header/stat boxes, engineer card, salary card (the gold), Road to F1 prose + timeline, H2H bar visuals.
- All colors via `tokens.css` variables — no new hardcoded hex beyond the salary gold (which is already the one intentional exception).
- **No sticky headers** (site-wide decision — incompatible with `.table-scroll`).

## Interactivity

- Only the CareerTable column sort survives, via the existing `f1-records.js` pattern (plain HTML table + `data-*` attributes + shared sorter). Everything else becomes static HTML.
- No React, no Babel, no client fetch on the new page (fantasy data is baked in frontmatter).

## Step 1 — Read-confirm before building

- Confirm the frontmatter can read all data sources listed above (paths exist, shapes match). Report the salary + rtf1 data shapes so the move to JSON is clean.
- Confirm `getStaticPaths` over `index.json` yields exactly 792 ids and each has a `data/drivers/${id}.json`.
- Confirm the shared `f1-records.js` sorter can drive the CareerTable with `data-*` attributes (same as other sortable tables).
- Report, then build.

## Step 2 — Build

- Create `data/salaries.json` and `data/rtf1.json` (move the data out of `driver.html` / the JSX).
- Build `src/pages/drivers/[id].astro` with `getStaticPaths` (prerender all 792), all sections per the checklist, shared table system for tables, bespoke CSS preserved for the rest, full ungated H2H, system-ui body.
- The new route is `/drivers/[id]` (e.g. `/drivers/max-verstappen`). The old `/driver?d=X` still exists (SPA not deleted yet) — that's fine; redirects come in Brief 03.

## Step 3 — Verify

- `/drivers/max-verstappen`, `/drivers/lewis-hamilton`, `/drivers/fernando-alonso` render through BaseLayout with the **correct nav** and BaseLayout footer.
- **All applicable sections present** — walk the 10-item checklist per test driver (accounting for optional sections: engineer/fantasy/salary/rtf1 absent for some).
- **H2H shows the full table, ungated** — no teaser, no ghost rows, no upgrade panel.
- Season table: sortable, championship rows tinted, ENT handled for a driver without it (Verstappen) and with it (Hamilton).
- Tables use shared styling; mobile ≤380px scrolls horizontally with frozen first column, page doesn't scroll.
- Salary card gold preserved; Road to F1 renders for a current driver; body text is system-ui.
- Build succeeds; ~792 pages generated; no console errors on the new page.
- **Old SPA (`/driver?d=X`) still works** — not touched this brief.

## Step 4 — Commit

Scoped to: `src/pages/drivers/[id].astro` (new), `data/salaries.json` (new), `data/rtf1.json` (new). No `git add -A`. Quote bracketed paths.

## Push
This is a build brief — **it ends in a push.** Push after review, then verify the new `/drivers/[id]` pages live before we do Brief 03 (redirects).
