# Brief 43 — Fix the hero connection threads (Brief 39 bug, recurring)

**Purpose:** The home-page hero renders its connection threads as one unstyled run-on blob — "TeammatePedro Diniz2 seasonsTeammateUkyo Katayama2 seasonsTeamTyrrell3 seasons…" — no separation, labels glued to names glued to durations. **Same root cause as Brief 39's search dropdown:** content built via `innerHTML` at runtime never receives Astro's scoped-style attribute (`[data-astro-cid]`), so scoped CSS silently doesn't apply and it falls back to bare inline links. Two-part fix (styling + structured labels), same as the search dropdown — plus a grep for other components with the same latent bug so we stop finding it one screenshot at a time.

**PASS =** the hero card shows **separated threads** — a "Teammate" tag, "Pedro Diniz" as a link, "2 seasons" as muted secondary text, each thread its own chip/row. **FAIL =** one continuous blue blob with labels/names/durations mashed together.

**Push status:** Cody commits (scoped). Tom reviews + pushes.

---

## Step 0 — Confirm it's the Brief 39 pattern
Confirm the hero card's threads are built via `innerHTML` (or equivalent runtime DOM creation) and that the thread CSS is **scoped** (so it doesn't reach the runtime-created elements). Report — this should match the search-dropdown diagnosis exactly. Also confirm whether the label text ("Teammate" / "Team") and duration ("2 seasons") are **concatenated into one string** with the name (the second half of the bug).

---

## Step 1 — Styling that survives `innerHTML`
- Make the thread styles reach the runtime-built elements — use `:global()` on the thread classes (the same escape hatch that fixed Brief 39's `.srch-opt`), or apply the classes such that scoped styles reach them.
- Each **thread is its own chip/row**: block or inline-block with spacing, padding, a visible boundary between threads (gap/border/background), hover state, cursor pointer. No run-on inline text.
- Verify in the **built CSS** that the thread rules appear **without** the `[data-astro-cid]` scoping (so they match the injected elements) — the same check that confirmed the search fix.

## Step 2 — Structured labels (stop the concatenation)
Each thread renders as **distinct elements**, not one glued string:
- **Relationship label** ("Teammate" / "Team" / "Engineer" / etc.) — a small tag/badge or muted prefix, visually distinct.
- **Name** — the linked entity (`Pedro Diniz` → `/drivers/[id]`, `Tyrrell` → `/teams/[id]`).
- **Duration / meta** ("2 seasons", "3 seasons") — muted secondary text, separated from the name.
- So a thread reads clearly as: **[Teammate] Pedro Diniz · 2 seasons**, three separated pieces, not "TeammatePedro Diniz2 seasons".

## Step 3 — Grep for other latent cases (stop finding this one screenshot at a time)
This is now the **second** occurrence (search dropdown was the first). Any component that builds DOM via `innerHTML` and relies on scoped `<style>` has the same latent bug. 
- Grep the codebase for `innerHTML` (and similar runtime DOM string-building) used in components that have scoped `<style>` blocks.
- **Report the list** — for each, note whether its styles are scoped (at risk) or already `:global()`/inline (safe). Candidates to check: the trivia game cards, the f1δ leaderboard peek, the compare picker dropdown, any other runtime-rendered card.
- Fix any that are visibly broken now; **flag** any that are latent-but-not-yet-visible so Tom knows they're coming rather than discovering them live. (Don't blanket-rewrite working components — just report and fix confirmed breakage.)

## Step 4 — Verify
- **Salo hero card** (or whoever loads): threads render as separated chips — "Teammate" tag + "Pedro Diniz" link + "2 seasons" muted; teams the same. No blue blob, no glued text.
- Threads are clickable to the right pages; hover shows they're interactive.
- The search dropdown (Brief 39) still renders correctly — didn't regress it.
- Any other `innerHTML` components fixed here render cleanly; latent ones reported.
- Mobile ~380px: threads wrap/stack cleanly, no horizontal overflow.

## Step 5 — Commit (scoped)
Hero card component + its CSS (`:global()`) + any other component fixed. Named paths, not `-A`. Commit: `Brief 43: fix hero connection-thread styling (innerHTML scoped-CSS) + structured labels`. Not pushed.

## Definition of done
- [ ] Confirmed same innerHTML/scoped-CSS root cause as Brief 39.
- [ ] Threads styled via `:global()` (verified in built CSS); each thread its own separated chip/row.
- [ ] Label / name / duration rendered as distinct elements — no concatenated string.
- [ ] Salo card shows clean separated threads, not a blob; threads clickable.
- [ ] Grep for other `innerHTML`+scoped-style components done; broken ones fixed, latent ones reported.
- [ ] Search dropdown not regressed; mobile-safe.
- [ ] Scoped commit; not pushed.
