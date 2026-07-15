# Brief 20 — Home-page Compare hero

**Purpose:** Put the Compare tool front and center on the home page — a hero section headlined **"COMPARE ANY TWO DRIVERS OF ANY ERA"** with the two-driver picker embedded and marquee example chips, so the home page's first impression is "compare anyone, instantly." **Reuses the Brief 18 picker — no rebuild.**

**Push status:** Cody commits (scoped). Deploys a home-page change → **Tom reviews + pushes.** (W1)

**Numbering note:** this takes the Brief 20 slot (immediate priority). The optional derive additions (dnfCount / pointsFinishes / bestFinish) move to **Brief 21**.

---

## Step 0 — READ AND REPORT

**0a. Home page structure.** Read `src/pages/index.astro`. Report what's currently at the top, where the universal search box sits, and the overall section order — so the hero lands **above** existing content without displacing search. Note any orphaned home modules still imported (do **not** clean them up here — out of scope, separate commit).

**0b. Picker reuse.** Confirm the Brief 18 two-input picker (`/compare`) can be reused/embedded on the home page as-is (both A and B inputs). Report its location/shape and whether it's an includable partial or an inline block to be lifted. Reuse it — do not write a second matcher.

**0c. Design tokens.** Confirm the hero can be styled with the existing design system (`tokens.css`, established type/spacing/red-accent) so it reads as part of the site, not a bolt-on.

---

## Step 1 — The hero section (top of the home page)

Place a hero section at the top of `index.astro`, above existing content:

- **Headline:** "COMPARE ANY TWO DRIVERS OF ANY ERA" — bold, prominent (the marquee statement). Style the emphasis with existing tokens.
- **Subhead (one line):** sell the hook — era-adjusted rates side by side, not just raw totals. Something like "Career stats and era-fair rates, any two drivers, any era — side by side." (Refine copy as needed; the era-fair angle is the point.)
- **Picker:** the reused two-input driver picker (0b), inputs for A and B, autocomplete over the driver list. On both selected → navigate to `/compare/[canonicalSlug]` (sort the two IDs, join `-vs-`). Same-driver guard.
- **Example chips:** a row of 3–4 marquee pairings as tappable links, each pointing to its **canonical** `/compare` URL (build the slug from the real F1DB IDs — sorted). Suggested set: **Senna vs Hamilton**, **Schumacher vs Verstappen**, **Prost vs Senna**, **Verstappen vs Hamilton**. (Prost vs Senna also surfaces the H2H cross-link on its page — a nice demo of the pillar link.) Final set is Tom's call; seed with strong ones.
- **CTA affordance (E1):** picker action + chips are obviously tappable, red accent for the primary action.

Keep the universal search box on the page, below the hero (or wherever it currently sits, so long as the hero is clearly first).

---

## Step 2 — Responsive / mobile (C1 carries over)

- On mobile, the two picker inputs **stack vertically** (A, then B, then the compare action) — no cramped side-by-side.
- Example chips wrap cleanly.
- Confirm the two autocomplete dropdowns don't overlap or clip, especially on a narrow viewport.

---

## Step 3 — Verify

1. Home page renders with the hero **front and center** at the top; headline prominent; search still present below.
2. Picker: selecting two drivers routes to the canonical `/compare/[slug]`; same-driver blocked.
3. Every example chip resolves to a real compare page (canonical slug).
4. Universal search still works (no regression to the existing box).
5. Mobile: inputs stack, chips wrap, dropdowns render cleanly.

---

## Step 4 — Commit (scoped) + push status

`git add` **named paths only** (not `-A`):
- `"src/pages/index.astro"` and any hero-specific CSS (prefer extending `tokens.css` / existing styles).

Single commit:
```
Brief 20: home-page Compare hero
```
**Not pushed** — Tom reviews + pushes.

---

## Out of scope (explicit)

- **Dead-file cleanup** (orphaned home modules) — not this brief; its own single-purpose commit when convenient.
- **Derive additions** (DNF% / points-finish% / bestFinish) — now **Brief 21**, still optional.

---

## Definition of done

- [ ] Home structure read; hero placed above existing content; search retained.
- [ ] Hero: headline + subhead + reused two-input picker + marquee example chips, styled with existing tokens.
- [ ] Picker routes to canonical `/compare/[slug]`; chips resolve to real pages; same-driver guarded.
- [ ] Mobile: inputs stack, chips wrap, dropdowns clean.
- [ ] No search regression; no dead-file cleanup bundled.
- [ ] Scoped, quoted commit; not pushed.
