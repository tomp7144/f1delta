# Brief: Table implementation audit

**Status:** Ready for Cody
**Type:** Diagnosis. Read-and-report ONLY. No code changes.
**Purpose:** The site has multiple visibly different table implementations. Before consolidating them, map exactly how many exist and whether they can converge on one shared component. This is the foundation for the table-consolidation brief — same read-first discipline as the Phase 0 structural audit.

## Why this exists

Observed across the site, the tables "look the same but not quite," plus concrete complaints:
- Columns don't line up (numbers not in aligned tabular/mono columns).
- Team names are dead text where they should be clickable links (Standings, Results, Fantasy, Team Principals all flagged).
- Driver code + team name jammed together with no spacing and no link target (Standings, Results).
- Circuits table has a different look (font/density) from the mono-styled tables.
- Records is a "jumbled mess" — but it's a grid of ~30 buttons, not a table (see note below).

We need to know whether one table component can absorb these or whether some are structurally too different.

## Investigate — report findings, change nothing

### 1. Inventory every table on the site
List each, with its route/component and file. At minimum, cover:
- Driver page: season-by-season table; f1δ Score table; teammate H2H table
- Standings index; `standings/[year]`
- Grand Prix results (the race classification table)
- Circuits index; Teams index; individual team page tables
- Fantasy table
- People hubs: engineers, principals, technical-directors; individual person page tables
- Records boards (and see §4)
- Anything else found

### 2. Per-table implementation
For EACH table report:
- **Where it renders:** an Astro component (which one), inline in an `.astro` page, or React inside the driver SPA (`public/f1-driver.jsx` / `driver.html`).
- **Markup structure:** real `<table>`, or divs/grid faking a table?
- **Column definitions:** how columns are declared; whether numbers use tabular/mono alignment and right-alignment.
- **Header treatment, row rhythm/borders, hover, striping.**
- **Mobile handling:** breakpoints, hidden columns, truncation (e.g. the driver season table hides Team via `max-width:0` ellipsis; most others appear to have nothing).
- **Cell links:** does any cell link out (driver → driver page, team → team page)? Which tables link, which show dead text?

### 3. The critical split: Astro vs. SPA
Group the tables into **Astro-rendered** vs. **driver-SPA-rendered**. This determines the consolidation approach:
- Astro tables can share one **Astro table component**.
- SPA tables (React in `public/`, no bundler) can't import an Astro component — they can only share **styling via `tokens.css`**, and become fully unified when the SPA folds into Astro later.
Report which tables fall on each side so the consolidation plan is realistic (one component for Astro + token-matched SPA tables, fully merged at the SPA fold).

### 4. Flag what isn't actually a table
- **Records** (screenshot: ~30 buttons in loose rows grouped by All-time / Single season / At a GP / At a circuit). This is a **hub/navigation layout**, not tabular data — it needs grouping/hierarchy/spacing work, not table-cell styling. Confirm its structure and bucket it **separately** from the table consolidation.
- Flag any other "table" that's really something else (button grid, card list, filter bar).

### 5. Convergence assessment
The bottom-line question: **can the Astro tables converge on one shared component?** Report:
- The common shape they share (columns, header, rows, links) that a single component could express.
- Any table too structurally different to fit, and why.
- Which tables need **team-name-as-link** added (the cross-linking gap) and whether the team identifier is already present in each table's data to build the link, or would need to be carried in.
- A proposed column-hiding strategy for mobile that could apply uniformly.

## Output

- A table: `table → where rendered (Astro/SPA) → markup type → links present? → mobile handling → converges? (Y/N)`.
- A short synthesis: how many distinct implementations exist, which can merge into one Astro component, which are SPA (token-matched now, merged at fold), and which items are NOT tables (Records hub, etc.) and belong in separate briefs.
- The team-link gap: which tables need it and whether the data supports it.

**No code, no commits. Report and wait** — the consolidation brief is scoped from this map.

## Out of scope (tracked elsewhere, do not fold in)
- The Standings champion bug — separate brief, higher priority.
- The driver-SPA nav (stale links) — fixed at the SPA fold.
- Records hub *redesign* — this audit only confirms it's not a table; its layout fix is its own brief.
