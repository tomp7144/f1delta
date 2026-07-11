# Brief 11: Inbound links to race pages (complete the web)

**Status:** Ready for Cody
**Type:** Build. Read-confirm, build, verify.
**Depends on:** Brief 09 (race pages live), Brief 10 (outbound links + red arrows; `.snav-link`/`.season-nav` consolidated in `f1-table.css`).
**This is the INBOUND half of the interconnection** — links FROM the rest of the site TO race pages. Together with Brief 10 it completes the bidirectional web. This brief is also the direct answer to the original ask: **"click 2016, see every race."**

**Standing rules (from `00-standing-conventions.md`):**
- **E1 — links must be visibly clickable, not just present.** Make these obvious navigation.
- **E2 — any ad slot at a natural break**, never interrupting content.

## Part 1 — Season page → round-by-round race list (THE headline feature)

On `/standings/[year]`, add a **round-by-round list of every race that season**, each linking to its race page. This is the "click 2016, see every race" view — and specifically lets someone see the season unfold race by race (e.g. spot Hamilton's Malaysia DNF in 2016).

- A clean list/table of the season's rounds in order: round number, race name (→ `/races/[raceId]`), and useful at-a-glance info — winner (→ driver page), and ideally the date/circuit. Keep it scannable.
- **Visibly clickable** (E1): race names and winner names read as links.
- Use the shared table system (`f1-table.css` + `.table-scroll`, frozen first column, mobile scroll) so it matches the site.
- Placement: a logical section on the season page (e.g. below the championship standings, or a clearly-headed "Races"/"Season calendar" section). Report where it fits best.
- Graceful across eras: early seasons had fewer rounds — just list what exists.

## Part 2 — "All seasons" link restyle (consistency fix)

On the season-page nav row (`← 2024 / All seasons / 2026 →`), the **"All seasons"** center link still uses old muted styling while the prev/next arrows are now red + prominent. Restyle it to **match** the red arrow treatment:
- Same red color (`var(--red)`), matching weight and ~size, so the three elements read as one consistent, obviously-clickable nav row (E1).
- **No arrow glyphs** — it's a hub link (jump to the full season list), not directional. Just matching red/weight/size.
- Uses the shared `.snav-link` / `.season-nav` definition in `f1-table.css`.

## Part 3 — Circuit page → its races

On `/circuits/[id]`, ensure the circuit's races link to the individual race pages. The circuit page likely already lists races/runnings — make each one link to `/races/[raceId]` (visibly clickable). If it doesn't list races yet, add a races-held-here list linking out. Report the current state first.

## Part 4 — Grand Prix page → its runnings link to race pages

On `/grands-prix/[id]` (the aggregate GP page — e.g. all British GPs), the result-summary rows for each running exist but (per earlier audit) don't link anywhere. **Make each running row link to its specific race page** (`/races/[raceId]`). This finally connects the GP aggregate to the individual races. Visibly clickable.

## Part 5 — Driver page → their races

On the driver page (`/drivers/[id]`), the season-by-season table shows each season's stats. Add a path from a driver to the individual races they contested. Options (pick the cleanest, report):
- Link each season row to that season's races, OR
- A dedicated per-race view/link for the driver.
Confirm what's feasible with the current driver data and propose the least-cluttered approach — don't overbuild the driver page. If it's non-trivial, it's acceptable to note it and keep Part 5 minimal (a season→race path), since the driver→race connection also exists via the season round-list (Part 1) and the race result tables (Brief 10).

## Step 1 — Read-confirm

- Confirm the season data has the per-season race list (round order + race IDs) to build Part 1 — report the structure.
- Report the current state of `/circuits/[id]` (does it list races? do they link?) and `/grands-prix/[id]` (the running rows — how to make them link to race pages).
- Confirm the `.snav-link`/`.season-nav` definition location for Part 2.
- Assess Part 5 feasibility on the driver data; propose the cleanest minimal approach.
- Report, then build.

## Step 2 — Build

- Season round-by-round race list (Part 1) — the headline.
- "All seasons" restyle (Part 2).
- Circuit → races links (Part 3).
- GP runnings → race page links (Part 4).
- Driver → races path, minimal/clean (Part 5).

## Step 3 — Verify

- **`/standings/2016`:** shows every 2016 round listed in order, each race name links to its race page, winner names link to drivers. Clicking the Malaysia round → `/races/2016-malaysian-grand-prix` (the DNF race). This is the headline check — the original ask, working.
- **"All seasons"** link is now red/consistent with the arrows in the nav row.
- **Circuit** (`/circuits/[a circuit]`): races held there link to race pages.
- **GP** (`/grands-prix/[a GP]`): each running row links to its specific race page.
- **Driver:** a path from a driver to their races works (however minimal).
- **The full loop:** from `/standings/2016` → a race → (Brief 10) back out to a driver → their season → (Part 5) races → another race. Confirm you can traverse the web in both directions without dead ends.
- Tables use shared styling; mobile scrolls; links visibly clickable; no era errors.

## Step 4 — Commit

Scoped to `src/pages/standings/[year].astro`, `src/pages/circuits/[id].astro` (or CircuitPage component), `src/components/GrandPrixPage.astro`, `src/pages/drivers/[id].astro`, and shared CSS touched. No `git add -A`. Quote bracketed paths.

## Push
Build brief — **it ends in a push.** Push after review, verify live.

## After this brief
The race-pages interconnection cluster is **complete** — the site is a fully bidirectional web (season↔race↔circuit↔GP↔driver). Remaining in the broader H2H improvement: season-by-season H2H breakdown on driver pages + the DNS/DNF toggles (their own briefs). And the parked backlog (f1δ Score explanation, search tuning, etc.).
