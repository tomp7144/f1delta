# Brief 14 — Teammate H2H static pages (`/h2h/[pairing]`)

**Purpose:** Build the 3,223 race-comparable H2H pairing pages from the Brief 13 census — dedicated rivalry pages with a career callout, season-by-season table, DNS/DNF toggles recomputed client-side from baked subcounts, career-rate labeling, one ad slot, and prominent outbound links. **Depends on Brief 13 (census + subcounts must be committed).**

**Push status:** Cody commits (scoped). This deploys user-facing pages, so it **requires a push** — but that's Tom's step. Tom reviews the build (page count == census race-comparable count; local spot-checks of the pages below), then pushes. (W1)

**Slug (locked, U1):** `/h2h/[alpha-id-a]-vs-[alpha-id-b]`, canonical A = alphabetically-first F1DB ID. A's `raceAhead` always means "A beats B."

---

## Step 0 — READ AND REPORT (before writing any code)

Report on all of the following. Do **not** start Step 1 until confirmed. (W3)

**0a. Existing teammate-table markup.** Read the current "Teammates, head to head" section in `src/pages/drivers/[id].astro` (~lines 231–285). Quote the markup: the qual/race bar-chart pattern, the points cells, the `f1-table.css` classes used. The H2H page reuses these patterns so the two surfaces look like one system.

**0b. Census shape.** Read `data/records/h2h-census.json` (Brief 13). Confirm fields present per entry: `a`, `b`, `slug`, `class`, `seasonsShared`. Filter `class === "race-comparable"` and report the count — **expect 3,223**. If it's not 3,223, stop and report the mismatch.

**0c. Census-universe confirm (the 792 check).** For every driver ID appearing in the race-comparable pairings, confirm a built `/drivers/[id]` page exists (ID is in the F1DB-valid index). **Report any pairing that references a driver without a page — should be zero.** This guarantees no H2H page links to a nonexistent driver. (This is the one-line resolution of the Brief-12-said-915 / census-used-792 discrepancy: prove the census universe == the built-page universe.)

**0d. Shared-team derivation.** Confirm the method to resolve the constructor(s) a pairing actually shared: cross-reference each driver's per-season `teams[]` (Brief 13 step 0e) by `seasonsShared`, emit the shared `constructorId`(s). Report the method + samples: Ham/Ros → `mercedes`; Bearman/Leclerc → `ferrari`. (Some pairings shared more than one team across stints — handle the list, not a single value.)

**0e. Toggle recompute logic.** Confirm the client recomputes from baked subcounts on a data attribute / inline per-page JSON — **no refetch**. Confirm the `seasons[]` entries AND the `aggregate` both carry the four `excl_*` fields (Brief 13), so both the career callout and the season rows can recompute. The three states (per Brief 12 read):

- **default:** `selfWins = raceAhead`, `mateWins = raceBehind`, `total = races`
- **+DNF:** `selfWins = raceAhead + excl_selfWinDNF`, `mateWins = raceBehind + excl_mateWinDNF`, `total = races + excl_selfWinDNF + excl_mateWinDNF`
- **+DNS (stacks on +DNF):** same wins/losses, `contested = total + excl_tiedDNF + excl_dns`

**0f. Gating.** Confirm no gating logic touches these pages (D2 — everything free).

---

## Step 1 — `getStaticPaths`

- Iterate `h2h-census.json`, filter `class === "race-comparable"` → the locked 3,223. **Not** a raw pairing enumeration.
- For each: `A = entry.a` (alpha-first), `B = entry.b`, slug = `entry.slug`.
- Load **both** driver JSONs. Read the pairing from **A's** `teammates[]` (A's perspective — `raceAhead` = A beats B). This fixes direction consistently for every page.

---

## Step 2 — Page template (mirror 0a patterns)

**Header**
- `{A name} vs {B name}` — both names link to `/drivers/[id]`, **red accent, obviously tappable** (E1).
- Shared team(s) → `/teams/[constructorId]` (from 0d), visible links.
- Year span from `seasonsShared`.

