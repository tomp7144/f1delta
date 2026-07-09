# Brief: Standings crowns the in-progress season's leader as champion

**Status:** Ready for Cody — **highest priority** (factual error on a reference site)
**Type:** Data/logic bug. Read-and-report first, then fix.

## The bug

The Standings page shows **Kimi Antonelli as the 2026 World Champion**. 2026 is in progress (it's mid-season — the British GP is Round 9, season not complete). Antonelli is *leading* the championship; he has not *won* it. The derive is almost certainly crowning the current points **leader** of an incomplete season as its **champion**.

This is a wrong fact, not a styling issue. It's the kind of error that destroys credibility if the site gets shared. Fix it before any visual work.

## A clue to start from

On the 2026 row: the **Constructors' Champion** column shows `—` (correctly — not decided), but the **World Champion** column shows Antonelli (wrong). That asymmetry is the entry point — one column handles the incomplete season correctly and the other doesn't. Find out why.

## Step 1 — Read and report (no code yet)

- Locate where each season's **World Champion** and **Constructors' Champion** are determined (which derive script, which field, what logic). Quote the relevant lines.
- **Explain the asymmetry:** why does 2026 produce a drivers' World Champion but no constructors' champion? Is the constructors' logic guarding against an incomplete season, or is constructors' data simply null for 2026 while the drivers' standings exist and the code naively takes P1 as "champion"?
- **How can the code tell a season is complete vs. in progress?** Report every available signal: an F1DB completed/provisional flag, whether all scheduled rounds have final results, a latest-season check, a date comparison — whatever actually exists in the data. We need a *derived* completeness test, not a hardcoded year.
- **Blast radius — this is critical.** The "champion" determination may be reused. Report every place a championship/title is counted or displayed, and whether each would wrongly credit the 2026 leader:
  - Standings index (the table in question)
  - Individual season page (`standings/[year]`)
  - Driver page **TITLES** stat box (does Antonelli's page show "1" title for 2026?)
  - Driver season table **WDC** column (showing `P1` for 2026 is arguably fine — he *is* currently P1 — but a *title count* must not increment)
  - Records boards — **"Most Championships"** especially (does 2026 crown Antonelli into an all-time record?)
  - Anywhere else `champion`/`title`/`wdc` is derived
- **Report back and wait.** Two decisions come out of this (below).

## Decisions this surfaces (for Tom, after Step 1)

1. **What should the in-progress season show in the champion column?**
   - **Option A:** `—` or "in progress" — matches how Constructors' already renders for 2026. Simplest, unambiguous.
   - **Option B (recommended):** show the current leader, clearly labeled as *leading* and visually distinct from settled champions (e.g. muted/italic with a "leading" tag), so the useful info — who's ahead in 2026 — is preserved without claiming a title. On-brand for a reference desk.
   - Non-negotiable either way: **it must not state or imply the leader is champion**, and no title count may include the incomplete season.
2. Confirm the completeness test to use, based on what Step 1 found is available.

## Step 2 — Fix (after decisions)

- Gate champion/title determination on the derived completeness test: a season yields a World Champion (and Constructors' Champion, and a counted title) **only when complete**.
- Apply the chosen display for the in-progress season across every surface in the blast radius — consistently. Don't fix the standings table and leave the driver page or records crediting the title.
- **Must be derived, not hardcoded.** No "2026 is in progress" literal. It self-corrects when 2026 finishes (Antonelli, if he wins, becomes champion automatically) and when 2027 opens.

## Step 3 — Verify

- Standings: 2026 no longer claims a World Champion (shows the chosen treatment); completed seasons unchanged (2025 Norris, 2024 Verstappen, etc. still correct).
- Antonelli's driver page: TITLES count does **not** include 2026.
- Records → "Most Championships": 2026 not counted; the board is unchanged from the settled record.
- `standings/[year]` for 2026: consistent with the index.
- Self-correction sanity: the completeness test keys off data, not a year literal (confirm by reasoning through what happens when 2026's final round lands).

## Step 4 — Commit

Scoped to only the files touched (derive script(s) + any display templates). No `git add -A`. Quote bracketed paths.
