# Brief: Table consolidation (Astro tables)

**Status:** Ready for Cody
**Type:** Build — read-and-report first, then implement in layers. Layers 1–3 are low-risk; Layer 4 is a derive change.
**Prerequisite:** Token consolidation (`public/tokens.css`) is done — this builds on it.

## Scope and non-scope (read this first)

**In scope:** the ~24 Astro-rendered tables (the `data-record-table` family + the non-sortable inline `<table>`s + the two custom-sorter tables). Goal: one consistent table look, team-name links wired everywhere, and uniform mobile behavior.

**Explicitly OUT of scope — do NOT touch:**
- **The driver SPA** (`public/f1-driver.jsx`, `driver.html`) and its three tables (season-by-season, H2H, f1δ Score). These are React-in-`public/`, can't import Astro CSS, and get token-matched + fully merged at the **SPA fold** (a later, separate brief). Do not wander into the SPA. Its tables already read `tokens.css`, which is all they get for now.
- **Records hub** (`RecordsHub.astro`) — it's a button/directory grid, not a table. Separate brief.
- **Structural component merging** — do NOT rebuild the tables into one Astro component with slots. The audit found per-cell logic spread across 8+ components; a structural rewrite risks regressions on a site we just stabilized. **This is CSS + link wiring on the existing structures, not a rewrite.**

This is a **shared-styling** consolidation, not a structural one. Existing `<table>` structures and their sorters stay intact.

## Layer 1 — One shared table style block (do first; near-zero risk)

The `data-record-table` tables share structure but their CSS is copy-pasted with drift: font-size varies (13px / 14px / 15px for RecordBoard) and padding varies (`7px 10px` vs `8px 12px`).

- Create one shared table style source. Preferred: a `TableStyles.astro` snippet (or a shared stylesheet) that defines the canonical table appearance using `tokens.css` variables — header treatment, row rhythm/borders, hover, **right-aligned tabular/mono numerals for numeric columns**, cell padding, font-size. One definition.
- Apply it to **all** in-scope Astro tables: the 13 `data-record-table` tables, the 5 non-sortable inline `<table>`s (standings `[year]` WDC/WCC/Races, circuit layouts, team engineers, leadership roles), and the 2 custom-sorter tables (drivers index, standings index).
- Remove the per-component copy-pasted table CSS these tables currently carry, so the shared block is the single source. Confirm on read which components have their own table CSS before deleting.
- **Do not change any table's structure, columns, or sort logic in this layer.** Appearance only. The custom sorters (drivers index, standings index) keep their existing JS untouched — they just adopt the shared look.

**Acceptance:** every Astro table shares one font-size, padding, header style, and number alignment. "Columns don't line up" and "inconsistent look" resolve here. Numeric columns are right-aligned mono.

## Layer 2 — Wire render-side team links (IDs already present)

Several tables show team names as dead text where the team ID already exists in the data — pure render-side fixes:

- **Home — latest result** and **Home — WDC standings** (inline React in `index.astro`): team name `.tn` is dead. `latest-race.json` / `standings.json` — confirm whether a team ID is present; if the identifier exists, wire team → team page. (Report if the ID is genuinely absent — that would push it to Layer 4 style.)
- **Home — fantasy mini (top value)**: `d.team` column is dead text.
- **Drivers never-started**: driver name and Teams column are dead text — wire driver → driver page at minimum; team → team page if the ID is present.
- **GrandPrixPage callout cards** ("Most wins"/"Most poles"): driver names have no link though IDs exist in the stats object — wire them.

For each: link only if the identifier is actually in the data. Report any that lack it. Every driver name in an Astro table should link to the driver page; every team name to the team page, wherever the ID exists.

## Layer 3 — Mobile: horizontal scroll with a frozen entity column (NO data hidden)

**Non-negotiable, stated by Tom: no column is ever removed or hidden on mobile. Every column that shows on desktop shows on mobile.** The fix is that the table *fits* by scrolling sideways inside its own container — not by dropping data. Do NOT use `display:none`, `data-hide-mobile`, or any column-hiding approach. If any earlier proposal or attribute added column-hiding, remove it.

Mechanism:
- Wrap every in-scope Astro table in a scroll container (e.g. `<div class="table-scroll">` with `overflow-x: auto` and momentum scrolling `-webkit-overflow-scrolling: touch`). The table keeps all columns and scrolls horizontally *within this container only*.
- **Freeze the first column** (the entity/identity column — Driver, Team, Circuit, Year, Rd, #, Engineer, Name, etc.) so it stays visible while the rest scrolls, so the reader never loses track of which row they're on. Implement with `position: sticky; left: 0;` on the first `<th>`/`<td>`, with a solid `var(--surface)` (or `var(--bg)`) background so scrolling columns don't bleed through, and a subtle right border/shadow to mark the frozen edge.
- One shared rule in the shared table style block covers all in-scope tables — no per-table column decisions needed (that whole propose-and-approve step is now moot; there is no hide-list).

The page-level constraint still holds: **the *page* must not scroll horizontally at ≤380px** (that looks broken). A *table* scrolling sideways inside its own bounded container is the intended, normal pattern and does not violate that — the container clips to the page width and scrolls internally.

**Acceptance:**
- On a ≤380px viewport, every in-scope table shows all its columns, reachable by swiping the table horizontally; the first column stays frozen and legible while the others scroll; the frozen column has a solid background (no bleed-through).
- The page itself does not scroll horizontally — only the table containers do.
- No column is hidden or removed anywhere. Diff confirms zero `display:none`/hide rules on table columns.

**If Tom tests it and dislikes the feel, the mechanism can be swapped (e.g. tap-to-expand rows) — but data is never dropped as the solution.**


## Layer 4 — PeopleHub team IDs (derive change; do last)

The principals/technical-directors hub (`PeopleHub.astro`) shows a Teams column as dead text because `p.teams` is a **string array of names only — no IDs**. To make it clickable, team IDs must be carried through the derive pipeline.

- **Read and report first:** how `data/people/*.json` is derived (`derive-people.mjs`), where `teams` is populated, and whether team IDs are resolvable at that point (match team name → team ID from the teams source). Report the plan before writing.
- Add team IDs alongside names in the people derive output (don't remove the names — add IDs).
- Wire the PeopleHub Teams column to link each team → team page.
- Verify the individual person/principal pages that also render teams get the same treatment if they share the data.

## Step order and commits

1. Read-and-report across all layers first (which components carry their own table CSS; where team IDs exist vs. don't; the PeopleHub derive path). **Report, then implement.**
2. Layer 1 → verify visual parity/consistency → commit.
3. Layer 2 → verify links → commit.
4. Layer 3 → wrap tables in scroll containers + freeze first column (no hide-lists — none needed) → verify all columns reachable and page doesn't scroll at ≤380px → commit.
5. Layer 4 → report derive plan, implement → verify → commit.

Each layer is its own scoped commit. No `git add -A`. Quote bracketed paths. One layer verified before the next.

## Verify (whole brief)

- Every Astro table shares one look; numeric columns right-aligned mono; no font-size/padding drift.
- Driver names link to driver pages; team names link to team pages everywhere the ID exists (report any that don't).
- PeopleHub Teams column links through to team pages.
- At ≤380px: no *page* horizontal scroll; each table scrolls internally with all columns reachable and the first column frozen. No column hidden anywhere.
- **The driver SPA is untouched** (its tables unchanged — confirmed by diff scope).
- Records hub untouched.
- Existing sorters (drivers index, standings index, `data-record-table` sorter) all still work.
