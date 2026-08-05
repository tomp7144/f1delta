# Brief 35 — Driver-page cluster: split seasons, H2H redesign, toggle fix, Compare teams, header search

**Purpose:** Five fixes, batched because four touch the driver page and the fifth is a global nav change worth shipping alongside. Items 1 and 4 are screenshot-verified bugs; Item 4 also corrects the **definition** of the DNF/DNS toggle (it was built on the wrong model). Items 2/3/5 are an agreed read/redesign/placement.

**Governing rule for this brief (learned the hard way this session):** every fix has a **verification against a real rendered case** — a bug isn't fixed until the page shows the right thing, not until a report says the code changed. Screenshots are truth.

**Push status:** Cody commits (scoped, staged per item). Tom reviews + pushes.

---

## Item 1 — Split-season rows don't render (driver page) · **BUG, seen**

**Symptom (screenshotted):** Fisichella's season table shows 2009 as "Force ..." only. Ferrari (5 races) is **not** rendered — not faint, not small, absent. The data is correct: `career[].teams[]` holds both `{force-india, 12}` and `{ferrari, 5}` (confirmed Brief 34). The template drops the non-primary team.

**Fix:** in `src/pages/drivers/[id].astro`, the season-row TEAM cell must render **every** entry in `s.teams`, not just `primaryTeam`. For a split season show both constructors with race counts, e.g.:

> **Force India (12) · Ferrari (5)**

- Each team keeps its color chip.
- Order by races descending (matches `teams[]` order).
- Single-team seasons render exactly as now (one team, optionally without the count, or with it for consistency — Tom's call; default: show count only when >1 team that season).

**Verify:** Fisichella 2009 row shows **both** Force India and Ferrari with counts. Spot-check Verstappen 2016 (Toro Rosso + Red Bull) and Sainz 2017 (Toro Rosso + Renault) — both teams render.

---

## Item 2 — Compare career mode drops non-primary teams · **BUG (Brief 34 read)**

**Symptom:** `careerTeams()` in `compare/[slug].astro` (~L96-105) iterates `primaryTeamId` only, so in career mode a driver's mid-season teams vanish from the Teams row (Fisichella's Ferrari absent).

**Fix:** loop `s.teams ?? []` and dedupe by `constructorId`:
```js
function careerTeams(d) {
  const seen = new Set(); const out = [];
  for (const s of d.career ?? [])
    for (const t of s.teams ?? [])
      if (!seen.has(t.constructorId)) { seen.add(t.constructorId); out.push({ id: t.constructorId, name: t.constructor }); }
  return out;
}
```
Template-only, no re-bake.

**Verify:** `/compare/fernando-alonso-vs-giancarlo-fisichella` career mode — Fisichella's Teams row includes Ferrari. Spot-check a driver with several mid-season moves.

---

## Item 3 — H2H section redesign: compact table, nothing hidden (driver page) · **REDESIGN**

**Problem:** the "Teammates, head to head" section repeats a full comparison widget per teammate — metadata byline + two bar charts + points + link — producing a wall on drivers with many teammates.

**Redesign (agreed):** a **compact table**, one row per teammate, **all teammates shown, nothing collapsed or hidden.** Columns:

| TEAMMATE | QUALIFYING | RACE | POINTS | |
|---|---|---|---|---|
| Name + years | `11-7` | `10-3` | `22 vs 12` | → Full breakdown |

- **Move the bar charts to the full-breakdown page** (`/h2h/[pair]`), which already has room. The driver-page table keeps the *numbers* (quali H2H, race H2H, points) — no information removed, just the redundant per-row chart.
- Drop the verbose metadata byline ("'05–'06 · 28r compared, 9 excl.") from the row to a tight form (years only, e.g. "'05–'06"); the excl./compared detail lives on the full breakdown.
- Sort: most races first (as now).
- Every teammate name → `/drivers/[id]`; every row's → Full breakdown → `/h2h/[pair]` (E1, red).
- Keep it scannable: a 20-teammate career should read on roughly one screen.

**Verify:** a high-teammate-count driver (Alonso, Räikkönen) renders as one clean table, all teammates present, no bars, links intact. Nothing that was a *number* on the old design is missing.

---

## Item 4 — DNF/DNS toggles change labels but not counts · **BUG, seen — and the definition was wrong**

**Symptom (screenshotted, all three states):** toggling Default / +DNF / +DNS highlights the button and updates the caption ("9 excl." → "37 contested"), but the **H2H numbers never change** — RACE stays 23–5, season rows stay 10–3 / 13–2 across all three modes.

**Root cause is deeper than the front-end:** the baked H2H was built around a "classified position" idea that is **wrong**. The correct, locked definition (from Tom, verbatim intent) is dead simple — **higher finishing result wins, not showing up loses** — with no crediting anyone for a race they didn't finish:

