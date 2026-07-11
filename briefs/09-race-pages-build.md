# Brief 09: Build individual race pages

**Status:** Ready for Cody
**Type:** Build — the big generation brief. Read-confirm, build, verify.
**Depends on:** Brief 08 report — race data is already baked in `race-{id}.json`; all interconnection IDs present; slug already unique.
**Locked decisions (do not reinterpret):**
- **URL: `/races/[raceId]`** — flat, using the existing unique slug (e.g. `/races/2016-malaysian-grand-prix`). Not nested under another route.
- **Sparse-era handling: render what exists, omit what doesn't.** No "N/A", no empty boxes, no breaking on missing fields. Early races (1950s) lack qualifying / gaps / fastest lap in places — a section simply doesn't render when its data is absent, exactly like driver pages omit salary/Road-to-F1 when absent.

## Goal

Generate a static page for **every race in F1 history** (~1,500) at `/races/[raceId]`, rendering that race's full detail from the existing baked `race-{id}.json` data — via `getStaticPaths`, prerendered, through BaseLayout, styled with the shared table system. This brief builds the pages themselves; **interconnection wiring is Brief 10**, the **season round-list is Brief 11**. Build these as first-class pages consistent with the rest of the site.

## Scope

**Build:**
- `src/pages/races/[raceId].astro` — `getStaticPaths` enumerating every race (from whatever data source lists all races — confirm in Step 1), reading each `race-{id}.json` in frontmatter, prerendered.
- Through **BaseLayout** (correct nav + footer — do not hand-roll a shell).
- **Search indexing (RULE S1 — required, not optional):** update `derive-search.mjs` to add a **"Races"** group — each race indexed with label (e.g. "2016 Malaysian Grand Prix"), type `race`, url `/races/[raceId]`, and matchable fields: year, GP name, circuit name, country. Regenerate `search-index.json`. Confirm races appear in homepage search after build.

## Page content (render what exists; omit sections whose data is absent)

Report exact available fields in Step 1, but target this structure:

1. **Header:** race name + year (e.g. "2016 Malaysian Grand Prix"), round number, date, circuit name, and a one-line context (round X of Y).
2. **Race result table** (the core): finishing position, driver (+ code), constructor, grid, gap/time, points, status (DNF + reason where applicable). Shared table system (`f1-table.css` + `.table-scroll`, frozen first column, mobile scroll). DNFs shown clearly (position or "DNF" + reason).
3. **Qualifying table** (if present): quali position, driver, time. Omit entirely if the race has no qualifying data (early eras).
4. **Fastest lap** (if present): driver + time. Omit if absent.
5. **Race meta:** any additional present data — pole, laps, etc. Omit what's absent.

Do NOT render placeholders/"N/A"/empty tables for missing data — the section is simply not output.

## Styling

- Shared table styling (`f1-table.css`) + `tokens.css` + `.table-scroll` for all tables (frozen first column, horizontal scroll on mobile, no page overflow).
- **No sticky headers** (site-wide decision — incompatible with `.table-scroll`).
- Consistent with driver/season/circuit pages. Bespoke styling only where genuinely needed; prefer the shared system.

## Interconnection — NOTE

Full bidirectional wiring is **Brief 10**. In THIS brief, it's acceptable and encouraged to make the obvious in-page links where the ID is already at hand and trivial (e.g. driver names in the result table → `/drivers/[id]`, constructor → `/teams/[id]`, circuit → `/circuits/[id]` in the header). But the *systematic* reverse-linking (season round-list, circuit's races list, GP runnings linking, driver's races) is Brief 10 — don't build those here. If cleaner to defer ALL linking to Brief 10, that's fine too — just note the choice.

## Step 1 — Read-confirm before building

- Confirm the data source that enumerates **all races** for `getStaticPaths`, and the `race-{id}.json` structure (exact fields available, and which vary by era).
- Report a modern race (2016 Malaysian GP) vs. an early race (a 1950s round) field-by-field, so the "render what exists" logic is built against reality.
- Confirm `derive-search.mjs`'s current structure so the Races group is added cleanly (RULE S1).
- Confirm the race slug is unique and stable across all ~1,500.
- Report the plan, then build.

## Step 2 — Build

- `src/pages/races/[raceId].astro` with `getStaticPaths` (all races), the content structure above, graceful omission for absent data.
- Update `derive-search.mjs` + regenerate `search-index.json` to include races (RULE S1).
- Prerender all races.

## Step 3 — Verify

- **Modern race:** `/races/2016-malaysian-grand-prix` renders full result + qualifying, DNFs shown with reasons (this is the Hamilton-DNF race — confirm his retirement shows correctly), through BaseLayout with correct nav.
- **Early race:** a 1950s race renders its result table and **cleanly omits** qualifying/fastest-lap sections it lacks — no empty boxes, no "N/A", no errors.
- **Search (RULE S1):** on the homepage, "2016 malaysian" (and once S2 multi-word tuning lands, "malaysia 2016") surfaces the race under a Races group, linking to `/races/2016-malaysian-grand-prix`.
- **Tables:** shared styling; mobile scrolls horizontally with frozen first column; page doesn't overflow.
- **Scale:** build succeeds, ~1,500 race pages generated, no errors, homepage payload unaffected (search index still fetched, not inlined).
- Spot-check 3-4 races across eras (a 1950s, a 1990s, a 2010s, a 2020s) for graceful rendering.

## Step 4 — Commit

Scoped to: `src/pages/races/[raceId].astro` (new), `derive-search.mjs`, and the regenerated `public/search-index.json`. No `git add -A`. Quote bracketed paths.

## Push
Build brief — **it ends in a push.** Push after review, verify live (spot-check races across eras + confirm race appears in search).

## Next in cluster
Brief 10 — bidirectional interconnection (race ↔ season/circuit/GP/drivers, both directions). Brief 11 — season round-by-round list on `/standings/[year]` (the "click 2016, see every race" view). Then the H2H layer (season-by-season breakdown + DNS/DNF toggles).
