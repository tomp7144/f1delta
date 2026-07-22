# Brief 27 — Compare integration: the f1δ lenses side by side

**Purpose:** Put the full f1δ lens system on the compare grid — career, peak, and dominant stretch as rows, plus a **season-by-season shape strip** showing two careers' arcs against each other. This is the payoff surface: the one place a user can see *era-fair dominance* for any two drivers, any era, at a glance.

**Depends on:** Brief 25 (season + career f1δ) and Brief 26 (peak, seasonal wins/podiums, dominant stretch, per-season rank). **All values are already baked on the driver JSONs — this brief is presentation only, no new computation.**

**Note:** this deliberately reverses the Brief 18 constraint "no f1δ on Compare." That was correct when f1δ was an undefined mystery metric; it is wrong now that f1δ is rigorously defined, live, and self-explaining. Do not treat it as a conflict.

**Push status:** Cody commits (scoped). Tom reviews + pushes.

---

## Step 0 — READ AND REPORT

1. **The compare route.** Read `src/pages/compare/[slug].astro` (Brief 18). Report the current row-group structure (Career / Wins & Podiums / Era-fair rates / Points), the `higherIsBetter` row schema (C4), and where the ad slot + H2H cross-link sit — the f1δ block must slot in without disturbing them.
2. **Available fields.** Confirm on each driver JSON: `f1delta.career`, `f1delta.seasons[]` (each with year, value, `rank`), `peak`, `peakYear`, `seasonalWins`, `seasonalPodiums`, `dominantStretch`, `stretchStart/End`. **Report anything missing** — do not compute it here; if a field is absent, report and stop.
3. **M1 explanation copy.** Brief 26 placed explanation copy on the driver page. Report how it's stored (component? partial? inline?) so the same copy can be **reused, not rewritten**, on Compare.

---

## Step 1 — f1δ row group on the grid

Add a new row group — label **"f1δ SCORE"** with subhead *era-fair dominance* — positioned **immediately after Career, before Wins & Podiums.** Rationale: f1δ is now the site's headline era-fair verdict; the raw counts below it are era-dependent context. It should read as the answer, not a footnote.

Rows (all `higherIsBetter: true`, directional highlight per C4):

| Row | Value |
|---|---|
| **Career f1δ** | `f1delta.career` |
| **Peak season** | `peak` + `(peakYear)` |
| **Seasonal wins** | `seasonalWins` — seasons ranked #1 in f1δ |
| **Seasonal podiums** | `seasonalPodiums` — seasons ranked top-3 |
| **Longest dominant stretch** | `dominantStretch` + span `(stretchStart–stretchEnd)` |

Formatting note: "Longest dominant stretch" is a count + a span (e.g. "8 seasons · 2014–2021"). Highlight on the **count**, not the span.

---

## Step 2 — Season-shape strip (the centerpiece)

Below the f1δ row group: a compact two-row visualization, one row per driver, each bar = one season's f1δ, reusing the driver-page bar + **rank badge** styling from Brief 26 (#1 gold, #2–3 red, #4+ faint) so the two surfaces read as one system.

**Alignment — the load-bearing decision.** Default to **career-season alignment**: driver A's season 1 sits above driver B's season 1, season 2 above season 2, and so on.

*Why:* many marquee pairings never share a calendar year (Senna 1984–1994 vs Hamilton 2007–2026 — zero overlap). Calendar alignment renders those as two disjoint blocks separated by a decade of whitespace — the flagship comparison, broken. Career-season alignment compares the **shapes** of two careers — rise, peak, plateau, taper — which is the actual question ("whose prime was higher / longer?").

- Each bar **labels its real calendar year** so historical context isn't lost.
- Strip length = the longer career; the shorter driver's row simply ends (do not pad or stretch).
- **Optional toggle** — "Align: career year / calendar year" — calendar alignment is genuinely better for drivers who *did* overlap (teammates, rivals). Build it if cheap; career-year is the default either way.

**Mobile (C1 still governs):** two stacked rows of small bars must fit a narrow viewport with **no horizontal scroll** (the sticky-header/`overflow-x` incompatibility is still unsolved — don't reintroduce it). For very long careers (20+ seasons), shrink bar width rather than scrolling. Verify on a ~380px viewport.

---

## Step 3 — M1 explanation (required)

Per **Rule M1**, the f1δ block on Compare must carry its explanation *next to it* — same collapsible pattern as the driver page, **reusing the Brief 26 copy** (Step 0.3). Do not write new explanation text; if it isn't reusable as-is, extract it into a shared component and use it in both places.

Add one Compare-specific line to the strip:
> Each bar is one season, scored against that season's maximum possible points. Careers are lined up by season number — each driver's first season, second season, and so on — so two careers from different eras can be compared by shape.

---

## Step 4 — Verify

1. `/compare/ayrton-senna-vs-lewis-hamilton` — the non-overlapping flagship: f1δ rows populate, strip renders **cleanly with no whitespace gap**, Senna's short/high arc reads against Hamilton's long plateau. Directional highlight correct on every f1δ row.
2. `/compare/lewis-hamilton-vs-valtteri-bottas` — a teammate pair: f1δ rows correct; H2H cross-link still present; ad slot still after the table.
3. **Spot-check against the leaderboards** — values shown on Compare must match `/f1delta`, `/f1delta/peak`, `/f1delta/dominant` exactly for the same drivers (one computed source, no drift).
4. M1 explanation present and expandable.
5. Mobile ~380px: no horizontal scroll, strip legible.
6. Existing rows (Career, Wins & Podiums, Era-fair rates, Points) unchanged.

---

## Step 5 — Commit (scoped)

`git add "src/pages/compare/[slug].astro"` (**quote it** — zsh glob) + any shared explanation component or strip CSS. Named paths, not `-A`.

Commit: `Brief 27: f1δ lenses + season-shape strip on Compare`. Not pushed — Tom reviews + pushes.

---

## Handoff

- **Brief 28 — Methodology page:** assembles the M1 explanation copy (already written in Brief 26) into the canonical reference, explains the mix-of-eras results, and links Compare + the three leaderboards as the showcase. This is the E-E-A-T centerpiece for the AdSense re-review.
- **M1 backlog (still open):** the era-fair rates (win%/pole%/podium%) display on driver pages *and* Compare without explanations — out of compliance with M1. Cleanup pass after the f1δ family is complete.

## Definition of done
- [ ] f1δ row group (career / peak / seasonal wins / seasonal podiums / dominant stretch) on the compare grid, after Career, directional highlighting correct.
- [ ] Season-shape strip renders with **career-season alignment**, real years labeled, rank badges reused; no gap on non-overlapping careers.
- [ ] M1 explanation present, reusing Brief 26 copy.
- [ ] Values match the three leaderboards exactly.
- [ ] Mobile-safe: no horizontal scroll at ~380px.
- [ ] Scoped, quoted commit; not pushed.
