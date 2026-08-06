# Brief 42 — Home page redesign: the rabbit hole as the front door

**Purpose:** Rebuild the home page around the site's actual thesis (from the About page): *all of F1 in one place, easy to understand, easy to get lost in.* Lead with a **random well-connected person** whose connections spider out as clickable threads (land on Andrea Stella → see Schumacher, Alonso, Räikkönen, now Norris/Piastri — a chain of doorways). Lay it out as an **NHL-style box grid** of tiles. **Demote live results to a small sidebar card** — which also fully divorces the home page from the bake (only that one card touches live data; everything else is static reference data).

**This is a READ-FIRST brief on one genuine unknown** — how richly people→connections are mapped — because that defines the featured pool and the quality floor. Everything else (box grid, demoting results, the tile modules) is assembly of things that already exist.

**Push status:** Cody reports Step 0 first, then builds. Tom reviews + pushes.

---

## Step 0 — READ AND REPORT: is the connection data rich enough for a random hero?

The hero picks a **random person** and must show enough connections to be interesting. Report:

1. **The `people` entity coverage.** How many drivers, race engineers, team principals, technical directors exist, and — critically — for each, **how many connections can be rendered**:
   - **Driver:** teammates (count), team chain (teams), race engineer(s), key H2H rivalries. (Proven rich from the Fisichella/H2H work.)
   - **Engineer / principal / tech director:** drivers worked with, teams, era/years. (Tom mapped "a lot of drivers and current + notable engineers/TPs/tech directors" — Cody confirms *how* complete, since "notable" ≠ "all".)
2. **Distribution of connection richness.** How many people have, say, ≥4 renderable connections vs ≥8 vs thin (1–2)? This sets the **floor**. Report the distribution so the floor can be picked from real numbers — the goal: a random pick can only land on someone whose card looks good ("no guy who did 3 races and got fired").
3. **The eligible-pool size at a few candidate floors.** e.g. "≥5 connections → N people eligible." Confirm the pool is big enough that repeats are rare but every member is interesting.
4. **What connection data is queryable at render time** — can a person's teammates/engineers/drivers-worked-with be resolved from the baked data without a live lookup? (It should be static.)

**Report all four before building the hero.** The floor + pool come out of this; don't guess them.

---

## Step 1 — The hero card (the centerpiece)

- **Random person** from the eligible pool (Step 0: everyone **above the connection floor** — "A with a sensible floor", pure surprise, quality-controlled by the threshold). New person each load.
- **Real, clickable connection threads rendered in the card** (deep-link, not preview — this is the rabbit hole happening *on the home page*):
  - **If a driver:** teammates → `/drivers/[id]` (or `/h2h/[pair]`), team chain → `/teams/[id]`, race engineer(s) → their person page, top rivalry → `/h2h/[pair]`.
  - **If an engineer / principal / tech director:** drivers worked with → `/drivers/[id]`, teams → `/teams/[id]`, era/years.
  - Show a **curated 4-ish threads**, not everything — enough to create the "wait, they connect to *that* person" moment without a wall.
- The person's name links to their full page; the threads link to the connected entities. Every visible name is a doorway (E1).
- **Floor enforced:** never feature anyone below the connection floor. If the random pick somehow resolves thin, re-roll rather than render a sad card.
- Largest tile, anchors the grid.

---

## Step 2 — Box-grid layout (NHL-style)

Bordered self-contained cards tiling into a dashboard (per Tom's reference screenshot). Hero anchors it; the rest tile around/below:

- **Trivia card** — "Guess the driver by their team chain," **playable inline** (the interactive hook; reuse the Brief 36/40 game).
- **Compare card** — the two-driver picker, compact (reuse existing compare hero, cleaned up).
- **f1δ leaderboard card** — top 5 peek, the "who's #1?" bait, links to the full leaderboard.
- **Results card (demoted)** — last race results as a **small sidebar table** in its own box. Present for anyone who wants it, **no longer the headline**. This is the only card touching live data.
- **Reserved editorial card** — a slot/placeholder for featured `/stories` content (populated later; design the slot now so the page is structurally ready to read as a publication for the AdSense re-review).
- **Search** — stays persistent in the **header** (already there), reachable regardless of the grid.

Grid tiles on desktop; **collapses to a single column on mobile** (~380px, no horizontal scroll).

---

## Step 3 — Divorce from live data (the credit win)
- Confirm every card **except the results card** renders from **static reference data** (no live fetch). The hero, trivia, compare, leaderboard are all static-data-driven.
- Net effect: the home page no longer depends on the bake cadence at all (that's handled separately in Brief 41). Baking rarely won't affect the home page — only the small results card shows anything time-sensitive, and it degrades gracefully to "last race" regardless.

---

## Step 4 — Verify
- Load the home page repeatedly → a **different, well-connected person** each time; every hero card has real clickable threads (spot-check a driver pick and an engineer/principal pick — e.g. an Andrea Stella-type showing drivers worked with).
- **No thin/sad hero** — every random pick is above the floor; re-roll works.
- Box grid renders as tiles; results are a small sidebar card, not the headline.
- Trivia plays inline; compare picker works; leaderboard peek links out; every card's links resolve.
- Mobile ~380px: single column, no horizontal scroll.
- Home page renders fully with **no live-data dependency** except the results card.

## Step 5 — Commit (scoped)
`src/pages/index.astro` + any new hero/card components + the connection-resolution helper. Named paths, not `-A`. Commit: `Brief 42: home page redesign — random connected-person hero + box grid`. Not pushed.

## Definition of done
- [ ] Step 0 reported: people-connection coverage, richness distribution, floor picked from real numbers, eligible-pool size.
- [ ] Random-person hero above a connection floor; real clickable threads in-card (deep-link); drivers **and** engineers/principals featured; re-roll on thin.
- [ ] NHL-style box grid: hero + trivia + compare + f1δ leaderboard + reserved editorial slot; **results demoted to a sidebar card**.
- [ ] Every card except results is static-data-driven — home page divorced from the bake.
- [ ] Mobile single-column; all links resolve.
- [ ] Scoped commit; not pushed.
