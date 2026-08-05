# Brief 38 — Split seasons: two-row Wikipedia-style display

**Purpose:** Replace the stacked-chip split-season cell (ugly, wraps, doubles the row height) with the Wikipedia layout: a split season renders as **one row per team**, each with its own full stat line, and the SEASON + WDC cells **span** both via rowspan. This tells the real story — for Fisichella 2009, the podium and all 8 points were the Force India half; Ferrari was a scoreless cameo.

**Assume the per-team stats exist in `teams[]`** (race counts are confirmed present from Brief 34). Build against that. **One guard only:** if a per-team stat field (wins/podiums/poles/points) genuinely isn't in `teams[]`, that's a **derive addition, not a reason to bodge it or fall back to the old display** — report it and add it (re-bake, Brief 13/25 risk class). Do not fake numbers or split the season total evenly.

**Push status:** Cody commits (scoped). Tom reviews + pushes.

---

## Target layout (from Wikipedia reference)

Single-team season (unchanged) — one row:
```
2007 | 🟨 Renault | 17 | 17 | 0 | 0 | 0 | 21 | P8
```

Split season — **N rows, one per team; SEASON and WDC cells rowspan across them:**
```
        | 🟪 Force India | 18? | 12 | 0 | 1 | 1 | 8 |
2009    |----------------|-----|----|---|---|---|---|  P15
        | 🔴 Ferrari     |  ?  |  5 | 0 | 0 | 0 | 0 |
```
- SEASON cell (`2009`) uses `rowspan=N`, vertically centered.
- WDC cell (`P15`) uses `rowspan=N` — it's a season-level result, one value, centered across the team rows.
- Each team row carries **that team's own** ENT/R/WIN/POD/POLE/PTS from `teams[]`.
- Team color chip per row.
- Drop the "(12)/(5)" race-count-in-parens hack entirely — the R column now shows it properly per row.

---

## Step 1 — Confirm per-team stat fields (build assuming present)
In `src/pages/drivers/[id].astro` (season table ~L159) and the driver JSON, confirm each `teams[]` entry has the stats the row needs: at minimum `races` (have), plus `wins`, `podiums`, `poles`, `points`, and `entries` per team. 
- **Present** → proceed to Step 2 (template only, no re-bake).
- **Missing any** → add them to the per-team aggregation in `derive-f1.mjs` (it already accumulates `_teamRaces` per constructor per season — extend to accumulate wins/podiums/poles/points/entries the same way), re-bake all 792 drivers, then Step 2. Report which path.

## Step 2 — Render
- Build the season table body so a season with `teams.length > 1` emits **one `<tr>` per team**, with the SEASON `<td rowspan>` and WDC `<td rowspan>` on the first of the group only.
- Single-team seasons emit one `<tr>` exactly as now.
- Per-team rows: color chip + team name + that team's ENT/R/WIN/POD/POLE/PTS.
- Keep the existing sort behavior working (sorting by season keeps a split season's rows together as a group; sorting by a stat column — decide: sort by the season's total or the primary team's value, and keep the group intact rather than splitting rows across the table). Report the sort approach.
- Remove the `td.tm.multi` stacked-chip CSS from Brief 37 — it's superseded.

## Step 3 — Verify (against the page + the Wikipedia reference)
- **Fisichella 2009** renders as two rows: **Force India** (12 R, 0 win, 1 pod, 8 pts) and **Ferrari** (5 R, 0/0/0), with `2009` and `P15` spanning both, vertically centered. Matches the Wikipedia screenshot's structure.
- Row heights look uniform — no lopsided double-height cell; the two team rows are normal-height rows under a spanned season cell.
- **Verstappen 2016** (Toro Rosso + Red Bull) renders as two rows with each team's own stats.
- Single-team seasons (2007 Renault, etc.) unchanged — still one row.
- Per-team points sum to the season total (Force India 8 + Ferrari 0 = 8, matches the 2009 season points).
- Mobile ~380px: the rowspan table doesn't break layout or force horizontal scroll.

## Step 4 — Commit (scoped)
`git add "src/pages/drivers/[id].astro"` (quote — zsh) + `derive-f1.mjs` and driver JSONs **only if** Step 1 required the derive path. Named paths, not `-A`. Commit: `Brief 38: split-season two-row rowspan display with per-team stats`. Not pushed.

## Definition of done
- [ ] Step 1 path reported (per-team stats present → template-only; or missing → derive + re-bake).
- [ ] Split seasons render as one row per team with per-team stats; SEASON + WDC rowspan; matches Wikipedia structure.
- [ ] Fisichella 2009: Force India (12R, 1 pod, 8 pts) + Ferrari (5R, 0/0/0); per-team points sum to season total.
- [ ] Verstappen 2016 two rows; single-team seasons unchanged; row heights uniform.
- [ ] Old stacked-chip `multi` CSS removed; sort still works; mobile-safe.
- [ ] Scoped commit; not pushed.
