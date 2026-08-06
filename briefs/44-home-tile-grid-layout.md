# Brief 44 — Home page layout: tile grid, no dead space

**Purpose:** The home-page content is right (hero threads fixed in Brief 43, results card, trivia/compare/f1δ tiles) but the **layout is lopsided** — the hero sits alone top-left, the full 22-row results table is on the right, and everything else got dumped below, leaving a huge white gap on the left. Fix is **layout only, no content changes**: make it a true tile grid (NHL-dashboard style) where the results table stays full-height as its own column and the other tiles pack into the space beside it via dense grid flow, so there's no void.

**Explicitly do NOT trim any tile's content.** Results keeps all 22 finishers. The fix is tiling the others around it, not shortening it.

**Push status:** Cody commits (scoped). Tom reviews + pushes.

---

## The layout model

Reference: Tom's NHL screenshot — several bordered tiles tessellating into one dashboard, no single box leaving a gap.

- **Results tile** — full field, all 22 rows, **as tall as it needs**. Pinned as a **full-height column** (e.g. the right-hand column), spanning the grid's full height. **Untouched content.**
- **The other tiles** — **hero** (larger feature tile), **trivia**, **compare**, **f1δ leaderboard**, **reserved editorial slot** — tile into the **remaining columns beside the results column**, packing to fill the space so the tall results column no longer leaves the left side empty.
- **`grid-auto-flow: dense`** (or explicit placement) so the shorter tiles backfill the vertical space the tall results column occupies — this is the mechanic that kills the gap: the browser packs the shorter tiles into whatever space is available rather than stacking them in one lonely column.

## Step 1 — Grid structure
- CSS grid on the home page container. Columns: results as one dedicated column (full height); the other tiles occupy the remaining 2–3 columns on wide desktop.
- **Hero** as a **larger feature tile** — span 2 columns (or 2 rows) so it reads as the centerpiece among the equal-weight tiles, per the NHL reference. The rest (trivia, compare, f1δ, editorial) are similar-sized tiles filling around it.
- `grid-auto-flow: dense` so tiles tessellate and there's **no dead white space** beside the tall results column.
- Consistent tile styling (the bordered-box look already in use) so they read as one dashboard.

## Step 2 — Responsive
- **Wide desktop:** multi-column (results column + hero-feature-tile + the others tiling around). Fine at 3–4 columns.
- **Narrower:** collapse to 2 columns, tiles reflow (dense flow handles it).
- **Mobile ~380px:** single column, tiles stack in a sensible order (hero → results → trivia → compare → f1δ → editorial, or Tom's preferred order), no horizontal scroll. On mobile the tall results table just becomes one long section — fine.

## Step 3 — No content changes (guardrail)
- **Do not** trim the results table, the f1δ peek, the hero threads, or any tile's content. This brief moves boxes; it does not edit what's in them.
- Every tile still links out where it did (results → race page, f1δ → leaderboard, hero threads → entities, etc.).

## Step 4 — Verify
- **No giant white gap** anywhere — the space beside the tall results column is filled by the other tiles.
- Results tile shows the **full 22-row field** (unchanged), as a full-height column.
- Hero reads as the larger feature tile; trivia/compare/f1δ/editorial tile around it, evenly, no lonely-column-with-a-canyon.
- Tiles tessellate (dense flow) — a taller tile doesn't leave a hole next to it.
- Desktop multi-column → narrower 2-col → mobile single-column all render cleanly; no horizontal scroll at ~380px.
- All tile links still resolve; hero threads still styled correctly (Brief 43 not regressed).

## Step 5 — Commit (scoped)
`src/pages/index.astro` + its grid CSS. Named paths, not `-A`. Commit: `Brief 44: home page tile-grid layout (results full-height column, tiles pack around, no gap)`. Not pushed.

## Definition of done
- [ ] Tile grid with `grid-auto-flow: dense`; results pinned as a full-height column, all 22 rows, **content untouched**.
- [ ] Hero as larger feature tile; trivia/compare/f1δ/editorial tile around the results column with **no dead space**.
- [ ] No tile content trimmed (results, f1δ, hero threads all as-is).
- [ ] Desktop multi-column, narrower 2-col, mobile single-column; no horizontal scroll.
- [ ] Links resolve; Brief 43 thread styling intact.
- [ ] Scoped commit; not pushed.
