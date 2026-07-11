# Brief: Universal search (Layer 1) — read-and-report

**Status:** Ready for Cody
**Type:** Read-and-report ONLY. No code. Foundation for the Layer 1 build brief.
**Context:** Homepage search currently matches only `window.F1_DRIVER_INDEX` (792 drivers). We're expanding to **universal direct search** across every entity type on the site — drivers, people, teams, circuits, Grands Prix, seasons, and (TBD) records — with results **grouped by type** and linking to the right page. This brief maps what's searchable and confirms the index architecture before anything is built. (A later "Layer 2" adds category results like "→ 47 British drivers" — out of scope here.)

## What to report — no code

### 1. Entity inventory + searchable fields
For EACH entity type, report: where its baked data lives, how many records, its page URL pattern, and **which fields exist that search could match against**. Cover:

| Entity | Data file(s) | URL pattern | Searchable fields present? |
|---|---|---|---|
| Drivers | `data/drivers/index.json`? | `/drivers/[id]` | name, code, **nationality?**, years? |
| People (engineers, principals, tech directors) | `data/people/*`? | `/people/[id]` | name, role, team? |
| Teams | ? | `/teams/[id]` | name, nationality? |
| Circuits | ? | `/circuits/[id]` | name, **location/country?** |
| Grands Prix | ? | `/grands-prix/[id]` | name, country? |
| Seasons | ? | `/standings/[year]`? | year, champion? |
| Records boards | `index.json` (RecordsHub) | `/records/...` | title? |

For each: list the **actual field names** present in the baked data (not assumed). Specifically confirm whether **nationality** exists in the drivers/teams data (owner noted it's not shown on the site — report whether it's in the data anyway). This tells us what Layer 1 can match today and what Layer 2 would need.

### 2. The index architecture — the key decision
Report the data-size reality so we choose correctly:
- **Total record count** across all entities (rough), and the approximate **byte size** of a combined minimal search index (just the fields needed: display name, type, id/url, and any matchable text like code/location).
- Assess the two options and recommend one:
  - **A — inline** the combined index into the homepage HTML at build time (like `F1_DRIVER_INDEX` now). Report whether the total size would meaningfully bloat the homepage payload.
  - **B — a baked `search-index.json`** (e.g. in `public/` or built via an endpoint) the page fetches once on first keystroke/focus. Keeps the homepage light and lets search be reused site-wide later.
- Recommend A or B with the size reasoning. (Leaning B if the combined data is non-trivial, but decide from real numbers.)

### 3. How search currently works
- Report the current inline search implementation in `src/pages/index.astro` (the `window.F1_DRIVER_INDEX` matcher): how it filters, renders results, and links. This is what we extend — report what changes to make it multi-entity.

### 4. Grouping + linking
- Confirm each entity's correct destination URL so grouped results link right (`/drivers/[id]`, `/people/[id]`, `/teams/[id]`, `/circuits/[id]`, `/grands-prix/[id]`, `/standings/[year]`).
- Propose a sensible group order (e.g. Drivers → Teams → People → Circuits → Grands Prix → Seasons) and a per-group result cap (e.g. top 5).

### 5. Recommendation
Propose the Layer 1 build plan: the index approach (A/B), what fields each entity contributes, grouping/limits, and any surprises (missing IDs, inconsistent slugs, entities whose data isn't easily indexable).

## Output
The entity/field inventory table, the index-architecture recommendation with size numbers, and the proposed build plan. **No code, no commits.** We scope the Layer 1 build brief from this.

## Open question for the owner (surface in the report if relevant)
- **Records boards** — include in universal search, or leave out? (They're leaderboards, arguably searched-by-name less than entities.) Report the record titles so the owner can decide.

## Push
Read-only — **no push.**
