# Brief: Universal search (Layer 1) — build

**Status:** Ready for Cody
**Type:** Build — the most involved feature so far. Read-confirm, build, then expect a ranking-tuning pass.
**Depends on:** Brief 06 report (entity/field inventory, ~400-600KB combined size, ID'd vs ID-less split).

## Goal

Replace the homepage's driver-only search with **Google-style autocomplete** across every entity that has a page: as the user types, a grouped dropdown of suggested completions appears; they click or keyboard-select one and go to that page. Replicate the familiar Google search-suggestion pattern — don't invent a new interaction.

## Locked scope

**Index (Option B — decided from the 400-600KB size):** a baked **`search-index.json`** generated at build time, **fetched once on first focus/keystroke** (not inline — too big for the homepage payload). Structure each record minimally: `{ label, type, url, ...matchable fields }`. Build it so it could power search elsewhere on the site later.

**Indexed now — everything with a page:**
- Drivers (792) — match name, code, nationality
- Teams — match name, nationality
- People with real IDs — engineers, principals, technical directors — match name, role, team
- Circuits — match name, location/country
- Grands Prix — match name, country
- Seasons — match year, champion
- Records boards — match title (see disambiguation below)

**Deferred (do NOT index — no pages to link to):** the ~200 ID-less "other people" and ~430 constructor entrants. They have no stable ID / page, so a result would 404. They become indexable only if/when pages exist for them (separate future project). Do not attempt to include them.

## Interaction (Google-style autocomplete)

- Typing shows a **dropdown of grouped suggestions** below the search box, updating as they type.
- **Grouped by type**, in this order: Drivers → Teams → People → Circuits → Grands Prix → Seasons → Records. Each group labeled, and **capped** (e.g. top 5 per group) so no type floods.
- **Keyboard support:** arrow keys move through suggestions, Enter selects the highlighted one, Escape closes the dropdown. Mouse click also selects. (Standard autocomplete behavior.)
- Selecting a suggestion navigates to its `url`.
- Empty query / cleared box → dropdown closes.
- Clicking outside closes the dropdown.
- Keep the mobile fix from before: **no autofocus** — dropdown only appears once the user interacts.

## Records disambiguation (the owner's key example)

Records boards share prefixes ("Most Wins," "Most Wins in a Single Season," "Most Podiums…"). Do NOT let them flood or appear as ambiguous duplicates. Under the **Records** group, show each as a **disambiguated completion with its scope** — e.g. typing "most wins" suggests:
- Most Wins — Career
- Most Wins — Single Season
- Most Wins — by Constructor
- (etc., for the scopes that exist)

Each links to its specific board (`boardUrl`). The scope label comes from the board's scope (career/season/grand-prix/circuit/rate/streak → readable labels, as in RecordsHub). This is the "Google guesses which "most wins" you mean" behavior.

## Ranking (prefix/smart — the part that makes it feel like Google)

- **Prefix/word-start matching**, not raw substring-anywhere (substring-anywhere gets noisy — e.g. "in" matching everything). A query matches if it's a prefix of the label or of a word within it (and matches on code/nationality/location fields too).
- **Rank most-relevant first:** exact match > label-prefix match > word-prefix match > field match. Within equal relevance, a sensible tiebreak (e.g. drivers by career prominence if available, else alphabetical).
- Cap total suggestions shown (e.g. ~15-20 across all groups) so the dropdown stays usable.

**Ranking will need tuning after real use** — see the closing note. Build a reasonable v1; don't try to perfect it on paper.

## Step 1 — Read-confirm before building

- Confirm the `search-index.json` build approach: how/where it's generated (a build script, an Astro endpoint, etc.), and that it reads the entity data sources from Brief 06.
- Confirm the current inline search implementation in `src/pages/index.astro` (the `window.F1_DRIVER_INDEX` matcher) — report exactly what's being replaced/extended so drivers keep working through the transition.
- Confirm each entity's destination URL and the fields available to index per the Brief 06 inventory.
- Report the plan, then build.

## Step 2 — Build

- Generate `search-index.json` at build time from all indexed entities.
- Replace the homepage search with the autocomplete component: fetch index on first focus, prefix/smart match, grouped capped suggestions, records disambiguated, keyboard + mouse selection, navigate on select.
- Drivers must keep working (they're the current behavior — don't regress them).
- No autofocus (mobile).

## Step 3 — Verify

- **Drivers:** "hamilton" and "HAM" suggest Hamilton → links to `/drivers/lewis-hamilton`. Not regressed.
- **Multi-type:** "ferr" suggests Ferrari (Team) and any Ferrari-related records, grouped and labeled.
- **Records disambiguation:** "most wins" shows the scoped variants (career/season/etc.) as separate pickable suggestions under Records, each linking to the right board.
- **Other entities:** a circuit ("monza"), a GP ("british"), a person ("vasseur" or an engineer), a season ("2021") each suggest correctly and link to the right page.
- **Grouping + caps:** groups labeled and ordered; no single type floods; total suggestions capped.
- **Keyboard:** arrows navigate, Enter selects, Escape closes.
- **No dead links:** every suggestion links to a real page (nothing from the deferred ID-less set appears).
- **Mobile:** no keyboard on load; dropdown works on tap; no horizontal overflow.
- **Homepage payload:** index is fetched (not inline) — confirm the homepage HTML didn't balloon.
- Build succeeds; no console errors.

## Step 4 — Commit

Scoped to: the search-index generation (build script / endpoint), `src/pages/index.astro` (search component), and the new `search-index.json` output. No `git add -A`. Quote bracketed paths.

## Push
Build brief — **it ends in a push.** Push after review, then verify live.

## After this brief — ranking tuning (expected, not a failure)
"Feels like Google" lives in the ranking, which can't be perfected on paper. After you use it, note anything that ranks wrong ("typing X should suggest Y first, but it shows Z") and we'll do a focused tuning pass. Treat v1 as the working foundation, then refine the ordering from real use. This is normal for search — not a bug.
