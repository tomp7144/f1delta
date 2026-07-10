# Brief: Phase 0 — True structural audit

**Status:** Ready for Cody
**Part of:** Site Consolidation Master Plan — this is the foundation phase. Everything else depends on its output.
**Type:** Diagnosis. Read-and-report only. NO code changes.

## Why this exists

We're consolidating the site to end the patchwork. Before touching anything, we need an ACCURATE map of how every page renders its shell (layout, nav, footer). The earlier design audit was high-level and turned out to be wrong about exactly this — it claimed all Astro routes use BaseLayout, but a footer added to BaseLayout appears only on some pages. So we re-audit from the files, precisely, and treat nothing as already known.

## The concrete puzzle to solve

A footer was added to BaseLayout. Observed result:

- **Footer MISSING:** `teams` (index), `circuits` (index), `records` (index), `drivers` (index) — the section index pages. Also the driver detail page (`driver.html`).
- **Footer PRESENT:** individual record pages (`records/[...path]`), individual circuit pages (`circuits/[id]`), and the home page.

Detail pages have it; section index pages don't. **Explain exactly why, per page.** That explanation IS the core deliverable — it tells us which pages aren't going through the shared shell, and why.

## Investigate — report findings, change nothing

### 1. Complete route inventory
List every page-rendering route in `src/pages/` (all `.astro`; ignore `/api` and function endpoints). Separately note the driver SPA at `public/driver.html` (outside the Astro build — the known exception).

### 2. Per-route shell mechanism (the core)
For EACH route, determine and report:
- Does it import a layout? **Which one** (exact path)? BaseLayout, or something else?
- Does it wrap its content in that layout, or does it define its **own** `<html>` / `<head>` / `<body>`?
- Does it mount a heavy client/React component (the window-global pattern)? If so, into what container, and does that component render its own document structure or just fill a mount point?
- **Does BaseLayout's footer appear in this page's rendered output? (yes/no)** — must match the observed pattern above; if it doesn't, dig until it does.

### 3. Resolve the footer split explicitly
Group the routes into "has footer" and "no footer," and for each group state the shared structural reason. Specifically: are the section index pages (`teams/index`, `circuits/index`, `records/index`, `drivers/index`) NOT importing/wrapping BaseLayout? Using a different layout? Wrapping it but overriding/covering the footer? Rendering their own shell via a nested component? **Name the exact mechanism for the group.**

### 4. Re-confirm the earlier audit's specific claims (we now doubt them)
- Is there really only ONE layout (`BaseLayout.astro`), or are there other layouts / a BaseLayout variant in `src/layouts/` (or elsewhere) that some pages use?
- How many distinct nav renderers exist, and which pages use each? (Earlier finding: BaseLayout's nav + the driver SPA's own `TopBar`, plus an orphaned `SiteNav.astro`. Confirm or correct.)

### 5. Identify the soundest canonical basis (facts, not decision)
Of the shells in use, which one do the correctly-working pages (home + detail pages) use — i.e. which is the de-facto standard the divergent pages should migrate onto in Phase 1? Report it. (The final canonical decision — including the nav restyle and the prominent Donate button — is Phase 1. Phase 0 just identifies the soundest existing basis.)

## Output

A single table: `route → layout used → shell mechanism → footer present? → divergent (Y/N)`.

Then a short synthesis:
- The canonical shell, and the exact list of Astro pages that diverge from it — these are Phase 1's migration targets.
- The one-line structural reason the footer is missing where it's missing.
- The driver SPA bucketed separately as the Phase 4 exception.

Flag anything surprising. **No code, no commits. Report and wait** — Phase 1 is scoped from this map.