**Career callout strip**
- Qualifying H2H (`qualiAhead`–`qualiBehind`), race H2H (`raceAhead`–`raceBehind`), points (self / mate).
- Win / pole / podium rates computed inline from each driver's `totals` (`wins/races`, etc.). **Label these "career rate" explicitly** — they're career-wide, not shared-stint (D1). Do not present them as if scoped to the pairing.

**Ad slot** (E2)
- **Between the callout strip and the season table** — a natural break, after the primary summary, before the detailed table. Reuse the established slot pattern/id (`#records-ad-slot` / race-page slot). **One slot.** Never mid-table.

**Season-by-season table**
- Row per shared year: year → `/standings/[year]` (red/visible, E1), qual H2H, race H2H, points (self/mate). Mirror the driver-page teammate bar-chart style from 0a.

**Toggles** (vanilla JS, no React)
- Buttons: `Default` / `+DNF` / `+DNS`. On click, recompute **both** the career callout and the season rows from the baked subcounts (0e) — no refetch. Active mode visually obvious.
- Optional polish: if a pairing has zero excludable rounds (all `excl_*` = 0, e.g. a clean 1-race pairing), the +DNF/+DNS buttons may be hidden or disabled since they'd be inert.

---

## Step 3 — E1 pass (explicit — the thin pages depend on it)

Every outbound link (both drivers, shared team(s), each season) must be **visibly clickable** — red accent on primary nav, names read as tappable in tables. This matters most on the 1–2 race pairings (Bearman/Leclerc): a thin page is only justified as a rabbit-hole node if its links are prominent. A thin page that's also a dead-end is just a bad page.

---

## Step 4 — Verify (local, before handing back)

1. Build. **Confirm page count == census race-comparable count (3,223).**
2. Spot-check rendered pages:
   - `/h2h/lewis-hamilton-vs-nico-rosberg` — 4 seasons; toggles change the numbers correctly (default R 37–27 → +DNF adds the WinDNF buckets → +DNS adds contested); rates labeled "career rate"; ad slot at the break; all links resolve.
   - `/h2h/charles-leclerc-vs-oliver-bearman` — 1 season / 1 race; renders cleanly (not broken/empty); links out to both drivers, Ferrari, 2024 standings.
   - `/h2h/george-russell-vs-valtteri-bottas` — 2020; renders.
3. Confirm **no console errors** on toggle interaction.

---

## Step 5 — Commit (scoped)

`git add` **named paths only** — never `git add -A`:
- `"src/pages/h2h/[pairing].astro"` — **quote it** (zsh treats `[…]` as a glob and silently drops the add otherwise).
- any new client JS file for the toggle.
- any CSS additions (prefer extending shared `public/f1-table.css` over a new file).

Single commit, single purpose:
```
Brief 14: H2H pairing pages (3,223)
```

---

## Step 6 — Handoffs (do not skip — the cluster isn't done without these)

- **Search — Brief 16 (S1 + S2):** these pages are **not yet searchable**. Brief 16 adds them to `derive-search.mjs` with **both surnames as order-independent match terms**, so "rosberg hamilton", "hamilton rosberg", and "hamilton vs rosberg" all surface `/h2h/lewis-hamilton-vs-nico-rosberg` (S2). Per S1, the H2H cluster is not "done" until search sees it — Brief 16 ships as part of this cluster, not "later."
- **Driver-page links — Brief 15:** adds a "→ Full breakdown" link from each teammate row on `/drivers/[id]` to its H2H page. Separate brief.

---

## Definition of done

- [ ] Read-and-report (0a–0f) returned; 0c confirms zero pairings reference a page-less driver.
- [ ] `getStaticPaths` filters `class === "race-comparable"`; build produces exactly the census count (3,223).
- [ ] Career rates labeled "career rate"; ad slot at the callout→table break; one slot.
- [ ] Toggles recompute callout + season rows from baked subcounts, no refetch, no console errors.
- [ ] All outbound links prominent/red on primary nav (E1); the three spot-check pages render and link correctly.
- [ ] Scoped, quoted commit landed; not pushed (Tom reviews + pushes).
- [ ] Brief 15 (driver-page links) and Brief 16 (search indexing) flagged as remaining cluster work.
