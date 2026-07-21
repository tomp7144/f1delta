# Brief 25 — Refine the f1δ Score (per-season % of max, career sum) + give it a home

**Purpose:** Replace the current f1δ (flat-25 fantasy normalization) with the finalized, era-fair definition, compute it once cleanly, and give it a deliberate home on driver pages + an all-time leaderboard — so f1δ is *consistent and authoritative*, never scattered. This is the foundation the Compare integration (Brief 26) and the methodology page (Brief 27) both stand on.

**The locked definition (settled with real numbers — do not re-derive):**
> **f1δ (season)** = a driver's championship points that season ÷ the maximum points winnable that season, on a 0–100 scale, using that era's *real* points system and F1DB's *actual awarded* points.
> **f1δ (career)** = the sum of every season's f1δ.
> Era-fair by construction (8-for-a-win and 25-for-a-win both normalize to % of their own era's ceiling). Longevity accumulates. **Indy 500 (1950–1960) excluded.** **DNFs / non-scoring races are zeros** (a race that scored nothing contributes nothing — no special handling, no "mechanical vs driver" judgment).

**Push status:** Cody commits (scoped, likely staged: derive → driver-page display → leaderboard). Tom reviews + pushes.

---

## Step 0 — READ AND REPORT (the important part — this is a refactor, not a formula swap)

1. **Find the *current* f1δ.** Where is today's f1δ (the flat-25 fantasy normalization) computed, and — critically — **everywhere it is displayed** (fantasy section, driver pages, anywhere). List every surface. We replace *all* of it so the site never shows two different f1δ numbers. Report before changing anything.
2. **Max-points computation source.** Confirm F1DB gives, per season: every race's awarded points by position under that season's real system, the FL point where it applied (1950–59, 2019–24), and sprint points (2021+). The season **max winnable** = races × (win pts + FL pts where applicable) + sprints × (sprint-win pts). Confirm this is computable from F1DB per season, or report what's missing.
3. **Indy exclusion.** Confirm how the 1950–1960 Indianapolis 500 rounds are marked in F1DB so they can be cleanly dropped from **both** a driver's numerator and the season max. Report the flag/field.
4. **Historical-accuracy guard.** Confirm the refined f1δ is written as a **separate, clearly-labeled parallel field** — it must never overwrite real points / WDC standings / season results anywhere (the standing principle). Report where the value will live in the data.
5. **Dropped-scores note.** f1δ counts **all** races (uncapped), not the era's best-N championship total. Confirm the numerator sums every scoring race from F1DB, not the capped official total.

---

## Step 1 — Compute f1δ

- Per driver, per season: `seasonPts / seasonMax * 100` → the season f1δ (0–100). `seasonPts` and `seasonMax` both from F1DB's actual awarded points, era's real system, **Indy rounds excluded**.
- Career f1δ = sum of all season f1δ values.
- Store both (season array + career total) as a labeled parallel field on the driver data. Never touch real points/standings.

**Sanity check (from the analysis — expect these):** Verstappen 2023 season f1δ ≈ **92.7**; Schumacher 2004 ≈ **82.2**; Farina 1950 ≈ **55.6**. If these are off, the max computation is wrong — report before proceeding.

---

## Step 2 — Driver-page display (f1δ's home on the driver)

- **Career f1δ** as a headline figure in the driver's stat block — clearly labeled, with a one-line "what is this?" link pointing to the methodology page (`/methodology`, coming in Brief 27 — link can be stubbed now).
- **Season-by-season f1δ strip** — a compact per-year row/mini-bar so a career's **rise → peak → taper** is visible, not just one number. This is what makes f1δ tell a story.
- Consistent placement/label so f1δ reads the same on every driver page (E1: obvious, not buried).

---

## Step 3 — All-time f1δ leaderboard

- A ranked page of career f1δ — the single best proof-of-concept for the whole metric (and the methodology page's showcase).
- **Minimum-races qualifier** (the guardrail flagged pages ago): set it **low** — high enough to cut single-digit-race flukes, low enough to include **every real career**. The old rate boards had thresholds cranked so high they dropped **Hamilton and Verstappen** — do not repeat that. Report the threshold chosen and confirm Hamilton, Verstappen, Schumacher, Fangio, Senna all appear.
- Index the leaderboard in search (S1); it's static, so sitemap auto-covers it.
- **Expect surprises and let them stand:** because it's per-season dominance summed, the ranking will mix eras — that's the feature. (The methodology page will explain it; don't "fix" it.)

---

## Step 4 — Verify
- Every old f1δ surface now shows the refined number; no stale/second f1δ anywhere (Step 0 list all updated).
- Sanity-check trio (Verstappen 2023 / Schumacher 2004 / Farina 1950) matches ≈ 92.7 / 82.2 / 55.6.
- Indy rounds excluded (spot-check a 1950s driver's season f1δ isn't inflated/altered by an Indy result).
- Leaderboard qualifier includes all the marquee names; season strip renders on driver pages.
- Real points / standings / WDC history untouched anywhere.

## Step 5 — Commit (scoped)
Staged commits: derive/data → driver-page display → leaderboard + search. `git add` named paths, quoted for zsh brackets, not `-A`.
Commit msg base: `Brief 25: refine f1δ to per-season %-of-max career-sum + driver display + leaderboard`. Not pushed — Tom reviews + pushes.

---

## Handoffs (the sequence that keeps f1δ from getting lost)
- **Brief 26 — Compare integration:** career f1δ as a **headline row** on the compare grid + a **season-by-season f1δ strip** (two drivers' shapes side by side). Reuses the exact values computed here — presentation only, so it's small. *This reverses the Brief 18 "no f1δ on Compare" call, which was correct when f1δ was undefined and is wrong now that it's rigorous.*
- **Brief 27 — Methodology page:** defines f1δ truthfully (now that the site matches), explains the mix-of-eras leaderboard, and links Compare as the showcase.

No f1δ number appears anywhere on the site until this brief makes it real — so it can't scatter. One computed source, every surface pulls from it.

## Definition of done
- [ ] Every current f1δ surface identified (Step 0) and replaced; no second f1δ number remains.
- [ ] Season + career f1δ computed from F1DB actual points, Indy excluded, DNFs as zeros, as a labeled parallel field (real points untouched).
- [ ] Sanity trio matches ≈ 92.7 / 82.2 / 55.6.
- [ ] Driver pages: career headline + season strip; leaderboard live with a low, inclusive qualifier (marquee names all present).
- [ ] Indexed in search; scoped commits; not pushed.
