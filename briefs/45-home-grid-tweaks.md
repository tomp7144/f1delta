# Brief 45 — Home page grid tweaks: width, standings, fix f1δ tile, legible labels

**Purpose:** The tile grid works structurally (Brief 44) but has five issues: the page is forced narrow (wasting the screen), the f1δ tile links to Fantasy and may be showing wrong data, there's no standings tile, the tile labels are illegibly gray, and the Stories tile renders badly. Fix all five. **One is read-first** because Tom flagged the f1δ tile might be showing fantasy data mislabeled as f1δ — confirm before "fixing."

**Push status:** Cody reports Step 1 (f1δ data source) before touching that tile; then builds the rest. Tom reviews + pushes.

---

## Step 1 — READ FIRST: what is the f1δ tile actually showing?

The current "F1Δ 2026" tile shows numbers (429, 344, 285…) and its "Full →" link goes to **Fantasy** — which is wrong (f1δ and the fantasy game are unrelated). Tom's concern: the tile may be reading **fantasy data mislabeled as f1δ.**

**Report before changing:**
- What data source does that tile read? The real f1δ career leaderboard (`data/f1delta/*` / the `/f1delta` page's data), or something from the **fantasy** pipeline?
- Are the displayed numbers the actual **f1δ Score** (Brief 25/26 definition — per-season %-of-max summed), or fantasy scores?
- Where does "Full →" currently point, and confirm the correct target is `/f1delta` (the leaderboard) — **not** `/fantasy`.

If the tile is showing fantasy data under an "F1Δ" label, that's a data-integrity bug (a mystery-metric relapse) — fix it to show **real f1δ**, don't just relabel. Report the finding.

---

## Step 2 — Widen the page to use the screen

Currently the grid is constrained to a narrow center column with large dead margins. Widen it:
- Use near-full viewport width with **~100px padding on each side** (Tom's reference from his other site). So roughly `max-width: calc(100vw - 200px)` or a fluid container with `padding: 0 100px` (clamp the padding down on smaller screens so it doesn't crush the content).
- With the extra width, the grid gets **more columns** — tiles spread out and breathe instead of squishing into the middle third.
- Keep `grid-auto-flow: dense` (Brief 44) so tiles still tessellate with no gaps at the wider width.
- Responsive: the 100px side padding should **scale down** on narrower viewports (e.g. `clamp`), collapsing toward normal mobile padding at ~380px. Don't hardcode 100px at all sizes.

## Step 3 — Add a Standings tile

- New tile: **current championship standings** (the practical, self-explanatory one). Driver standings — position, driver, points — top N with a "Full standings →" link to the standings page.
- Standings are self-explanatory: **no caveat/explanation needed** (unlike f1δ).
- Source it from the existing standings data (already baked — `public/standings.json` or equivalent; confirm).

## Step 4 — Fix the f1δ tile (real data + explanation + correct link)

Keep an f1δ tile, but make it honest (M1 — every derived metric shows what it is, nearby):
- Show the **real f1δ leaderboard** (top N career f1δ), confirmed from Step 1.
- **A one-line explanation in the tile** — e.g. "Era-fair driver rating: each season scored against its own maximum, summed." Brief and plain.
- **A link that actually explains it** — "What is this? →" / "Why we built this →" pointing to `/methodology` (the full f1δ explanation), **and/or** "Full leaderboard →" to `/f1delta`. **Not** `/fantasy`.
- So the tile can't be a mystery number: label + one-line what-it-is + link to the full explanation, all right there.

## Step 5 — Legible tile labels

The tile titles ("TRIVIA", "COMPARE", "F1Δ 2026", "STORIES", etc.) are too-light gray — hard to read. Darken them to a legible weight/color (darker ink, or the site's red accent for the label). They're the wayfinding for the dashboard; they need to be visible.

## Step 6 — Fix the Stories tile (keep it, make it look deliberate)

Tom wants the Stories tile to stay. Currently it renders as cramped wrapped text ("In-depth features and analysis coming soon"). Make it a **clean, deliberate coming-soon tile** — proper sizing so the text doesn't wrap to death, a tidy "Stories — coming soon" treatment with the "About f1delta →" link, styled to match the other tiles. It should read as an intentional placeholder, not a broken box. (With the wider page, it has more room, which helps.)

---

## Step 7 — Verify
- **Width:** page uses the screen with ~100px side padding (scaling down on narrow); tiles spread into more columns, no cramped center-third; padding collapses gracefully on mobile.
- **Standings tile** present, top N + full link, self-explanatory.
- **f1δ tile** shows **real f1δ** (Step 1 confirmed), has a one-line explanation, and links to `/methodology` and/or `/f1delta` — **never /fantasy**.
- **Labels** legible on all tiles.
- **Stories tile** looks deliberate, not broken.
- Grid still tessellates (no gap); mobile ~380px single-column, no horizontal scroll; all links resolve.

## Step 8 — Commit (scoped)
`src/pages/index.astro` + grid/tile CSS (+ standings tile component if new). Named paths, not `-A`. Commit: `Brief 45: widen home grid, add standings, fix f1δ tile (real data + explanation + methodology link), legible labels, tidy stories`. Not pushed.

## Definition of done
- [ ] Step 1 reported: confirmed whether the f1δ tile was showing real f1δ or fantasy data.
- [ ] Page widened (~100px side padding, scaling down); tiles use the screen; dense flow intact.
- [ ] Standings tile added (self-explanatory, links to full standings).
- [ ] f1δ tile shows real f1δ + one-line explanation + link to `/methodology` / `/f1delta` (not `/fantasy`).
- [ ] Tile labels legible.
- [ ] Stories tile looks deliberate, not broken.
- [ ] Mobile-safe; links resolve; scoped commit; not pushed.
