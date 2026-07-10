# Brief: Phase 1 — Token consolidation

**Status:** Ready for Cody
**Part of:** Site Consolidation Master Plan, Phase 1.
**Type:** Refactor — read-and-report first, then implement.
**Prerequisite:** Purge-on-deploy should be live first (this ships a new unhashed stylesheet; stale-cache confusion during QA would be miserable).

## Context

Design tokens are duplicated across three places, and they have drifted:

| Source | Form | Notes |
|---|---|---|
| `src/layouts/BaseLayout.astro` scoped `<style>` | Raw hex literals | Now also carries the new nav styles (Barlow Condensed wordmark, JetBrains Mono links, `#e10600` Donate button) |
| `src/pages/index.astro` scoped + `is:global` `<style>` | Raw hex literals | |
| `public/f1-driver.jsx` inline `:root` block (~line 387) | Real CSS variables | The most complete definition — the de-facto standard |

Known drifts (one-digit differences that should be a single value):
- ink: `#15171c` (driver) vs `#16161a` (BaseLayout)
- line: `#e4e4de` (driver) vs `#e4e4df` (BaseLayout)
- dim: `#5b606b` (driver) vs `#6b6b70` (BaseLayout)

Consequence today: changing the red accent, a border color, or a font is a three-file edit that silently drifts. This phase makes it a one-file edit.

**This is a refactor, not a restyle. The site should look the same afterward** — except where a drift is intentionally resolved, and except the font decision below if approved.

## The architectural constraint (this drives the design)

`public/` has no bundler (Babel standalone, window globals). Astro fingerprints CSS it imports from `src/`, producing hashed filenames the SPA can't reference. So a shared token file must live at a **stable, unhashed path both can `<link>`**:

**Create `public/tokens.css`**, containing a single `:root { ... }` block. Both `BaseLayout.astro` and `public/driver.html` link it. One file, two consumers, no bundler needed, no `GATING_ENABLED`-style two-copy seam.

(After the driver SPA folds into Astro in a later phase, tokens can migrate into `src/styles/` and get fingerprinted. Not now.)

## Step 1 — Read and report (no code yet)

- Extract **every** color, font-family, font-size, letter-spacing, and spacing literal from all three sources: `BaseLayout.astro` (including the new nav styles), `src/pages/index.astro` (both style blocks), and `public/f1-driver.jsx` (its `:root` block **and** any literals used outside it).
- Produce a table: `value → every place it's used → proposed token name`.
- **Explicitly list every near-duplicate** — the three drifts above plus any others found. For each, state which value appears where.
- Report which fonts each page currently loads and which font each uses for body text. (Known: the driver page uses Inter for body; Astro pages fall back to `system-ui`. The nav restyle added Barlow Condensed + JetBrains Mono to BaseLayout.)
- Confirm `public/f1delta.css` (the dark Pro-page system, used only by `public/pro.html`) is unreferenced by anything in scope. **It is out of scope — do not touch it.**
- **Report back and wait for confirmation.** Two decisions come out of this report:
  1. **Canonical value for each drift.** Default: take the driver page's value, since we standardized on its look. Confirm before applying.
  2. **Body font.** Standardizing on Inter site-wide would make Astro pages match the driver page — but it's a visible change on every page and adds a font load. Flag it; do not apply without approval.

## Step 2 — Create `public/tokens.css`

- One `:root` block with the agreed tokens. Names follow the driver page's existing convention (`--bg`, `--surface`, `--ink`, `--dim`, `--faint`, `--line`, `--red`, `--champ`, `--disp`, `--mono`, …), extended as needed for values found only in BaseLayout or index.astro.
- Include type tokens for the nav treatment now hardcoded in BaseLayout (mono nav size, letter-spacing, wordmark size) so the nav is themeable too.
- No selectors other than `:root`. This file defines variables; it does not style anything.

## Step 3 — Wire it up

- `BaseLayout.astro` `<head>`: `<link rel="stylesheet" href="/tokens.css">`, **before** any other stylesheet or scoped style that consumes the variables.
- `public/driver.html` `<head>`: the same link, before the SPA's styles.
- Remove the `:root` block from `public/f1-driver.jsx` — it now inherits from `tokens.css`. Its `var(--…)` usages stay exactly as they are.

## Step 4 — Replace literals with `var()`

- `BaseLayout.astro`: every color/font literal → the corresponding `var(--token)`.
- `src/pages/index.astro`: same, in both the scoped and `is:global` blocks.
- `public/f1-driver.jsx`: already uses `var()` throughout — verify nothing broke when its `:root` was removed, and convert any stray literals found in Step 1.

Do not restyle, reorder, or "improve" anything while in these files. Substitution only.

## Step 5 — Verify

- **Visual parity is the acceptance test.** The home page, a hub page, a detail page, the four legal pages, and the driver page should all look the same as before — except:
  - pages that were using the "losing" side of a drift now show the canonical value (subtle, expected),
  - the body font, if the Inter decision was approved.
- The nav (just restyled) is pixel-unchanged.
- The driver page is pixel-unchanged (it already used these variables).
- No unstyled flash on load; `tokens.css` loads before consumers.
- Mobile: no layout shift, no horizontal scroll.
- Grep the three files for leftover hex literals — there should be none outside `tokens.css`.

## Step 6 — Commit

Scoped to: `public/tokens.css` (new), `BaseLayout.astro`, `src/pages/index.astro`, `public/f1-driver.jsx`, `public/driver.html`. No `git add -A`. Quote bracketed paths.

## Out of scope

- `public/f1delta.css` and `public/pro.html` (dormant dark Pro system).
- Any visual redesign. Tables come in the next phase, on top of these tokens.
- The dead JSX files — separate cleanup.
