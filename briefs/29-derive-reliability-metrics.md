# Brief 29 — Derive: reliability & consistency metrics (DNF%, points-finish%, best finish, per-season fastest laps)

**Purpose:** Add the metrics that have been sliding as "optional" since Brief 18 — they were deferred because the fields weren't pre-baked, which under **Rule Q1** is a task, not a reason. Adds `dnfCount`, `pointsFinishes`, `bestFinish`, `bestGrid`, and **per-season** `fastestLaps` to the derive, then wires the resulting rows into driver pages and the compare grid with their M1 explanations.

**Run this BEFORE further compare-grid work** so the grid's row set is built once, complete, rather than retrofitted twice.

**Risk class:** re-bakes all 792 driver JSONs (same as Briefs 13 and 25) — hence its own brief, verified on its own.

**Push status:** Cody commits (staged: derive → display). Tom reviews + pushes.

---

## Step 0 — READ AND REPORT

1. **Result encoding (blocking — do not assume).** Confirm exactly how F1DB encodes each per-race outcome: **finished**, **classified but retired**, **unclassified/DNF**, **DNS (did not start)**, **DSQ (disqualified)**. Field names + example values (`positionNumber` / `positionText` / `statusId` / etc.). Every definition below keys off this. (Same care as Brief 13's step 0b.)
2. **Fastest laps.** Confirm per-race fastest-lap data exists in F1DB and can be aggregated **per season** (Brief 28's season mode needs it; Brief 18 omitted it because `totals` lacked it).
3. **Current `totals` shape.** Report what's present so the new fields are added alongside without disturbing existing values.
4. **Grid position.** Confirm starting grid position per race is available (for `bestGrid`).

---

## Step 1 — Definitions (lock these; report any conflict with 0.1)

Compute **per career (`totals`) and per season** (`career[]` entries) for every driver:

- **`starts`** — races the driver actually started (excludes DNS). This is the denominator for both rates below.
- **`dnfCount`** — starts that did not reach a classified finish.
  - **DNS excluded** from both numerator and denominator (they didn't start).
  - **DSQ is NOT a DNF** — the driver completed the race and was excluded afterward; count it as a finish that scored nothing. *(If 0.1 shows DSQ is encoded ambiguously, report before proceeding.)*
- **`pointsFinishes`** — starts that finished in a points-paying position **under that season's real points system** (top 5 in 1950, top 10 today, etc.). Use F1DB's actual awarded points: a race where the driver scored > 0 counts. *(Fastest-lap-only points in FL-bonus years should NOT alone count as a points finish — report if this case exists in the data.)*
- **`fastestLaps`** — per season (career total already exists).
- **`bestFinish`** — lowest finishing position number achieved (1 = a win).
- **`bestGrid`** — lowest starting grid position achieved (1 = pole).

Derived rates (computed at display time, not stored):
- **DNF %** = `dnfCount / starts × 100`
- **Points-finish %** = `pointsFinishes / starts × 100`

---

## Step 2 — Re-derive

Add the above to `derive-f1.mjs`, re-run, update all 792 driver JSONs. Real points / standings / WDC history untouched (parallel fields only).

**Sanity checks to report:**
- A 1950s-era driver's career DNF% should be **high** (era unreliability) and a modern driver's **low** — if they're similar, the DNF definition is wrong.
- `bestFinish` = 1 for any race winner.
- Per-season `fastestLaps` sums to the existing career `fastestLaps` total.

---

## Step 3 — Display: a **new** row group (do not put these in ERA-FAIR RATES)

**Why a separate group — this is the load-bearing design decision.** Win %, podium %, and pole % are genuinely era-fair: the definitions never changed across eras. **DNF % and points-finish % are not:**
- "Points finish" meant **top 5** in 1950 and means **top 10** today — a modern driver has roughly double the scoring positions available for the same relative performance.
- DNF rate is dominated by **machinery**, not the driver — 1950s–70s cars broke constantly; modern cars nearly always finish.

Putting them under a heading that says "era-fair" would make the label false.

**New group: `RELIABILITY & CONSISTENCY` — subhead: *era-dependent · see explanation*.** Placed after ERA-FAIR RATES, before POINTS.

| Row | Value | Highlighting |
|---|---|---|
| **DNF %** | `dnfCount / starts` | **Season mode only** (`higherIsBetter: false`). **Neutral in career mode.** |
| **Points-finish %** | `pointsFinishes / starts` | **Season mode only** (`higherIsBetter: true`). **Neutral in career mode.** |

**Conditional highlighting rule:** these rows are highlighted **only when both columns are the same season** (Brief 28's season mode), where the two drivers faced the same reliability and the same points system. In career mode (cross-era) they render **neutral, no winner marked** — the comparison isn't valid, so the page must not assert one. Same principle already applied to the POINTS row.

**Also add to driver pages:** DNF %, points-finish %, best finish, best grid as career facts, with the same explanation component.

---

## Step 4 — M1 explanations (place this copy next to the group)

> **DNF rate — "how often did they not finish?"**
> The share of race starts that ended without a classified finish.
> **Formula:** races not finished ÷ race starts × 100. Races the driver did not start are excluded from both sides. A disqualification counts as a finish that scored nothing, not a DNF.
> **Why it sits apart from the era-fair rates:** unlike a win or a podium, *finishing* meant something very different in different eras. Cars in the 1950s–70s broke constantly; modern cars almost always reach the flag. A high DNF rate in 1955 says far more about the machinery than the driver. Comparing two drivers within the same season is meaningful — they faced the same conditions. Across eras it's context, not a verdict, which is why this row only marks a winner when both columns are the same season.

> **Points-finish rate — "how often did they score?"**
> The share of race starts that ended in a points-paying position.
> **Formula:** races finished in a scoring position ÷ race starts × 100, using that season's real points system.
> **Why it's era-dependent:** the number of positions that pay points has changed repeatedly — the top five scored in 1950, the top ten score today. A modern driver has roughly twice as many scoring positions available for the same relative performance, so a higher percentage doesn't necessarily mean a better driver. Like DNF rate, it's shown as context and only marks a winner within a shared season.

Reuse the `F1DeltaExplain.astro` pattern (Brief 27) — extend it or add a sibling component; **do not duplicate copy.**

---

## Step 5 — Verify
- New fields on all 792 drivers, career + per season; real points/standings untouched.
- Sanity checks from Step 2 pass (era DNF% gradient is the key one).
- Compare grid: new group renders after era-fair rates; **neutral in career mode**, highlighted in season mode.
- Driver pages show the new career facts with explanations.
- Existing rows unchanged.

## Step 6 — Commit (scoped, staged)
derive/data → display. Named paths, quoted brackets, not `-A`.
Base msg: `Brief 29: reliability & consistency metrics (DNF%, points-finish%, best finish, per-season FL)`. Not pushed.

## Definition of done
- [ ] Result encoding confirmed from F1DB before any logic written.
- [ ] All fields derived career + per season; sanity checks pass.
- [ ] `RELIABILITY & CONSISTENCY` group added — **not** inside ERA-FAIR RATES.
- [ ] Conditional highlighting: neutral in career mode, active in season mode.
- [ ] M1 explanations placed, no copy duplication.
- [ ] Scoped commits; not pushed.
