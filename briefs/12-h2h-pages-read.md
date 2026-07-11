# Brief 12: Teammate H2H pages — read-and-report

**Status:** Ready for Cody
**Type:** Read-and-report ONLY. No code. Foundation for the Teammate H2H build cluster.
**Context:** Building dedicated **teammate head-to-head pages** — `/h2h/[pairing]` (e.g. Hamilton vs Rosberg) — for every teammate duo in F1 history, with season-by-season breakdown, qualifying + race H2H, DNS/DNF toggles, and rate context. Each is a static SEO surface and a rabbit-hole node. The driver page keeps a scannable H2H **summary** (the browsing/discovery fun) linking out to these full pages. This brief maps the data and locks the structure before building. (A SEPARATE later feature — an interactive any-two-drivers "compare tool" — is NOT part of this cluster.)

**Locked decisions (do not reinterpret):**
- **Teammate pairings only** — drivers who actually shared a team (real head-to-head, same machinery). NOT any-two-drivers.
- **URL: `/h2h/[driver1]-vs-[driver2]`, alphabetical by driver ID** — one canonical page per pairing (never both `a-vs-b` and `b-vs-a`). Both drivers' pages link to the same URL.
- **H2H default counting rule** (locked long ago, carries forward): a round counts only if **both drivers have `positionNumber != null AND reasonRetired == null`** (both cleanly classified/finished). Invariant: `wins + losses === races` in default mode.
- **Toggles:** Include DNF / Include DNS widen the count (per the previously-locked semantics — DNF adds classified-but-retired rounds; DNS/unclassified add to races-contested only). Toggles break the invariant deliberately; display shows the excluded/incomparable count.

## What to report — no code

### 1. Season-level H2H data — does it exist?
The current driver-page teammate H2H is a **career** aggregate. It must have been computed FROM per-season/per-round data, so the season-level breakdown likely already exists in derive.
- Report where teammate H2H is computed (`derive-f1.mjs`?) and whether **per-season** H2H (qualifying + race, per year, per pairing) is already available or needs deriving.
- For a test pairing (**Hamilton vs Rosberg**), report what's available per season: 2013/2014/2015/2016 — qualifying H2H, race H2H, points each. This is the headline data (shows the year Rosberg flipped it).

### 2. The pairing list + page count
- Report the authoritative source for "every teammate pairing in history" (the data that lists who was whose teammate, per season). Confirm a `getStaticPaths` can enumerate all unique pairings.
- **Report the approximate page count** (how many unique teammate pairings exist across F1 history). Confirm each pairing has a clean, stable, unique slug (alphabetical driver IDs).
- Note pairings that span multiple non-consecutive stints (e.g. teammates, split, reunited) — how the data represents that.

### 3. Rate data (for era-fair context — Rule: show rates, not just totals)
- The Records report found a **"Rates" scope** (win rate, podium rate, pole rate). Report where this rate data lives and whether it's accessible per-driver for use on H2H pages (and later the compare tool).
- Confirm which rates are available: win %, podium %, pole %, points-per-race, finish %? Report the exact fields.

### 4. Toggle variants — the derive complexity
The toggles recompute wins/losses/races without refetching, so variant tallies must be **precomputed and baked**.
- Report whether the current H2H derive computes ONLY the default tally, or already has the pieces for DNF/DNS variants.
- Confirm what per-round data is available to derive the three states (default / +DNF / +DNS) per season AND career, per pairing — `positionNumber`, `reasonRetired` per driver per round.
- Propose the minimal baked data shape that lets the H2H page render all toggle states (default + variants) for both career and each season, client-side, no refetch.

### 5. Driver-page summary + interconnection
- Report the current teammate H2H section on the driver page — so we know what becomes the "summary" (career H2H at a glance per teammate) and how to add a link to each `/h2h/[pairing]` page.
- Confirm the IDs needed to build the H2H page's own outbound links: both drivers (→ driver pages), the team(s) they shared (→ team page), the seasons (→ standings), and ideally the specific races they were teammates (→ race pages, from the race cluster we just built).

### 6. Proposed build plan
Given the above, propose the sequenced build:
- Generating the H2H pages (`getStaticPaths` over pairings → page template with season breakdown + qualifying/race + rates + toggles).
- The driver-page summary + links.
- Interconnection (H2H page ↔ drivers/teams/seasons/races).
- Search indexing (Rule S1 — H2H pages should be searchable, e.g. "hamilton vs rosberg" / "hamilton rosberg").
- Flag anything that makes it harder than the race-pages pattern.

## Output
Data-availability findings (season H2H + rates + toggle-variant pieces), the pairing count + URL confirmation, the derive shape for toggles, the driver-page summary plan, and the sequenced build plan. **No code, no commits.**

## Note
This is the first of a multi-brief cluster (H2H pages → driver-page summary → interconnection → search). Like races: read locks the foundation (URL, page count, derive shape) before building. The **compare tool** (interactive any-two-drivers, with era-fair rates) is a SEPARATE later cluster — not here.

## Push
Read-only — **no push.**