- **Default** — both drivers classified at the finish; whoever **finished higher** wins the race.
- **+DNF** — **every race** included; whoever **finished higher** wins, circumstances don't matter. A classified finish beats a DNF; a DNF that got further beats one that stopped earlier. Position is position. (Both DNF → still ranked by who was classified higher / got further; there's always a higher result.)
- **+DNS** — a teammate **present that weekend but who didn't start loses** to the one who raced. Being there and not starting = a loss.
- **+DNF and +DNS together** — everything counts.

**This is very likely a DERIVE fix, not a front-end patch.** The existing `excl_*` subcounts were computed on the wrong model, so wiring the toggle to them would just be lipstick on wrong numbers. 

**Step 0 (read first):** inspect the current H2H derive (Brief 13 logic in `derive-f1.mjs`) and report whether it can produce the four tallies below **by ranking each shared round on finishing result**, or whether the current subcounts encode the old classified-position model and must be rederived. Report before building.

**The fix (rank by result, store four honest tallies):** for every shared round between the two drivers, rank them by **finishing result** (classified position where both finished; a finisher outranks a DNF; a starter outranks a DNS; between two DNFs, the higher-classified / further one outranks). From that ranking, store per season **and** aggregate:
- `bothFinished` W–L (Default)
- `inclDNF` W–L (every race that ran)
- `inclDNS` W–L (adds did-not-start rounds)
- `inclBoth` W–L (everything)

Then the **front-end toggle simply picks which tally to display** — no client-side recompute of win/loss, no `excl_*` gymnastics. Caption and numbers both come from the same stored tally, so they can't disagree.

If this requires rederiving H2H, it re-bakes driver JSONs (Brief 13/25 risk class) — that's the correct fix; do it rather than patching wrong numbers. Confirm the shared H2H data feeds **all** surfaces (driver page, `/h2h/[pair]` full breakdown, Compare season mode) so every one gets the corrected tallies.

**Verify — against a case with a known DNF:** **Hamilton–Rosberg**, Malaysia 2016 (Hamilton leading, engine failure, Rosberg finished). Under the correct model:
- **Default:** Malaysia is **excluded** (Hamilton didn't finish) — base number.
- **+DNF:** Malaysia is **included and Rosberg wins it** (he finished, Hamilton didn't — doesn't matter that Hamilton was leading). The race count grows and this race goes to Rosberg. Numbers visibly change.
- **+DNS:** adds any round one of them didn't start.
- The old build would have given this race to Hamilton (was leading) — the fix must give it to **Rosberg** (finished). That flip is the proof the new model is live.

---

## Item 5 — Search bar on every page (global) · **UX**

**Problem:** the universal search only appears on the home page. Navigating drivers/records/etc., there's no way to search from where you land.

**Fix:** place the existing search component (the one on the home page, backed by `search-index.json`) in the **header/nav** (`BaseLayout.astro`) so it appears on all ~5,700 pages.
- Reuse the existing component + index — no new search logic, no new matcher.
- Header placement: compact (an icon that expands, or a slim inline field) so it doesn't crowd the nav on mobile. Tom's call on the exact treatment; requirement is *reachable from every page*, mobile-safe (no horizontal scroll).
- Don't duplicate: if the home page has its own large hero search, the header one can be the compact version; keep both working, one component.

**Verify:** search works from a driver page, a race page, the leaderboards; mobile ~380px has no layout break; results navigate correctly.

---

## Commits (scoped, staged) + verify

Stage per item so each is revertible:
1. `src/pages/drivers/[id].astro` — split-season rows (Item 1) + H2H table (Item 3)
2. `src/pages/compare/[slug].astro` — careerTeams (Item 2)
3. Item 4 — likely `derive-f1.mjs` (rederive H2H on finish-result model, four tallies) + the driver JSONs + simplified toggle (picks a tally) across driver page / full breakdown / compare season mode. If it's a re-bake, stage the derive+data separately from the front-end.
4. `BaseLayout.astro` (+ search component if adjusted) — header search (Item 5)

Named paths, not `-A`. Base msg: `Brief 35: split-season render, H2H table, toggle recompute, compare teams, header search`. Not pushed.

## Definition of done
- [ ] Fisichella 2009 shows **Force India (12) · Ferrari (5)**; Verstappen '16 / Sainz '17 split seasons render.
- [ ] Compare career Teams row includes mid-season teams (Fisichella → Ferrari present).
- [ ] H2H driver-page section is a compact table, **all teammates, all numbers, no bars**; bars on full-breakdown page; links intact.
- [ ] H2H rebuilt on **finish-result** model (higher result wins, DNS loses); four stored tallies; toggle just picks one. Proven on Hamilton–Rosberg: Malaysia goes to **Rosberg** under +DNF (finished > led-but-DNF). All surfaces (driver page, full breakdown, Compare season) use the corrected data.
- [ ] Search reachable from every page, mobile-safe.
- [ ] Each item a scoped commit; not pushed.

---

**After this:** the trivia game (team-progression guesser) is unblocked — built on `teams[]` (never `primaryTeamId`, which Items 1/2 just proved is the distinction that matters). That's its own brief, and the fun one.
