# Brief: Nav restyle + prominent Donate button

**Status:** Ready for Cody
**Type:** Build — read-and-report first, then implement. Standalone (not part of the consolidation phases).

## Decision (locked — do not reinterpret)

- **Wordmark: `F1 ▲ DELTA` — uppercase, with the red triangle between.** (Currently lowercase `delta` on the Astro nav.)
- **Target look: the driver page's nav** — uppercase, mono, letter-spaced, more separated. This is achievable in BaseLayout with CSS alone; there is no technical barrier.
- **Non-negotiable: the nav must be identical across all Astro pages.** Consistency is the whole point.

## Context

The nav is already unified structurally: BaseLayout's single `<nav>` is used by all 21 Astro pages. So this is a **one-file change to BaseLayout that lands on every Astro page at once** — no cross-page migration.

The driver SPA (`public/driver.html`) has its own separate nav — it's the *source* of the look we're copying, but carries a stale 6-link set (incl. a dead `/pro` link). It is **NOT** touched here; it fully joins when it folds into Astro (consolidation, final phase). After this brief, the Astro pages match the driver page's *look* with the *correct* links; the driver page's own links get corrected at that later fold.

## Step 1 — Read and report (no code yet)

- Read BaseLayout.astro's nav markup and scoped nav styles in full — **including the existing mobile/hamburger behavior.** Report: wordmark markup, link list (confirm: Drivers · Teams · People▾ · Seasons · GPs · Circuits · Records · Fantasy), current CSS, and how the existing mobile hamburger works.
- Read the driver SPA's `TopBar` styling in `f1-driver.jsx` (~lines 537–545 + its CSS) to capture the exact nav-item treatment to replicate.
- Report, then implement.

## Step 2 — Restyle the nav

Apply the driver-page look to BaseLayout's nav, keeping BaseLayout's CORRECT link set (do NOT adopt the driver SPA's stale 6-link set):

- Wordmark: `F1 ▲ DELTA`, uppercase, red triangle (per the locked decision).
- Nav items: match the driver TopBar's treatment — uppercase, mono, letter-spaced, wider gaps. Use the exact values read in Step 1, applied to BaseLayout's link set.
- Keep all existing links and the People dropdown working.

Hardcoded values are fine here — the token consolidation phase sweeps these into variables later. Don't block on tokens.

## Step 3 — Add the Donate button

- Prominent, right-aligned, styled as THE single red accent (`#e10600`) — a filled or clearly outlined red button, e.g. `♥ Donate`.
- Links to `https://ko-fi.com/f1delta`, opens in a new tab (`target="_blank" rel="noopener noreferrer"`).
- Visually distinct from the plain nav links — a deliberate call-to-action.

## Step 4 — Mobile (preserve what exists — do NOT rebuild)

**A mobile hamburger menu already exists in BaseLayout's nav.** Do not build a new one, and do not change how it works. Just make sure the restyle (uppercase wordmark, mono links, spacing) doesn't break the existing hamburger, and that the **Donate button stays visible in the mobile/collapsed state** (it's the priority — not buried in the menu). Verify no horizontal scroll at ≤380px.

## Step 5 — Verify

- Nav + Donate render correctly and identically on: home, a hub (`/circuits`), and a detail page (`/circuits/[id]`).
- Donate goes to `ko-fi.com/f1delta`, opens in a new tab.
- Mobile: existing hamburger still works, Donate visible, no horizontal scroll.

## Step 6 — Commit

Scoped to `BaseLayout.astro` only. No `git add -A`. Quote bracketed paths.
