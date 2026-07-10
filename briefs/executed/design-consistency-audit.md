# Brief: Design consistency audit — map every layout / nav / styling system

**Status:** Ready for Cody
**Type:** Diagnostic — read-and-report only, NO code changes

## Context

The site has drifted into multiple inconsistent design systems. Known symptom: the top nav differs between the individual driver page and every other page. We also believe the home page diverges from the rest — a leftover from a Claude Design pass that was later reworked. Before fixing anything, we need a complete, factual map of how many distinct layout / nav / styling systems are actually live, which pages use which, and where they diverge.

End goal (a LATER brief, not this one): consolidate to ONE layout system — one nav, one set of design tokens — applied everywhere. This brief only establishes ground truth so we can plan that consolidation. **Change no code. Read and report only.**

## What we believe — confirm or correct, do NOT assume these are right

Treat every item below as a hypothesis to verify against the actual files, not as established fact:

- `BaseLayout.astro` is the shared layout and provides the "current" nav for most Astro pages.
- The individual driver page renders its own header *outside* BaseLayout — a private, stale nav copy (missing People / Seasons / GPs / Circuits / Fantasy, still shows PRO).
- The old home modules (`f1-data.jsx`, `f1-timing.jsx`, `f1-sections.jsx`, `f1-fantasy.jsx`, `f1-app.jsx`, `tweaks-panel.jsx`) are orphaned / dead — but the home page may still diverge for other reasons.

## Investigation — report findings, touch nothing

### 1. Route / page inventory
- List every route in `src/pages/` that renders a page (`.astro` files; ignore API / function endpoints).
- For each: does it import/use `BaseLayout` (or any layout)? If it uses no layout, note that explicitly.
- Explicitly identify the home page route (`index.astro`) and the driver detail route.

### 2. Layout inventory
- List everything in `src/layouts/`. Is `BaseLayout.astro` the only layout, or are there others?
- Read `BaseLayout.astro` in full. Report: its nav link set (exact labels + order), the wordmark text and casing (`F1 ▲ DELTA` vs `F1 ▲ delta`), and how the header **and footer** are structured.

### 3. Nav copies — the divergence map (the core of this audit)
- Grep both `src/` and `public/` for nav link labels to find every place nav markup is defined. Suggested search terms: `Circuits`, `Seasons`, `Engineers`, `STANDINGS`, `People`, `Fantasy`, `Records`.
- For every distinct nav definition found, report as a table: file path, full link set, wordmark text + casing, and whether it still contains a `PRO` link.
- Confirm specifically: does the driver page renderer (`f1-driver.jsx` or whatever mounts it) contain its own `<header>` / `<nav>`? Does the home page?

### 4. Home page specifics
- What does `index.astro` actually render? Does it use BaseLayout, or its own shell?
- Which `public/*.jsx` modules does it load via `<script>` tags? List them.
- Grep for script-src references to the six suspected-dead modules above — are any still referenced by the home page (or anywhere else)? Report which are truly orphaned vs still wired.
- Note any home-page-specific CSS file or `<style>` block that looks like a Claude Design leftover, distinct from the shared styles.

### 5. Styling / design-token sources
- Locate where global styles / design tokens live (the core system: light near-white bg, near-black ink, single red accent, tabular mono numerals, 8px team-color dots). Is there one shared stylesheet, or several?
- For the home page, the driver page, and one representative BaseLayout page: report where each gets its styles — shared stylesheet, page-specific external CSS, Astro scoped `<style>`, or inline.
- Bottom line to answer: how many separate sources of truth exist for the core design tokens (colors, type, spacing)?

### 6. Symptom tie-back
- State plainly, from the files: exactly how the driver-page nav differs from BaseLayout's nav — links present/absent, `PRO` present, wordmark casing. This confirms the reported symptom against ground truth.

## Output

A structured report covering sections 1–6, ending with a short synthesis in this shape:

> "There are **N** distinct [layout / nav / styling] systems. Page X uses system A, page Y uses system B. They diverge on ___."

Flag anything surprising, but do **NOT** propose or implement the fix — we'll build the consolidation plan from your map.

**Report back and wait. No code, no commits.**
