# Brief: Records hub — matrix directory

**Status:** Ready for Cody
**Type:** Read-and-report FIRST (structure depends on real data), then build.
**Scope:** Rebuild `RecordsHub.astro` (the `/records` directory) only. It stays a **directory** — links to the existing record boards, not inline data. `RecordBoard.astro`, `index.json`, and the boards themselves are **untouched**.

## Goal

Replace the current button-wall (chips grouped entity → scope) with a clean **matrix directory** styled like the site's other tables: metrics down the left, scopes across the top, each cell a link to that leaderboard. Drivers and Constructors stacked with clear headers, same shape. All-time emphasized as the first scope column *within* the matrix (NOT a separate box). This kills the redundant labels for free — row "Wins" × column "Single Season" instead of "Most Wins in a Single Season."

## Known from the current component

- Data: `index.boards`, each board `{ entity, scope, slug, title }`.
- **6 scopes exist**, not 4: `career` (All-Time), `season` (Single Season), `grand-prix` (At a Grand Prix), `circuit` (At a Circuit), `rate` (Rates), `streak` (Streaks).
- Slug format appears to be `{metric}-by-{scope}` (`boardUrl` replaces `-by-`). Board link = existing `boardUrl(b)`.
- Component currently uses hardcoded hex + `system-ui` — NOT tokens/shared table CSS.
- An ad slot `<div id="records-ad-slot" data-ad-slot>` exists — **keep it**.

## Step 1 — Read and report (NO code, report and wait)

Read `index.json` and report:

1. **The full grid, per entity.** For `drivers` and for `constructors` separately: a table of **metric (rows) × scope (columns)** marking which cells have a board and which are empty. This is the shape everything depends on.
2. **Slug format check:** is it reliably `{metric-slug}-by-{scope}` for every board? List any that don't follow it. (This is how we group boards into metric rows.)
3. **Sample titles + slugs** for ~8 boards across scopes, so we can derive clean short metric labels (e.g. `most-wins` → row "Wins").
4. **THE KEY QUESTION — do metrics align across scopes?** Do `career`/`season`/`grand-prix`/`circuit` share the same count metrics (Wins, Poles, Podiums, Points…), while `rate` and `streak` have *different* metrics (win rate, consecutive wins…)? Report whether rate/streak metrics overlap the count metrics or are distinct. **This decides whether one clean matrix works, or whether Rates/Streaks need their own small sub-tables.**
5. **Propose the structure** given the real data:
   - If metrics align well → one matrix per entity (all 6 scopes as columns, empty cells where no board).
   - If rate/streak are distinct → **main matrix** (career/season/GP/circuit, shared metric rows) **+ separate small Rates and Streaks tables** below it, per entity.
   - Propose a **metric row order by prominence** — marquee first (Wins, Championships, Podiums, Poles, Points), deeper cuts (Race Starts, Race Entries, Sprint Wins, Grand Slams, Laps Raced, Driver of the Day) below.

**Report the grid + proposed structure and WAIT for confirmation before building.**

## Step 2 — Build (after structure is confirmed)

- **Per entity, stacked:** a "Drivers" section header + its matrix, then "Constructors" + its matrix. Identical shape, so understanding one means understanding the other.
- **Matrix:** metric rows × scope columns; each populated cell is a link via `boardUrl(b)`. Empty cells render blank (or a subtle `—`) where no board exists — that quietly signals "not tracked at this scope."
- **Clean labels:** row = bare metric name (strip "Most "), column header = scope name. No redundant scope words in cells.
- **All-Time = first scope column, visually emphasized** (bold and/or a subtle tint) so marquee records read as primary — but inside the matrix, not a separate box.
- **Marquee metrics as the top rows**, so top-left (top metric × emphasized All-Time column) is the most-wanted record.
- **Adopt the shared table styling** (`f1-table.css`) **and `tokens.css`** — remove the local hardcoded hex and `system-ui`. It must look like the other tables.
- **Mobile:** wrap in the same `.table-scroll` pattern as the other tables — horizontal scroll with the **first column (metric names) frozen**; scope columns scroll. **NO sticky header** (sticky headers are incompatible with the scroll wrapper — site-wide decision). Zero *page* horizontal scroll at ≤380px; the matrix scrolls internally.
- **Keep `#records-ad-slot`**, placed sensibly (e.g. between the two entity matrices, or after the last).
- If Step 1 found rate/streak are distinct: build them as the agreed separate small tables below each entity's main matrix.

## Step 3 — Verify

- `/records` renders Drivers and Constructors as stacked, same-shape matrices.
- Every cell links to the correct board — spot-check several against the old chips.
- **No record is missing** vs the old page (same set, reorganized) — count boards before/after.
- Labels are short/clean, no "Most … in a Single Season" redundancy.
- All-Time column emphasized and reads as primary; marquee record sits top-left.
- Mobile ≤380px: matrix scrolls sideways, metric column frozen, page doesn't scroll, no data lost.
- Visually consistent with the site's other tables (tokens + shared CSS).
- Ad slot present.

## Step 4 — Commit

Scoped to `RecordsHub.astro` (+ any shared-CSS addition, reported). No `git add -A`. Quote bracketed paths.

## Push
Step 1 is code-free (no push). The **build commit (Step 2/4) ends in a push.**
