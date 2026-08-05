# Brief 37 — Three fixes: inline header search, split-season render (for real), clickable H2H rows

**Purpose:** Three screenshot-confirmed issues from the Brief 35 batch. Each has a **literal pass/fail** tied to a specific rendered page — a fix isn't done until the page shows the pass condition, not until the code changed.

**Push status:** Cody commits (scoped, per item). Tom reviews + pushes.

---

## Item 1 — Search: replace the icon-panel with an inline header search

**Current state (screenshotted):** there's a magnifying-glass icon top-right; clicking it drops a floating "Search drivers, teams, circuits..." bar into the middle of the page. That's the wrong pattern.

**Wanted:** the **home page's inline autocomplete search**, placed **directly in the header nav**, visible on every page — not a hidden icon, not a floating panel.

- Remove the magnifying-glass-launches-floating-bar behavior.
- Put the existing home-page search component (inline field + autocomplete dropdown, backed by `search-index.json`) into `BaseLayout.astro`'s header so it's present on all pages.
- Reuse the home-page component/logic — same autocomplete, same matcher. No new search code.
- Mobile (~380px): it must fit without breaking the nav or causing horizontal scroll. If the full inline field genuinely can't fit the mobile nav, the *mobile* fallback can be a compact form — but **desktop is an inline visible search box**, and the floating-panel pattern is gone either way. Report the mobile treatment chosen.

**PASS =** on a driver page (e.g. Fisichella), an **inline search box is visible in the header** and typing autocompletes exactly like the home page. **FAIL =** a magnifying-glass icon, or a search that only appears after a click, or a floating centered bar.

---

## Item 2 — Fisichella 2009 split season still renders one team · **READ FIRST, then fix**

**Current state (screenshotted):** the season-by-season table shows one team per row — 2009 shows "Force ..." only. It must show **both** Force India and Ferrari (12 + 5 races). Brief 35 attempted this; it did not take on this table. So before touching anything:

**Step 0 — find the actual code that renders these rows.** The Brief 35 edit apparently changed a path that isn't the one producing this table. Grep the driver page for where a season row's TEAM cell is output (search for how the team name / color chip gets rendered in the season-by-season table specifically — not the header, not the H2H section). Confirm the file + line that produces the "Renault", "Sauber", "Force ..." cells on screen. **Report it before editing** — this is the whole reason attempt one missed.

**The fix (once the right code is found):** the TEAM cell renders **every entry in `s.teams`**, not just `primaryTeam`. For a season with >1 team:

> **Force India (12) · Ferrari (5)**

- Each team keeps its color chip.
- Order by races descending (matches `teams[]`).
- Single-team seasons unchanged (one team; show the count only when >1 team that season).

**Also fix the other surfaces where Ferrari drops** (flagged earlier): the Compare **career** Teams row and anywhere the driver's career team list is shown. The data has both teams (`career[].teams[]`, confirmed Brief 34) — this is purely render.

**PASS =** Fisichella's **2009 row shows Force India AND Ferrari with counts** (17 = 12 + 5), and his Compare career Teams row includes Ferrari. Spot-check Verstappen 2016 (Toro Rosso + Red Bull). **FAIL =** any split season still showing a single team.

---

## Item 3 — H2H teammate rows: whole row clickable

**Current state (screenshotted):** the "full breakdown" link is a tiny red `→` on the far right of each teammate row — hard to see, hard to tap, especially on mobile.

**Wanted:** the **entire teammate row is the click target**, and it visibly reads as clickable.

- Wrap/enable the whole row (`<tr>` or a row-level link) to navigate to `/h2h/[pair]`.
- Cursor pointer + a hover state on the row so it's obviously interactive (E1).
- Keep the `→` affordance if useful as a visual cue, but the click target is the full row, not just the arrow.
- Teammate name can still separately link to `/drivers/[id]` if that's desired — but the row's default action is the H2H breakdown. (If name→driver and row→H2H conflict, put the driver link on the name only and row-click = H2H; report the approach.)

**PASS =** tapping anywhere on the Alonso teammate row opens the Alonso H2H breakdown, and hovering the row shows it's clickable. **FAIL =** the only way to reach the breakdown is the little arrow.

---

## Commits (scoped, per item)
1. `BaseLayout.astro` (+ search component if adjusted) — inline header search
2. the season-table template (found in Item 2 Step 0) + `compare/[slug].astro` career teams — split-season render
3. driver-page H2H table — full-row click

Named paths, not `-A`. Base msg: `Brief 37: inline header search, split-season render fix, clickable H2H rows`. Not pushed.

## Definition of done (each verified against the actual page)
- [ ] **Search:** inline autocomplete box visible in the header on a driver page (not an icon/panel); mobile treatment reported.
- [ ] **Split season:** Fisichella 2009 shows Force India (12) · Ferrari (5); Compare career Teams includes Ferrari; Verstappen 2016 shows both. **Item 2 Step 0 read reported before the fix.**
- [ ] **H2H:** whole teammate row clickable to the breakdown, with a visible hover/cursor state.
- [ ] Scoped, per-item commits; not pushed.
