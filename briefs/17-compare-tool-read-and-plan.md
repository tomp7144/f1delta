# Brief 17 — Driver Compare tool: READ & PLAN

**Purpose:** Resolve the architecture for an any-two-drivers comparison tool (Apple-style spec grid: pick two, see stats side by side, differences highlighted). **This is a read/plan brief — write no feature code.** Per **U1**, the URL structure is locked here, before any build brief generates pages at scale.

**Distinct from H2H (keep this line clean):** H2H = **teammates only**, same car, same season — the genuinely fair comparison, 3,223 static pages. Compare = **any two drivers, any era**, rate-normalized. Complementary, not overlapping. UI language should reflect it ("Teammate Head-to-Head" vs "Driver Comparison") so users aren't confused.

**Push status:** No code, no commit. Output is a written report + a recommendation on each open question.

---

## THE CRUX — answer this first

### Q1. Is on-demand SSR available for a new route?

792 drivers → ~313,000 possible pairs. **Cannot be statically generated.** So `/compare/[a]-vs-[b]` must either render on demand or not exist as a URL at all.

Report:
- Which Astro adapter is configured (`astro.config.mjs`), and whether output is `static` / `hybrid` / `server`.
- Whether a route can opt into on-demand rendering (`export const prerender = false`) **and actually deploy as a Netlify function.** Confirm from config + adapter, not assumption (**D1**).
- Whether any existing route already does this (if one does, that's the pattern to copy).

**Why it decides everything:** a client-only picker at `/compare` produces **one** page of SEO/ad surface. The engine of this site is pages × interconnection. SSR gives every pair a real HTML URL that Cloudflare caches and ads serve on, with a bounded high-value subset in the sitemap.

**If SSR is available → recommended architecture:**
- `/compare` — static picker (empty state).
- `/compare/[a]-vs-[b]` — **SSR, on-demand**, real HTML, any valid pair. Cached at Cloudflare.
- Sitemap + search index get a **bounded notable subset** (see Q5), not all 313k.

**If SSR is NOT available:** stop and report. Do not fall back to an SPA rewrite (`/compare/* → 200`) — that reintroduces exactly what the SPA fold deleted, and returns no crawlable content.

---

## READ & REPORT

### Q2. Stat inventory — what's actually in the data?
From a driver JSON (`data/drivers/*.json`), report the **exact fields** available in `totals` and anywhere else usable. Confirm presence/absence of each:

- seasons/career span, races (starts), teams driven for
- **championships** (WDC count) — confirm this exists; it's the single most era-fair headline stat
- wins, podiums, poles, fastest laps
- career points
- best finish / best grid

For anything **not** in the driver JSON, say where it lives (records boards, F1DB source) or that it must be derived. **Do not assume a field exists** (D1).

### Q3. Rates — reuse or recompute?
Five rate boards already exist in `data/records/drivers/`: `win-rate.json`, `podium-rate.json`, `pole-rate.json`, `dnf-rate.json`, `points-finish-rate.json` (rows carry `value` = % and `context` = raw fraction).

Report which is cleaner: **(a)** read those boards, or **(b)** compute inline from driver `totals` (as the H2H pages do). Recommend one. Consistency with the H2H career-rate math matters — the same driver's win% must not differ between two pages on this site.

### Q4. Data payload — the compare index
The picker needs stats for any of 792 drivers without loading 792 JSON files.

Recommend: a baked **`compare-index.json`** — one compact row per driver with only the compare fields (mirrors the `search-index.json` pattern, lazy-loaded). Report:
- Estimated size (792 rows × ~15 numeric fields).
- Whether it should be a new `derive-compare.mjs` or folded into `derive-f1.mjs`.
- Whether SSR (Q1) makes it unnecessary for the *result page* (server reads driver JSONs directly) but still needed for the *picker* (client-side name list). **Likely both: a tiny name list for the picker + server-side reads for the page.** Confirm.

### Q5. Sitemap / search subset (bounded — do not index 313k)
**S1** requires the new page type to be searchable, but indexing 313k pairs would bury every existing result and is nonsense.

Report the count of drivers with:
- ≥1 championship
- ≥1 win

**Lean:** sitemap + search-index the pairs among **drivers with ≥1 win** (all-substantive, real search demand — "hamilton vs senna", "verstappen vs schumacher"). Champions-only is the conservative alternative. Report both counts and the resulting pair counts (n×(n−1)/2) so the line is set on real numbers, not a guess. Every other pair still **works** via SSR — it's just not pre-advertised.

Also: index the `/compare` tool itself as a single entry. Rank compare entries **last** in GROUPS (same guardrail as `h2h` in Brief 16) so single-name queries still lead with the driver page.

### Q6. Driver picker — can the search autocomplete be reused?
Brief 16 touched `scoreEntry` / `GROUPS` in `src/pages/index.astro`. Report whether that autocomplete is **page-local** or extractable into a shared component. Two searchable driver pickers over 792 names is exactly what it already does — reuse beats rebuild. If it's page-local, report the extraction cost.

### Q7. Sitemap coverage (pre-existing gap — check while you're here)
Confirm whether a sitemap is generated automatically (Astro sitemap integration → covers `getStaticPaths`) or hand-rolled. **Report whether the 1,158 race pages and 3,223 H2H pages are currently in it.** If they aren't, that's an existing SEO gap worth its own brief — and it means "add to sitemap" belongs alongside **S1** as a standing rule for bulk page types.

---

## DESIGN CONSTRAINTS (decided — validate, don't relitigate)

**C1 — Two drivers only.** Label column + 2 driver columns = 3 columns = **fits mobile with no horizontal scroll.** Three drivers = 4 columns = horizontal scroll wrapper = the known-unsolved sticky-header incompatibility. Two columns dodges it, and the header row can be **vertically** sticky (vertical sticky is fine — only sticky + `overflow-x: auto` broke). Expanding to 3 later re-opens that problem; note it, don't build for it.

**C2 — No f1δ Score.** A compare grid begs for one composite number, and this one is not yet understood. It stays off until it's explained. (Parked item — do not resolve it here.)

**C3 — Points are NOT era-comparable.** Scoring changed radically (8 → 10 → 25 for a win). Career points may appear as a **labeled career fact**, never as the comparison metric and never as points-per-race across eras. The **era-fair** row group is **rates + championships**. (D1 — misleading presentation is a data-integrity failure, not a cosmetic one.)

**C4 — Diff highlighting is directional.** Each row needs a `higherIsBetter` flag. Higher win% = better; **higher DNF% = worse.** A naive "bold the bigger number" highlights the wrong driver on the DNF row. Report the proposed row schema including this flag.

**C5 — Rates are career-wide.** Same as the H2H pages: label them **"career rate"**, not stint- or era-scoped.

---

## PROPOSED PAGE SHAPE (for the report to confirm/refine)

**Row groups, top to bottom:**
1. **Career** — span, seasons, races (starts), teams, **championships**
2. **Wins & podiums** — wins, podiums, poles, fastest laps *(raw counts — era-dependent, label as such)*
3. **Era-fair rates** — win %, podium %, pole %, points-finish %, DNF % *(the honest comparison layer)*
4. **Points** — career points, with the C3 caveat inline

**Ad slot (E2):** one, **after the table, before the context/links footer.** Natural break, never mid-table.

**Links out (E1) — red, obviously tappable:**
- Both driver names → `/drivers/[id]`
- Teams → `/teams/[constructorId]`
- **Teammate cross-link (the pillar-reinforcer):** if the two drivers were **ever teammates** and the pairing is `race-comparable` in `h2h-census.json` → a prominent *"They shared a car — see the teammate head-to-head"* link to `/h2h/[slug]`. Report how cheaply this can be checked at render time (census lookup by canonical slug).

**Entry points (E1 — discoverability, or the tool is invisible):**
- A **"Compare with…"** control on every `/drivers/[id]` page (prefills that driver as column A).
- `/compare` linked from nav.
- Report where each fits.

---

## OUTPUT OF THIS BRIEF

A written report answering Q1–Q7, plus:
- A **locked URL structure** recommendation (U1).
- A **build sequence** — my expectation is ~2 briefs (18: derive/index + SSR route + page; 19: picker + entry points + search/sitemap), but propose what the read actually supports (W3 — clusters of sequenced briefs, not one mega-brief).
- Any place where the constraints above (C1–C5) don't survive contact with the real code — **say so.** Pushback is weighted heavily; you have the repo in front of you.

**No commit. No code. Report only.**
