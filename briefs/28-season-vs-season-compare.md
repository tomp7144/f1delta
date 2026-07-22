# Brief 28 — Season-vs-season Compare mode

**Purpose:** Let a user compare any two **specific seasons** — Schumacher 2001 vs Senna 1992 — via a year dropdown on each column, at a real, shareable URL. f1δ is computed per season, so this is the metric's most native comparison: each season scored against its own era's maximum, head to head.

**Depends on:** Brief 27 (f1δ row group + season-shape strip on the compare grid). Reuses that structure; makes it mode-aware.

**Push status:** Cody commits (scoped). Tom reviews + pushes.

---

## Step 0 — READ AND REPORT

1. **Slug parsing safety (blocking).** The current compare slug splits on `-vs-`. Season mode appends a 4-digit year to each side: `michael-schumacher-2001-vs-ayrton-senna-1992` → split on `-vs-` → strip a trailing `-YYYY` from each half. **Confirm no F1DB driver ID ends in a 4-digit number** (grep the driver index). If any do, report and stop — the separator needs rethinking before anything is built. (U1: lock the URL before building.)
2. **Per-season data availability.** Confirm each driver JSON's `career[]` season entries carry: `races`/`entries`, `wins`, `podiums`, `poles`, `points`, `wdcFinish`, `teams[]`/`primaryTeamId`. **Report whether `fastestLaps` exists per season** — if not, that row is simply omitted in season mode (do not fabricate). Confirm `f1delta.seasons[]` carries year, value, and `rank` (Brief 26).
3. **Brief 27 grid structure.** Report how the row groups and `higherIsBetter` schema are defined, so rows can become mode-aware with minimal rework.

---

## Step 1 — URL structure (locked, U1)

- **Career mode (existing, unchanged):** `/compare/[a]-vs-[b]`
- **Season mode (new):** `/compare/[a]-[yearA]-vs-[b]-[yearB]`
  - Example: `/compare/ayrton-senna-1992-vs-michael-schumacher-2001`
  - **Canonical ordering stays alphabetical by driver ID** (same rule as career mode); a reversed request 301s to canonical, carrying the years with their drivers.
  - Invalid year for that driver (didn't race that season) → **404**, not a broken page.
- SSR, `prerender = false`, same `Cache-Control` as career mode.
- **Not sitemapped.** These are an on-site exploration surface, not an SEO play — the combinatorics are enormous and search demand is thin. They work on demand and are crawlable if linked; they don't go in `sitemap-compare.xml`.

---

## Step 2 — Mode + dropdowns

- A **page-level mode control**: `Career` ⇄ `Season`. Career is the default (existing behavior).
- In **Season mode**, each column gets a **year dropdown** listing only the seasons that driver actually raced (from `career[]`). Default each to that driver's **peak f1δ year** (`peakYear`) — a sensible, interesting starting point rather than an arbitrary one.
- Changing either dropdown **navigates** to the corresponding URL (real page, cacheable, shareable). Do not re-render in place without a URL change.
- **Mixed mode is not permitted.** Career-vs-season (e.g. Hamilton's 105 career wins vs Senna's 8 in 1988) would produce meaningless directional highlighting and is a data-integrity hole. The page-level mode makes it structurally impossible — keep it that way.

---

## Step 3 — Season-mode grid semantics

Same row groups as Brief 27, with values scoped to the selected season:

| Group | Season-mode content |
|---|---|
| **Season** (replaces Career) | Year, team(s) that season, races/entries, WDC finish |
| **f1δ SCORE** | **Season f1δ** + **rank that season** (e.g. "84.7 · #1"). Career-only lenses — peak, seasonal wins/podiums, dominant stretch — are **omitted**, not zeroed. |
| **Wins & podiums** | That season's wins, podiums, poles (+ fastest laps only if the field exists, per 0.2) — still labeled era-dependent |
| **Rates** | That season's win%/podium%/pole% — **label them "season rate," not "career rate."** (Reusing the career-rate label here would be wrong.) |
| **Points** | That season's points, with the existing scoring-era caveat |

Directional highlighting (C4) applies as normal — both sides are the same unit, so the comparison is valid.

**Season-shape strip:** keep it, and **highlight the two selected seasons** within each driver's career strip — so a user sees the chosen year in the context of the whole career arc. This is the strip earning its keep twice.

---

## Step 4 — Cross-links (E1, red/tappable)
- Each selected year → `/standings/[year]`
- Both driver names → `/drivers/[id]`
- Team(s) that season → `/teams/[constructorId]`
- H2H cross-link: keep the existing career-mode behavior (census lookup on the driver pair, independent of selected years).

---

## Step 5 — M1 explanation

Per Rule M1, season mode carries a short explanation next to the f1δ row (reuse the Brief 26 component; add this line):

> Each season is scored against the maximum points available that year, so seasons from different eras compare directly — a dominant 1992 and a dominant 2001 both land near 100 even though a win was worth different points in each. Rank is where that score placed among every driver who raced that season.

---

## Step 6 — Verify

1. `/compare/ayrton-senna-1992-vs-michael-schumacher-2001` renders: season f1δ + rank for both, season-scoped rows, "season rate" labels, both selected years highlighted in the strips.
2. Dropdown change navigates to the correct canonical URL; reversed order 301s correctly.
3. Invalid year for a driver → 404.
4. Career mode is **unchanged** (Brief 27 behavior intact) — this is the regression check.
5. Values match `/f1delta` boards and the driver page for those seasons (one computed source, no drift).
6. Mobile ~380px: dropdowns usable, no horizontal scroll.

## Step 7 — Commit (scoped)
`git add "src/pages/compare/[slug].astro"` (**quote it** — zsh glob) + any dropdown JS/CSS. Named paths, not `-A`.
Commit: `Brief 28: season-vs-season compare mode`. Not pushed.

---

## Handoff
**Brief 29 — Methodology page:** assembles the M1 explanation copy into the canonical E-E-A-T reference; links Compare (career + season modes) and the three f1δ leaderboards as the showcase.

## Definition of done
- [ ] Slug parsing confirmed safe (no driver ID ends in 4 digits); URL locked.
- [ ] Season mode live at `/compare/[a]-[yearA]-vs-[b]-[yearB]`; canonical ordering + 301; invalid year 404s.
- [ ] Page-level mode toggle; per-column year dropdowns defaulting to peak year; **mixed career/season impossible**.
- [ ] Season-scoped rows with "season rate" labels; career-only f1δ lenses omitted; selected seasons highlighted in the strips.
- [ ] Career mode unchanged; values match the leaderboards.
- [ ] Not sitemapped; M1 explanation present; mobile-safe.
- [ ] Scoped, quoted commit; not pushed.
