# Brief 39 — Fix the header search autocomplete dropdown

**Purpose:** The inline header search (Brief 37) returns the right results but renders them as an unstyled blob — every result concatenated into one run of blue link text, no rows, no padding, and raw type markers ("h2h") leaking into the visible label. The home-page search dropdown presumably renders fine; the header instance lost its presentation. Fix the styling so the header dropdown is a clean list, and stop the type/date junk from showing as raw text.

**PASS =** type "fisichella" in the header search → a dropdown of **separate rows**, each with the result name cleanly shown, no visible "h2h" strings glued to names, a legible type indicator per row. **FAIL =** one continuous blue text blob, or "h2h"/year fragments mashed into the label.

**Push status:** Cody commits (scoped). Tom reviews + pushes.

---

## Step 0 — READ: why the header dropdown lost its styling
Compare the **home-page** search dropdown (the large "Search drivers, teams, circuits…" box, which renders correctly) with the **header** one. Report:
1. Do they share a results-rendering component, or did the header get a separate/inline copy?
2. Is the dropdown's CSS scoped to a **container/parent selector** that only exists on the home page (so the header instance falls back to bare `<a>` tags)? That's the likely cause — a class like `.home-search .result` instead of a shared `.search-result`.
3. How is each result's label built — is the **type tag ("h2h") and year range being concatenated into the label string** itself (which is why "Giancarlo Fisichella1996–2009" and "…Fisichellah2h" appear as run-on text)?

Report before fixing so the fix targets the real cause, not a guess.

---

## Step 1 — Shared, unscoped dropdown styling
- The dropdown results must be styled the same in **both** contexts. Move the results CSS to a **shared class** used by both instances (not a home-page-container-scoped selector), or ensure the header instance carries the same classes the home-page one relies on.
- Each result is its **own row**: block display, padding, a divider or spacing between rows, a hover/active background, cursor pointer. (Match the home-page dropdown's look — reuse, don't reinvent.)
- The dropdown panel: constrained width, max-height with scroll if many results, sits below the input, above other content (z-index), doesn't overflow the viewport on the right (it's near the screen edge in the nav).

## Step 2 — Clean the label: separate name / type / meta
The raw string concatenation must stop. Per result, render as structured pieces, not one glued string:
- **Name** — primary (e.g. "Giancarlo Fisichella", "Alonso vs Fisichella").
- **Type indicator** — the "h2h" / driver / team / etc. shown as a **small tag/badge or muted label**, visually distinct from the name — **not** appended as raw text. A driver result reads as a driver; an H2H result gets a small "H2H" tag. (This also makes the good rabbit-hole behavior legible: searching a driver surfaces their page *and* their H2H pages, now clearly distinguished.)
- **Year range / meta** (e.g. "1996–2009") — if shown, as **secondary muted text**, not concatenated into the name.
- Confirm the underlying `search-index.json` entries have these as separate fields (name, type/group, meta) so the template can render them separately. If the label was pre-concatenated in the index, split it at render time from the structured fields.

## Step 3 — Keyboard + interaction parity
- Arrow-key navigation and Enter-to-select work in the header dropdown (match the home-page behavior).
- Click a result → navigates correctly (driver → driver page, h2h → h2h page).
- Click-outside / Esc closes the dropdown.

## Step 4 — Verify
- **"fisichella"** → clean list: his driver page (tagged as a driver) + his H2H pages (each tagged H2H), every result its own row, **no "h2h" or year text glued to names**.
- A single-word driver search (e.g. "hamilton") → clean rows.
- Home-page search dropdown **unchanged** (didn't regress it by moving shared CSS).
- Mobile ~380px: dropdown fits, rows legible, no horizontal overflow.
- Keyboard nav + click both work.

## Step 5 — Commit (scoped)
Search component + shared dropdown CSS (+ `BaseLayout.astro` if the header markup needs the classes). Named paths, not `-A`. Commit: `Brief 39: fix header search dropdown styling + structured result labels`. Not pushed.

## Definition of done
- [ ] Step 0 cause reported (scoped CSS and/or concatenated label string).
- [ ] Dropdown styled identically in header + home page via shared class; each result its own padded row with hover.
- [ ] Name / type-tag / meta rendered as separate elements — no "h2h"/year fragments in the label text.
- [ ] "fisichella" shows a clean list with driver + H2H results clearly distinguished.
- [ ] Home-page search not regressed; keyboard nav + click work; mobile-safe.
- [ ] Scoped commit; not pushed.
