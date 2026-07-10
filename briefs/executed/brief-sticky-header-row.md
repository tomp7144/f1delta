# Brief: Sticky header row on tables (headers stay visible scrolling down)

**Status:** Ready for Cody
**Type:** Build — read-and-report first (this touches a known-fragile interaction), then implement.
**Follows:** Layer 3 (sticky first *column*) is live. This adds the sticky *header row*. They are independent axes.

## Goal

On long Astro tables (GP hub ~35 rows, circuits ~70+), when scrolling **down**, the column headers scroll out of view and you lose track of which column is which. Add a sticky header row so the `thead` stays pinned at the **top of the viewport** while scrolling down — following the reader down the whole page, not just within the table box.

Two separate sticky behaviors, do not conflate:
- **Sticky first column (Layer 3, DONE):** name stays visible scrolling **sideways**. Do not regress it.
- **Sticky header row (THIS brief):** column headers stay visible scrolling **down**.

Target: **viewport-sticky headers** (follow the reader down the page). This is the more useful behavior and directly solves the reported problem. It's also the version that interacts hardest with overflow containers — hence the read-first step. If Step 1 finds the containers make viewport-sticky genuinely unworkable, fall back to table-local sticky and report why.

## Known complication (flagged in the Layer 3 diagnosis — take seriously)

Sticky `thead` inside an `overflow` container pins to the **container's** top, not the viewport. Findings already on record:
- `TeamPage.astro` `.card` uses `overflow: hidden`
- `standings/[year].astro` `.card` uses `overflow: clip`
- Both `hidden` and `clip` establish scroll containers that can trap a sticky header at the box top instead of the viewport.
- Additionally, Layer 3's `.table-scroll` has `overflow-x: auto`, which is itself a scroll container on the x-axis — its effect on `thead` `top: 0` behavior must be confirmed, not assumed.

## Step 1 — Read and report (no code yet)

- For the in-scope Astro tables, report the full wrapper chain around each `<table>`: the `.table-scroll` (Layer 3, `overflow-x`) and any parent `.card`/section with an `overflow` value set. 
- Determine where a sticky `thead` (`position: sticky; top: 0`) would actually pin for each wrapper configuration — viewport or a container's top edge — given both the `.table-scroll` x-overflow and any parent `.card` overflow.
- Identify which containers block viewport-sticky and what minimal change would allow it (e.g. normalizing `.card` overflow, or restructuring where `overflow-x` lives).
- **Report the approach and any container changes you'd make before writing code.** This is the fragile interaction; we want to see the plan.

## Step 2 — Implement

- Make the header row sticky: `thead th` (or `thead`) `position: sticky; top: 0;`.
- Solid background on the header cells (`var(--surface)`) so scrolling rows don't show through.
- **z-index layering:** the header must sit above scrolling body cells; and at the top-left **corner** (first-column header), it must sit above *both* the sticky body column and the sticky header — the corner cell needs the highest z-index so neither axis bleeds over it.
- Normalize the `.card` `overflow: hidden` vs `overflow: clip` inconsistency **only if** it's blocking viewport-sticky, and **report exactly what you changed** and why. Prefer `clip` over `hidden` where a choice is needed (Cody's own note flagged `clip` as safe for sticky).
- Do not alter columns, data, sorters, or Layer 3's horizontal scroll.

## Step 3 — Verify (375px portrait AND desktop)

- **Scroll down** a long table (GP hub, circuits index): headers stay pinned to the top of the **viewport** and remain visible the whole way down.
- **Scroll sideways:** first column still frozen — Layer 3 not regressed.
- **Both at once:** the corner cell (first-column header) stays put and layers cleanly above both the scrolling body and the scrolling header — no bleed-through at the intersection.
- A short table (WCC, 2-column): no visual weirdness, header sticky harmless.
- The driver SPA is untouched (out of scope — its tables are handled at the fold).
- If viewport-sticky proved unworkable in Step 1 and you fell back to table-local, say so explicitly and show the reasoning.

## Step 4 — Commit

Scoped to the table CSS (and any `.card` overflow normalization, reported). No `git add -A`. Quote bracketed paths.

## Reminder
**Push after committing** — commits sit local until pushed; Netlify deploys only pushed commits. (This is the step that cost an afternoon last time.)
