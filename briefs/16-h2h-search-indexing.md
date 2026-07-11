# Brief 16 — Search indexing for H2H pairings (S1 + S2)

**Purpose:** Add the 3,223 race-comparable H2H pages to search so natural two-name queries surface them. Closes the **S1** obligation (a new page type must be indexed as part of the cluster) and delivers the **S2** order-independent multi-word match for two-name entities. **Depends on Brief 14 (pages) + Brief 13 (census).**

**Push status:** Cody commits (scoped). Deploys `search-index.json` (+ possibly a matcher change) → Tom reviews + pushes. (W1)

---

## Step 0 — READ AND REPORT

**0a. `derive-search.mjs` entry shape.** How is an entry structured — fields for label/name, type/group, url, and **is there a keyword/terms/matchable field**, or only the label? Quote an existing entry (e.g. a driver entry).

**0b. The matcher (critical).** Find the search-matching logic in the search component. Report precisely: does it match **all query words against a token bag in any order**, or is it **label-order prefix** matching? This decides whether "rosberg hamilton" (reverse order) can ever match "Lewis Hamilton vs Nico Rosberg." (S2 flagged current matching as word-prefix in label order — confirm.)

**0c. Name source.** The census carries IDs (`a`, `b`), not names. Confirm how to resolve `driverId → full display name` (driver JSON `name`, or an index). Report the source.

---

## Step 1 — Add H2H entries (additive)

- **Source:** `h2h-census.json`, `class === "race-comparable"` only (the 3,223). **Do not index excluded pairings** — no page → 404.
- **Per entry:** type/group `"h2h"` (display e.g. "Head-to-Head"), `name = "{A full name} vs {B full name}"`, `url = /h2h/[slug]`.
- **Matchable terms bag:** `[A full name, B full name, A surname, B surname]` as separate tokens, so multi-word queries hit regardless of order (S2). If `derive-search` has no keyword field (0a), add one to the entry schema — **additive, does not change existing entries.**

This step alone satisfies **S1** (H2H is now in the index).

---

## Step 2 — Order-independence + a ranking guardrail (S2)

**Order-independence.**
- If 0b shows the matcher already matches all query words against the token bag in any order → nothing more needed.
- If it's label-order-only → apply the **minimal** upgrade: a query matches an entry if **every query word prefix-matches some term in the entry's token bag, regardless of order.** This is strictly **more permissive** (adds matches, removes none) but it changes **global** search — so Step 3's regression checks are mandatory.

**Guardrail (prevents 16 from regressing existing search).**
- H2H entries must rank **below** primary single-entity results (driver / team / circuit) — via type weighting or an exact-vs-partial match tier — so a single-name query like "hamilton" still **leads with the driver page**, not the six H2H entries that contain "Hamilton." This stops 16's own 3,223 additions from burying existing results.

**Scope line.** Steps 1–2 deliver correctness (indexed + order-independent + not-buried). **Ranking *quality* tuning** (Tom's "ham" / "ver" / "british" test-query misses) is a separate concern and **stays in the open ranking-tuning pass** — H2H is now an added surface to validate there. Do **not** fold general relevance tuning into this brief.

---

## Step 3 — Re-derive + verify

1. Regenerate `public/search-index.json` (run `derive-search.mjs`). Confirm ~3,223 new H2H entries.
2. **S2 order-independence** — all three surface the Ham-Ros page:
   - "hamilton rosberg", "rosberg hamilton", "hamilton vs rosberg"
   - and "bearman leclerc" / "leclerc bearman" → Bearman-Leclerc page.
3. **Regression (guardrail):**
   - "hamilton" still **leads with** the Hamilton driver page (H2H entries appear below, not above).
   - a race query (e.g. "malaysia 2016") still returns the race page.
4. Confirm excluded pairings are **not** in the index (no orphan search results → 404).

---

## Step 4 — Commit (scoped)

`git add` named paths — not `-A`:
- `derive-search.mjs`
- `public/search-index.json`
- the search component file (only if the matcher changed).

Single commit:
```
Brief 16: index H2H pairings + order-independent name matching (S1/S2)
```
Not pushed (Tom reviews + pushes).

---

## Definition of done

- [ ] Read-and-report (0a–0c) returned; matcher behavior known before touching it.
- [ ] H2H entries in `search-index.json`, race-comparable only, ~3,223 added; excluded pairings absent.
- [ ] "rosberg hamilton" / "hamilton rosberg" / "hamilton vs rosberg" all surface the page (S2).
- [ ] "hamilton" still leads with the driver page; a race query still works (no regression).
- [ ] Ranking-quality tuning explicitly left to the open pass, with H2H noted as a new surface.
- [ ] Scoped commit landed; not pushed.

---

**Cluster close:** once 15 + 16 are pushed and verified, the teammate-H2H cluster is done — 3,223 pages built (Brief 14), linked from driver pages (15), and searchable by natural two-name queries (16).
