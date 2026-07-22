# Brief 31 — The Methodology page (`/methodology`)

**Purpose:** Build the canonical transparency reference — how every derived number on F1 Delta is calculated, what data it comes from, and what it does and does not claim. This is the **M1 aggregation point**, resolves the `/methodology` link stubbed since Brief 25, and is the **E-E-A-T centerpiece for the AdSense re-review**: original analytical writing that exists nowhere else.

**Structural rule (avoids M1 copy duplication):** the existing inline components (`F1DeltaExplain.astro`, `ReliabilityExplain.astro`) are the **short form**. This page **embeds those same components** and builds the **long form** around them — deeper context, worked examples, edge cases, limitations. Do not restate component copy in page markup.

**Push status:** Cody commits (scoped). Tom reviews + pushes.

---

## Step 0 — READ AND REPORT

1. **Components available to embed:** `F1DeltaExplain.astro` (with its `compareNote` / `seasonNote` flags) and `ReliabilityExplain.astro`. Report their props and whether they render standalone outside a `<details>` wrapper (the methodology page wants them **expanded by default**, not collapsed).
2. **Data provenance facts — pull the real values, do not assume (D1):**
   - F1DB version/release currently vendored, and the CC BY 4.0 attribution string in use.
   - The bake/refresh cadence from `.github/workflows/bake-latest.yml` (what actually runs, how often, post–Brief 22B).
   - Whether `derive-f1.mjs` / `derive-f1delta.mjs` / `derive-f1delta-lenses.mjs` are the complete set of derive scripts, so the page's "what we compute" list is accurate.
3. **Existing `/methodology` links:** report every page currently linking to `/methodology` (Brief 25 driver pages, leaderboards, possibly Compare) so they all resolve after this ships.
4. **H2H rules:** confirm the census classification (`race-comparable` / `quali-only` / `empty`) and the `excl_*` subcount definitions from Brief 13, so the H2H section describes what the code actually does.

---

## Step 1 — Page structure

Single page at `/methodology`. Long-form is correct here — substance is the point. Sections:

