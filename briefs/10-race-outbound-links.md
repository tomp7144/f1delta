# Brief 10: Race page — outbound links + prev/next navigation

**Status:** Ready for Cody
**Type:** Build. Read-confirm, build, verify.
**Depends on:** Brief 09 (race pages live), 10a (template polished; `.snav-link` / `.season-nav` pattern ready to reuse).
**This is the race-page HALF of the interconnection.** Brief 11 handles inbound links from the rest of the site (season→races, circuit→races, GP→runnings, driver→races). This brief makes each race page a fully-connected, navigable hub with visible links.

**Standing rules that apply (from `00-standing-conventions.md`):**
- **E1 — connections must be visibly clickable, not just present.** Every link built here must be obviously clickable: clear affordance, good contrast, red accent for primary nav.
- **E2 — ad slot at a natural break**, never mid-table or interrupting content.

## Goal

Turn the race page (`/races/[raceId]`) into a fully-linked hub: everything on it that references another entity links out (visibly), plus prominent prev/next-race navigation. This is half the fix for "impossible to find" — a visitor on a race page can jump to any driver, team, circuit, the season, the GP, or the adjacent races.

## Part 1 — Outbound links (make them visibly clickable — Rule E1)

On the race page, wire and clearly style these links (confirm each ID is present per Brief 08 — all were):

- **Result table:** each **driver** → `/drivers/[id]`, each **constructor/team** → `/teams/[id]`. These must read as tappable (not plain black text indistinguishable from data) — clear link affordance, consistent with how driver/team names link elsewhere on the site.
- **Header:** **circuit** → `/circuits/[id]`, **Grand Prix** → `/grands-prix/[id]` (the aggregate GP page), **season/year** → `/standings/[year]`. Make these obvious navigation, not buried text.
- **Qualifying table** (where present): driver links too.
- **Driver of the Day / Fastest Lap** in the highlights strip: link the driver name.

Every linked entity name should be visibly clickable. Match the site's existing link treatment so it's consistent (don't invent a new link style — reuse how drivers/teams are already linked in other tables).

## Part 2 — Prev/next race navigation (red, prominent — Rules E1)

Add previous/next race navigation to each race page, **reusing the `.snav-link` / `.season-nav` pattern from the season pages** (10a) — but per the owner's decision, this pattern is now **red and larger** (see Part 3).

- **Prev = the previous round; Next = the next round**, within chronological race order. At season boundaries, it should flow to the last race of the previous season / first race of the next season (confirm the race ordering data supports a global chronological sequence; if only within-season ordering is clean, prev/next within the season with sensible boundary behavior is acceptable — report which).
- Show the adjacent race's name (e.g. "← 2016 Singapore GP" / "2016 Japanese GP →") so it's informative, like the season arrows show the year.
- Placement: top of the page (matching where season arrows sit), consistent with `/standings/[year]`.

## Part 3 — Make prev/next arrows RED and larger (season + race, consistent)

Owner decision: the prev/next arrow navigation should be **red (`var(--red)`) and a bit larger** — clearly visible, obviously clickable (Rule E1: "if they can't see it they can't click it").

- Update the shared `.snav-link` / `.season-nav` styling so the arrows are **red and larger** than current.
- Apply to **BOTH** the season pages (`/standings/[year]`) and the new race prev/next — one consistent nav-arrow style across the site (don't style race arrows separately).
- Keep it in `tokens.css` variables; red hover can deepen (e.g. `--red` → a darker red) for feedback.

## Part 4 — Ad slot sanity (Rule E2)

- Confirm the race page's ad slot (if present from Brief 09) sits at a **natural break** — e.g. after the result table / between major sections — NOT mid-table, not between the header and results, not interrupting the highlights strip. Reposition if needed so it reads as part of the page rhythm.
- If no slot exists yet, add one placeholder div at a sensible break (it won't serve until AdSense approves, but the slot should be designed in now — E2).

## Step 1 — Read-confirm

- Confirm all outbound IDs are present on the race data (driver, team, circuit, GP, season) — Brief 08 said yes; verify against the actual `race-{id}.json`.
- Confirm the race ordering data: is there a clean global chronological sequence for prev/next across season boundaries, or only within-season? Report which, so prev/next behavior is built correctly.
- Confirm the `.snav-link` / `.season-nav` markup from 10a so red+larger restyle applies to both season and race.
- Report the current race-page ad slot location (if any) for E2.
- Report, then build.

## Step 2 — Build

- Wire all outbound links, visibly clickable (Part 1).
- Add prev/next race nav reusing the season pattern (Part 2).
- Restyle `.snav-link`/`.season-nav` red + larger, applied to season AND race (Part 3).
- Confirm/place the ad slot at a natural break (Part 4).

## Step 3 — Verify

- **`/races/2016-malaysian-grand-prix`:** driver names link to driver pages, teams to team pages, circuit/GP/season in header link out — all **visibly clickable**, not plain text.
- **Prev/next race:** shows adjacent races by name (e.g. previous/next round), red and prominent, navigates correctly; boundary behavior sane (report how season edges work).
- **Arrow restyle:** BOTH `/standings/2016` (season arrows) and race pages show the red, larger arrows — consistent.
- **Ad slot:** sits at a natural break, not interrupting a table or heading.
- **Mobile:** links tappable, arrows visible and not overflowing, tables still scroll with frozen column.
- Spot-check a race at a season boundary (first/last round of a year) for correct prev/next.
- Spot-check an early-era race (fewer drivers, maybe no quali) — links still work, no errors.

## Step 4 — Commit

Scoped to `src/pages/races/[raceId].astro`, the shared arrow CSS (`.snav-link`/`.season-nav`, likely in a shared stylesheet or `standings/[year].astro` — report where), and `tokens.css` if arrow color/size tokens are added. No `git add -A`. Quote bracketed paths.

## Push
Build brief — **it ends in a push.** Push after review, verify live.

## Next
Brief 11 — inbound links (the reverse direction): season `/standings/[year]` gets the round-by-round race list (the "click 2016, see every race" view), circuit → its races, GP runnings → link to race pages, driver → their races. Then the site is a fully bidirectional web.
