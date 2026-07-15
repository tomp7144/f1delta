# Brief 19 — Compare tool: discoverability (entry points + sitemap + search)

**Purpose:** Make Compare reachable — a "Compare with…" control on driver pages, a nav link, a sitemap for the winner-vs-winner pairs (the SEO surface), and one tool entry in search. **Depends on Brief 18 (compare engine live).**

**Push status:** Cody commits (scoped, per-concern commits). Deploys driver-page + nav + sitemap + search changes → **Tom reviews + pushes.** (W1)

**Decision locked (client index):** the **6,670 winner-pair URLs go in the sitemap only**, not the client `search-index.json`. The client index gets **one** `/compare` tool entry. Rationale: the picker + the driver-page control are the on-site paths; adding 6,670 entries would push the client index past ~12k and slow per-keystroke scoring on mobile. Google gets the full 6,670 via the sitemap.

---

## Step 0 — READ AND REPORT

**0a. Nav.** Where top-level nav links live and how to add `/compare` consistently.

**0b. Search structure (post-Brief 16).** Quote the current `GROUPS` array and the entry shape in `derive-search.mjs`. Confirm how to append a single `"tool"` entry ranked **last** in `GROUPS`.

**0c. Custom-sitemap registration (load-bearing).** Read `sitemap-drivers.xml.ts` for its format (lastmod / changefreq / priority) **and — critically — report HOW it's discovered by crawlers:** a `Sitemap:` line in `robots.txt`? a manual sitemap index? Search Console only? `@astrojs/sitemap` does **not** auto-include custom sitemap endpoints, so `sitemap-compare.xml` must be registered the **same way** `sitemap-drivers.xml` is — report the exact mechanism so it isn't left undiscoverable.

**0d. Picker reuse.** Confirm the Brief 18 picker works as a **single-input** "pick driver B" control (with driver A prefilled). Report its location/shape.

**0e. Winners list.** Confirm iterating the driver index filtering `totals.wins >= 1` yields the winner cohort. **Report the actual count from the data** — Q5 said 116 → 6,670 pairs; verify, don't assume.

---

## Step 1 — Driver-page "Compare with…" control (Commit 1)

On `/drivers/[id]`:
- A prominent control — e.g. **"Compare [Driver] with any driver…"** — reusing the Brief 18 picker as a single input, driver A prefilled.
- On selecting driver B → navigate to `/compare/[canonicalSlug]` (sort `[id, B]` client-side to skip the 301 hop).
- **Label/placement must make the H2H-vs-Compare line clear:** the existing teammate section is *teammates only*; this control is *compare with anyone*. Contrast the wording so the two features read as distinct (the deliberate line from Brief 17).
- E1: visible, red/tappable. Same-driver guard.

---

## Step 2 — Nav link (Commit 2, or fold into Commit 1)

Add `/compare` to the site nav (0a), visible, consistent with existing entries. Label: "Compare".

---

## Step 3 — `sitemap-compare.xml.ts` (Commit 3)

- New endpoint mirroring `sitemap-drivers.xml.ts`'s format (0c).
- Enumerate winners (`totals.wins >= 1` → the count from 0e), emit **all C(n,2) canonical pair URLs** (`/compare/[sorted-slug]`), each once (`i < j` loop). Expected 6,670 at n=116.
- **Register it the same way `sitemap-drivers.xml` is discovered** (0c) — `robots.txt` line / sitemap index. Do not ship it undiscoverable.
- Mirror lastmod / changefreq / priority conventions.

---

## Step 4 — `/compare` tool entry in search (Commit 4)

- `derive-search.mjs`: add **one** entry — group `"tool"`, name "Compare drivers" (or "Driver Comparison"), url `/compare`, `terms: ["compare", "comparison", "compare drivers", "versus", "vs"]`.
- Rank the `"tool"` group **last** in `GROUPS` (after `h2h`) — same guardrail as Brief 16, so single-name/entity queries still lead with the entity.
- Re-derive `public/search-index.json`. **Confirm it gained exactly ONE entry, not 6,670** — the pairs are sitemap-only by decision.

---

## Step 5 — Verify (per concern)

1. **Driver page:** control present, prefills A, routes to the canonical compare URL; H2H and Compare labels read as distinct; same-driver blocked.
2. **Nav:** `/compare` link visible and works.
3. **Sitemap:** `/sitemap-compare.xml` lists the expected pair count (spot-check a canonical slug resolves to a real compare page); confirm it's registered/discoverable via the 0c mechanism.
4. **Search:** "compare" surfaces the tool; client index grew by exactly one entry; a single-name query ("hamilton") still leads with the driver page.

---

## Step 6 — Commit (scoped) + push status

Per-concern commits; `git add` **named paths, quoted for zsh brackets:**
- `"src/pages/drivers/[id].astro"` + any picker reuse — Commit 1
- the nav file — Commit 2
- `"src/pages/sitemap-compare.xml.ts"` (+ `robots.txt` / sitemap index if that's the registration point) — Commit 3
- `derive-search.mjs` + `public/search-index.json` — Commit 4

Never `git add -A`. **Not pushed** — Tom reviews + pushes.

---

## Step 7 — Cluster close + Brief 20 handoff

Once 19 is pushed, the **Compare cluster is discoverable end to end:** engine (18) + entry points / sitemap / search (19). With H2H (13–16) already done, both comparison pillars are live and cross-linked.

**Brief 20 (optional, later) — derive additions.** Three fields need `derive-f1.mjs` + a re-bake of all 792 driver JSONs (Brief 13's risk class — its own brief, verified on its own):
- `dnfCount` → **DNF %** row (`higherIsBetter: false`)
- `pointsFinishes` → **points-finish %** row (`higherIsBetter: true`) *(Cody found `totals` lacks this — that's why it was deferred from V1)*
- `bestFinish` → career fact (lower position number = better)

Then wire the three rows into the compare grid (and DNF% into H2H if wanted). Until Brief 20, the compare grid's era-fair layer is **win% / podium% / pole% + championships**, which is complete and honest on its own.

---

## Definition of done

- [ ] Read-and-report (0a–0e) returned; winner count verified from data; custom-sitemap registration mechanism identified.
- [ ] "Compare with…" control on driver pages (prefills A, canonical route, H2H/Compare distinction clear).
- [ ] Nav link live.
- [ ] `sitemap-compare.xml` emits the winner-pair URLs **and is registered the same way `sitemap-drivers.xml` is** (discoverable, not orphaned).
- [ ] One `/compare` tool entry in search, ranked last; client index +1 only (pairs sitemap-only); single-name queries unaffected.
- [ ] Scoped, quoted, per-concern commits; not pushed.
