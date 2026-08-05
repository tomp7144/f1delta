# Brief 34 — Split-season diagnosis: does the site misrepresent mid-season team changes?

**Purpose:** Fisichella finished 2009 with 5 races at Ferrari after starting the season elsewhere, and his career display doesn't show it. Determine whether this is a **display** bug (the data has the split, the page flattens it) or a **data** bug (the derive only stores one team per season) — and how many drivers it affects. This blocks the trivia game (team progressions must be correct) and is a data-integrity issue in its own right (the site quietly stating something false).

**This is a READ/DIAGNOSIS brief — report findings, do not fix yet.** The fix scope depends entirely on what the read shows.

**Push status:** No code, no commit. Report only.

---

## Step 0 — The known case: Fisichella 2009

1. Find Fisichella's driver JSON. Report his **2009 `career[]` entry** in full — quote it. Specifically:
   - What is `primaryTeamId` / `primaryTeam` for 2009?
   - Is there a `teams[]` array inside the season entry, and does it contain **both** constructors (his early-2009 team **and** Ferrari)?
   - Do the per-constructor race counts add up (e.g. Ferrari should show ~5 races)?
2. Report how the **driver page** renders that 2009 season — one row, one team? Quote the relevant part of the driver page template that renders `career[]` rows.

**This single case answers the core question:** if `teams[]` already holds both constructors, the data is fine and it's a **display** flattening bug. If the season entry only knows one team, it's a **derive** bug and the split is being lost upstream.

---

## Step 1 — Trace the data to its source

3. In `derive-f1.mjs` (or whichever script builds `career[]`), find where season team info is assigned. Report: does it capture **per-race constructor** and aggregate all constructors a driver raced for that season, or does it pick a single "primary" team per season and discard the rest?
4. Confirm what **F1DB** actually provides — F1DB stores results per race with a constructor per result, so the ground truth (which races were at which team) exists in the source. Confirm it's there and reachable, so we know a fix is *possible* regardless of what the derive currently does.

---

## Step 2 — Scope the blast radius

5. Count how many drivers have **at least one season with more than one constructor** (a mid-season switch). This is the population currently at risk of being misrepresented. Report the number and a few recognizable examples (e.g. spot-check Räikkönen, Alonso, Pérez, Sainz, Bottas — any who switched mid-season).
6. Report whether the same flattening affects other surfaces that show team info: the **Compare** grid's "Teams" row, any **team pages** listing drivers, the **season-shape / career** displays. If the season only stores one team, every one of these inherits the error.

---

## Step 3 — Report, with a fix recommendation (do not implement)

Summarize:
- **Display bug or data bug?** (The Step 0 finding decides this.)
- **How many drivers affected** (Step 2).
- **Which surfaces are wrong** (Step 2.6).
- **Recommended fix path:**
  - If **display bug** (data has `teams[]` per season): a template change to render split seasons — e.g. two team-lines within the season, or the season row showing "Team A / Ferrari (5)". No re-bake needed.
  - If **data bug** (derive discards non-primary teams): a derive change to store all constructors per season with per-team race counts, then re-bake all 792 drivers (Brief 13/25 risk class), then the display change. Bigger.

**Do not build the fix in this brief** — the point is to know which of the two it is before scoping. Once the report lands, the fix becomes its own brief (34b), and only then does the trivia game (which depends on correct team progressions) get scoped on top.

---

## Definition of done
- [ ] Fisichella's 2009 season entry quoted in full; verdict on whether both constructors are present in the data.
- [ ] Derive logic traced: does it aggregate per-race constructors or pick one primary?
- [ ] F1DB confirmed to hold the per-race constructor ground truth.
- [ ] Count of affected drivers + example spot-checks.
- [ ] List of every surface that inherits the flattening.
- [ ] Clear verdict — display bug or data bug — with the matching fix path recommended (not implemented).