1. Why this page exists
2. Where the data comes from
3. The f1δ Score
4. The three f1δ lenses
5. Era-fair rates
6. Reliability & consistency (and why they're *not* era-fair)
7. Comparing careers: the three chart alignments
8. Teammate head-to-head
9. What these numbers don't claim
10. Corrections

Byline **Tom Payment**, linking to `/about` (E-E-A-T: named author + methodology + provenance together).

---

## Step 2 — New copy (draft — edit for accuracy against Step 0 findings)

**§1 — Why this page exists**
> Every number on this site that isn't a plain historical fact is calculated, and every calculation involves choices. This page documents those choices: the formulas, the edge cases, the things deliberately excluded, and the questions each metric can and cannot answer. If a number here can't be explained, it shouldn't be on the site.

**§2 — Where the data comes from**
> Historical results come from **F1DB**, an open Formula 1 database released under **CC BY 4.0** *(Cody: exact version + attribution string from Step 0.2)*. Nothing on this site is hand-entered from memory or estimated.
>
> Everything beyond the raw results — the f1δ Score, the rates, head-to-head records — is **derived** from that data by scripts in this repository, re-run on a schedule *(Cody: state the actual cadence from Step 0.2)*. Historical seasons don't change, so those figures are stable; current-season figures update as the season runs.

**§3 — The f1δ Score** *(embed `F1DeltaExplain`, then add:)*
> **The problem it solves.** A win was worth 8 points in 1950, 10 through the 1990s, and 25 today — and seasons have grown from 7 races to 24 plus sprints. Total points available in a season have gone from roughly 150 to over 600. Career points totals therefore say more about *when* a driver raced than *how well*.
>
> f1δ scores each season as a share of what was actually winnable **that year**, then adds those seasons up. A dominant 15-race season and a dominant 24-race season both land near 100, because each is measured against its own ceiling.
>
> **Worked examples.** Verstappen's 2023: 575 points from a possible 620 → **92.7**. Schumacher's 2004 → **82.2**. Farina's 1950 → **55.6**. *(Cody: verify all three against live data before publishing.)*
>
> **Edge cases, stated plainly:**
> - **The Indianapolis 500 (1950–1960) is excluded.** It awarded World Championship points but ran to American AAA regulations and was contested almost entirely by drivers who never raced elsewhere in F1. Including it would credit a different series.
> - **A DNF is a zero.** No distinction is made between mechanical failure and driver error — that judgment would be subjective across 75 years of racing. A race that scored nothing contributes nothing.
> - **Every race counts.** Several early seasons only counted a driver's best few results toward the championship. f1δ counts them all, so a driver's f1δ can reflect races the official standings discarded.

**§6 — Reliability & consistency** *(embed `ReliabilityExplain`, then add:)*
> These two rates are shown apart from the era-fair rates because, unlike a win or a podium, their meaning has changed over time.
>
> The gradient in the data is stark: across their careers, Fangio failed to finish **24.1%** of his starts, Verstappen **12.8%**, Hamilton **7.7%** *(Cody: verify against live data)*. That's mostly machinery, not driver. Comparing two drivers who raced the same season is meaningful; comparing across seventy years is not — which is why these rows only mark a winner in season-vs-season mode.

**§7 — Comparing careers: the three alignments** *(embed the `compareNote`, then add:)*
> Lining two careers up by season number seems neutral, but it isn't. Fangio's first F1 season came at **39**; Hamilton's at **22** *(Cody: verify)*. Aligned by season number, a rookie year at 39 sits directly against a rookie year at 22 as though they were the same thing. Age alignment fixes that. Calendar alignment is the right view for drivers who actually shared a grid.

**§9 — What these numbers don't claim** *(the credibility section — do not soften)*
> **f1δ measures how much of the available success a driver actually took, in their own era. It does not claim to say who would win in equal machinery, or who was more talented.**
>
> A dominant season reflects a driver *and* a car — Formula 1 has never been a single-variable sport, and a great driver in a midfield car will always score lower than an equal driver in the best car of the year. No points-based metric can separate those, and this one doesn't pretend to.
>
> What it does remove are the distortions that make raw points meaningless across eras: different scoring systems, different calendar lengths, different numbers of points-paying positions. What's left is an honest measure of how completely a driver beat the field in front of them.

**§10 — Corrections**
> If a number here looks wrong, it may be. Reporting it is welcome — see the contact details on the About page.

---

## Step 3 — Sections that reuse, not restate
- **§4 (lenses)** and **§5 (era-fair rates)** — embed the existing component copy. If the era-fair rates (win%/podium%/pole%) still have **no** explanation component (the open M1 backlog), **write one now** as a shared component used on the driver page, Compare, *and* here — not page-only copy.
- **§8 (H2H)** — describe from Step 0.4: what makes a pairing race-comparable, what the DNF/DNS toggles include, why quali-only pairings have no page.

---

## Step 4 — Wiring
- Every existing `/methodology` link (Step 0.3) resolves.
- Links out (E1, red/tappable): the three f1δ leaderboards, `/compare`, `/about`.
- **Search (S1):** index the page with terms covering `methodology`, `how it works`, `f1delta score`, `formula`, `calculation`, `explained`.
- Sitemap: static — auto-covered.
- Nav/footer: add a visible link (footer alongside About/Contact is fine).

## Step 5 — Verify
- Page renders long-form, components **expanded by default** (not collapsed) — this is a reference, not a UI affordance.
- **All figures verified live** before publish: 92.7 / 82.2 / 55.6, the DNF gradient, Fangio 39 / Hamilton 22. **If any figure differs from this brief, the live data wins** — correct the copy, don't ship the brief's number (D1).
- No duplicated explanation copy between components and page.
- All internal links resolve; mobile-clean.

## Step 6 — Commit (scoped)
`git add src/pages/methodology.astro` + any new shared explanation component + nav/footer + `derive-search.mjs` / `search-index.json`. Named paths, not `-A`.
Commit: `Brief 31: methodology page (canonical M1 reference)`. Not pushed.

## Definition of done
- [ ] `/methodology` live, long-form, all ten sections, Tom Payment byline linking to `/about`.
- [ ] Components embedded and expanded — no copy duplication (M1).
- [ ] Era-fair rates explanation component written if it didn't exist (M1 backlog closed).
- [ ] Provenance section states the **real** F1DB version, attribution, and bake cadence.
- [ ] All worked figures verified against live data.
- [ ] Every prior `/methodology` link resolves; indexed in search; linked from footer.
- [ ] Scoped commit; not pushed.

---

**After this ships:** the AdSense re-review path is — About (done) + methodology (this) + a batch of genuine `/stories` pieces in Tom's voice. The first story (2016) is an interview-and-edit, not a generated draft.
