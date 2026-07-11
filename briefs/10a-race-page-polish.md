# Brief 10a: Race page presentation polish

**Status:** Ready for Cody
**Type:** Build — small presentation fixes. Nail the race-page template before Brief 10 wires 1,158 of them into the web.
**Why first:** The race page is a template replicated across ~1,158 pages, and Brief 10 will copy its prev/next-arrow pattern. Fix the visible warts and the arrow styling now so the wiring builds on good pages and inherits good styling.

Three fixes, all presentation. Read the relevant files first, then implement.

## Fix 1 — Race result tables: reconcile with the shared table system

Owner noted the race tables "look different than all the other tables — not bad, just different." Determine whether that's intentional or drift.

- Report whether `src/pages/races/[raceId].astro` tables use the shared `f1-table.css` + `tokens.css` + `.table-scroll`, or bespoke styling.
- If bespoke/drifted → bring them onto the shared table system so they're visually consistent with driver/season/circuit tables (same header treatment, row rhythm, mono numerals, frozen-first-column scroll).
- If the difference is *legitimate* (race results genuinely need different columns/structure than a season table), that's fine — but the **chrome** (fonts, borders, spacing, colors) should still match the shared system. Only the columns differ, not the styling language.
- Preserve what already works: the horizontal scroll + frozen first column (owner confirmed it works well).

## Fix 2 — Surface Fastest Lap + Driver of the Day

Currently "nearly invisible at the bottom." Driver of the Day especially is a fan-favorite stat and shouldn't be buried in tiny text.

- Give Fastest Lap and Driver of the Day proper visual weight and a sensible position — not tiny gray text at the very bottom. Options: a small highlighted "race highlights" strip near the top (under the header) or clearly-styled callout rows, whatever fits the page cleanly.
- These are per-race and may be absent in early eras — keep the graceful omission (don't render the item if the data isn't there; no "N/A").
- Make them readable and findable at a glance.

## Fix 3 — Fix the prev/next SEASON arrow contrast (this pattern gets replicated)

On the season pages (`/standings/[year]`), the previous/next season navigation is **near-invisible** — gray text on a light-gray background, small font. Owner stumbled on it by accident.

- Fix the contrast and size: legible font size and proper contrast against the background (use `tokens.css` — `--ink`/`--red`/`--dim` as appropriate, not a near-background gray). Make prev/next season clearly visible as navigation.
- Keep the styling in `tokens.css` variables so it's themeable.
- **Important:** Brief 10 will add prev/next **race** arrows using this same pattern — so fixing it here means the race arrows inherit the corrected, visible styling. Note the pattern location so Brief 10 can reuse it.

## Step 1 — Read-confirm

- Report the race table's current styling (shared vs. bespoke) for Fix 1.
- Report where Fastest Lap + DotD currently render on the race page for Fix 2.
- Report the prev/next season arrow markup + styling on `/standings/[year]` for Fix 3, and confirm it's the pattern Brief 10 should reuse for race arrows.
- Report, then implement.

## Step 2 — Implement the three fixes.

## Step 3 — Verify

- **Race table:** `/races/2016-malaysian-grand-prix` tables match the site's other tables in chrome (fonts/borders/spacing/mono numerals); horizontal scroll + frozen first column still work.
- **Fastest Lap + DotD:** clearly visible and well-placed on a modern race (2016 Malaysian GP); cleanly absent on a 1950s race (no empty item, no "N/A").
- **Season arrows:** on `/standings/2016`, prev/next season navigation is clearly visible and legible (not gray-on-gray).
- Mobile: race page still scrolls tables horizontally, no page overflow; season arrows readable on mobile.
- Spot-check 2-3 races across eras for consistent, graceful rendering.

## Step 4 — Commit

Scoped to `src/pages/races/[raceId].astro`, `src/pages/standings/[year].astro`, and any shared CSS touched. No `git add -A`. Quote bracketed paths.

## Push
Build brief — **it ends in a push.** Push after review, verify live.

## Next
Brief 10 — bidirectional interconnection (season↔race↔circuit↔GP↔driver) + prev/next **race** arrows (reusing the now-fixed season-arrow pattern). This is the "impossible to find" fix — the web.
