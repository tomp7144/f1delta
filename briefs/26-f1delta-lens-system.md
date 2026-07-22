# Brief 26 — f1δ lens system: Peak + Dominant Stretch (seasonal podiums), with explanations

**Purpose:** Turn f1δ into a **lens system** — the same per-season scores (baked in Brief 25) viewed three ways, each answering a different GOAT-argument question — and ship **each lens with its calculation shown next to it** (new **Rule M1**). Computation-light: everything here is `max` / `rank` / `sliding-window` over data Brief 25 already computed. Mostly display + explanation.

**The three lenses:**
| Lens | Question it answers | Computation |
|---|---|---|
| **Career** (done, Brief 25) | most accumulated | sum of all season f1δ |
| **Peak** | best single season | `max()` of season f1δ |
| **Dominant stretch** (seasonal podiums) | longest run at the top | rank drivers by f1δ each season → longest consecutive run of top-3 finishes |

**Push status:** Cody commits (scoped/staged). Tom reviews + pushes.

---

## Step 0 — READ
- Confirm Brief 25's per-season f1δ values (`d.f1delta.seasons[]`) are available per driver to derive from — **no new F1DB read needed**, this is derivation over existing values.
- Report where on the driver page the f1δ section lives (Brief 25) so Peak + Stretch + the explanation slot in beside Career.
- Report the leaderboard pattern from `/f1delta` (Brief 25) to reuse for the new boards.

---

## Step 1 — Compute the lenses (derivation over baked season values)

1. **Peak f1δ** = `max(d.f1delta.seasons)` per driver. Store `d.f1delta.peak` (value + which year).
2. **Season f1δ rank** — for **each season**, rank every driver who raced that year by their season f1δ (1 = highest). Store each driver's rank per season.
3. **Seasonal wins / podiums** — per driver: count of seasons ranked **1st** (seasonal wins) and count ranked **top-3** (seasonal podiums). Store both.
4. **Dominant stretch** = the **longest run of consecutive seasons** (calendar years the driver raced; a not-raced year breaks the run) in which they finished **top-3** in f1δ rank. Store the length + the year span.

Store all as labeled parallel fields alongside the existing f1δ data — real points/standings untouched.

---

## Step 2 — Display

**Driver page** (beside the Brief 25 Career headline + season strip):
- **Peak f1δ** (value + year).
- **Seasonal wins / podiums** counts.
- **Longest dominant stretch** (length + span, e.g. "5 straight seasonal podiums, 2000–2004").

**New leaderboards** (reuse `/f1delta` pattern):
- `/f1delta/peak` — ranked by peak f1δ.
- `/f1delta/dominant` — ranked by longest seasonal-podium streak (tiebreak: seasonal podiums, then career f1δ).
- Index both in search (S1); static, so sitemap auto-covers.
- Let surprising rankings stand — that's the point; the explanation (Step 3) covers it.

---

## Step 3 — Explanations (Rule M1 — place this copy next to each metric)

Each lens gets a "how this works" explanation **next to it** (inline expandable or adjacent panel — your UI call, but present, not buried). Copy below is final — place verbatim (light formatting fine). These also become the methodology-page content (Brief 28).

**Career f1δ — "who accumulated the most?"**
> Every season is scored as a share of that year's maximum possible points, on a 0–100 scale, then summed across a whole career.
> **Formula:** season f1δ = (points scored that season ÷ maximum points winnable that season) × 100; career f1δ = the sum of every season.
> **Worked example:** Verstappen's 2023 = 575 ÷ 620 × 100 = **92.7**. His career total adds every season scored that way.
> **Why:** dividing each season by its *own era's* maximum is what makes eras comparable — dominating a 7-race 1950 season and a 24-race 2024 season both come out near 100%, even though a win was worth 8 points then and 25 now. Summing rewards longevity: a long career of strong seasons out-totals a short brilliant one, by design. The Indianapolis 500 (1950–60, effectively a separate series) is excluded; a DNF or non-scoring race is simply a zero.

**Peak f1δ — "whose single best season was the most dominant?"**
> A driver's highest single-season f1δ — their most dominant year, on its own.
> **Formula:** the maximum of a driver's season scores.
> **Worked example:** Verstappen's peak is his 2023 season — **92.7**.
> **Why:** the career total rewards longevity, so a short, ferocious peak can hide inside a lower lifetime sum. Peak isolates the single best year, so a driver whose brilliance was intense but brief stands where they belong.

**Seasonal podiums & dominant stretch — "who stayed at the top the longest?"**
> Rank every driver by their f1δ each season. Finishing **top-3** that year is a **seasonal podium** (mirroring a race podium); finishing **1st** is a **seasonal win**. A **dominant stretch** is the longest run of consecutive seasonal podiums.
> **Formula:** for each season, rank all drivers by f1δ; a seasonal podium = f1δ rank ≤ 3; dominant stretch = the longest run of consecutive seasons at top-3.
> **Worked example:** *(Cody: fill from the computed data — e.g. "Schumacher — N straight seasonal podiums, 2000–2004," and the current holders for Hamilton's Mercedes run and Verstappen's run.)*
> **Why:** dominance isn't your raw score — it's where you placed among the field that year. Hamilton in 2016 lost the title by five points but was clearly a top-3 f1δ season, so it counts as a seasonal podium — something a raw number, or a binary "champion / not champion," would miss. Top-3 mirrors the podium every fan already understands.
> **Note:** f1δ rank is its own measure, not championship position. They usually agree, but f1δ counts every race uncapped, so a driver's f1δ rank occasionally differs from their finish in the standings. When they differ, f1δ rank is the more honest read of dominance — which is the whole reason the metric exists.

---

## Step 4 — Verify
- Peak / seasonal-podiums / stretch computed for all drivers; spot-check the marquee dynasties surface on `/f1delta/dominant` (Schumacher, Hamilton, Verstappen runs) and that Verstappen/Fangio/Senna rank high on `/f1delta/peak` (peak rescues the short-brilliant careers the career board buries).
- Every lens on the driver page has its explanation **next to it** (M1).
- Worked-example numbers correct (Verstappen 2023 = 92.7).
- Real points/standings untouched.

## Step 5 — Commit (scoped, staged)
derive/data → driver-page lenses + explanations → new leaderboards + search. Named paths, quoted brackets, not `-A`.
Base msg: `Brief 26: f1δ lens system (peak + dominant stretch) + M1 explanations`. Not pushed.

---

## Handoffs
- **Brief 27 — Compare integration:** career + peak + dominant-stretch rows on the compare grid, plus the season-by-season f1δ strip (two drivers' shapes side by side). Reuses everything computed here — presentation only. Each row carries its M1 explanation.
- **Brief 28 — Methodology page:** aggregates the Step 3 explanation copy (already written) into the canonical reference; explains the mix-of-eras leaderboards; links Compare as the showcase.
- **Add Rule M1 to `00-standing-conventions.md`.** And a follow-up applies M1 to the existing era-fair rates (win%/pole%/podium%), which currently display without an explanation.

## Definition of done
- [ ] Peak, season-rank, seasonal wins/podiums, dominant stretch computed from Brief 25 season values (parallel fields; real data untouched).
- [ ] Driver page shows all three lenses; `/f1delta/peak` and `/f1delta/dominant` live + indexed.
- [ ] Each lens ships with its explanation next to it (M1); worked examples correct.
- [ ] Marquee dynasties on the stretch board; short-brilliant careers rescued on the peak board.
- [ ] Scoped commits; not pushed.
