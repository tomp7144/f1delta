# Brief 08: Individual race pages — read-and-report

**Status:** Ready for Cody
**Type:** Read-and-report ONLY. No code. Foundation for the race-pages build cluster.
**Context:** We're building an individual page for **every race in F1 history** (~1,500) — e.g. a "2016 Malaysian Grand Prix" page with full race results + qualifying — and wiring each into its season, circuit, Grand Prix, and every driver in the field, bidirectionally. This is the connective-tissue layer that ties the site's siloed data together at the event level. This brief maps what exists and locks the URL structure before anything is generated, because ~1,500 pages of internal links and SEO depend on getting the structure right once.

## What to report — no code

### 1. Does per-race data already exist in the baked data?
The season tables and teammate H2H had to compute per-round results, so per-race data likely already exists somewhere. Report:
- Where race-level results live in the baked data (a per-race file? embedded in season data? in the driver/GP data?). Show the actual structure.
- For a given race (use **2016 Malaysian GP** as the test case), what's available: finishing order (all drivers, positions, DNFs/reasons), qualifying results, grid, fastest lap, points, gaps? List the actual fields present.
- **Bottom line:** is the race-by-race data already baked (so this is "structure existing data into pages"), or does it need to be derived/sourced? This determines the size of the whole project.

### 2. Do any per-race pages already exist?
- Confirm what `/grands-prix/[id]` pages currently are — aggregate (all runnings of a GP, e.g. every British GP) vs. a specific race. Report their structure.
- Is there ANY existing page for a single, specific race (year + GP)? Almost certainly not, but confirm.

### 3. URL + ID structure — the key decision (lock before building)
Propose the cleanest URL pattern for individual race pages, considering SEO and consistency with existing routes. Options to weigh:
- `/races/2016-malaysia`
- `/grands-prix/malaysia/2016` (nested under the existing GP route)
- `/seasons/2016/malaysia` or similar
Report:
- Which is cleanest for SEO (indexable, readable, "2016 Malaysian Grand Prix" as a distinct URL) and most consistent with current routing.
- The **ID/slug scheme** — how each race is uniquely identified (year + GP slug? a race ID in the data?). Confirm the data supports generating a stable unique slug per race.
- How `getStaticPaths` would enumerate all races (the data source that lists every race ever).
- **Approximately how many pages** this generates (confirm the ~1,500 estimate against the actual race count).

### 4. The interconnection map (the actual value — map every bidirectional link)
For a race page, report what it links TO and what should link BACK, so we build the web, not just pages:
- Race → **Season** (`/standings/[year]`) and Season → race (the round-by-round list).
- Race → **Circuit** (`/circuits/[id]`) and Circuit → its races.
- Race → **Grand Prix** (`/grands-prix/[id]`) and GP → its specific runnings.
- Race → **every driver in the field** (`/drivers/[id]`) and driver → the races they ran (does the driver season table already imply this?).
- For each link direction, confirm the ID needed to build it is present in the data (e.g. does the race data carry circuit ID, GP ID, driver IDs?). Flag any link that can't be built because an ID is missing.

### 5. Proposed build plan
Given the above, propose the sequenced build:
- Generating the ~1,500 race pages (data → `getStaticPaths` → page template).
- Wiring the bidirectional links.
- Adding the season round-by-round list (on `/standings/[year]`) linking to each race page.
- Note anything that makes it harder than "template + static generation" (missing IDs, inconsistent data across eras — early-1950s races may have sparser data than modern ones; report how gaps should be handled).

## Output
The data-availability finding (already-baked vs. needs-work), existing-page audit, a **recommended URL/ID structure with reasoning**, the full bidirectional interconnection map (with any missing-ID flags), and the proposed build sequence. **No code, no commits.** The race-pages build briefs are scoped from this.

## Note
This is the first of a multi-brief cluster (race pages → interconnection → season round-list → season-by-season H2H → DNS/DNF toggles). Do NOT build here — this read locks the foundation (especially the URL structure) that everything downstream depends on.

## Push
Read-only — **no push.**
