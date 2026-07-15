# Brief 18 — Compare tool engine: adapter + picker + SSR grid

**Purpose:** Stand up the Compare feature's engine — enable on-demand rendering, build the `/compare` picker, and the `/compare/[slug]` SSR comparison grid for any two drivers. **V1 uses only fields already in `totals` — no derive change.** DNF% and bestFinish are deferred to a later brief.

**Locked URL (U1):** `/compare/[a-id]-vs-[b-id]`, IDs alphabetical (`[idA, idB].sort().join("-vs-")`), same convention as H2H. Reversed order → 301 to canonical.

**Push status:** Cody commits (scoped). Deploys an infra change (adapter) + new pages → **Tom reviews + pushes**, then verifies the existing site is unchanged *and* the compare route works live. (W1, W2)

---

## Step 0 — READ AND REPORT

**0a. Astro version (decides the adapter config).** Read the `astro` version in `package.json`. Report the major version. **This is load-bearing:**
- `output: 'hybrid'` was **removed in Astro 5** and **throws a config error in 5 and 6.** Do not use it.
- **Astro 5 or 6 (expected):** no `output` key (static is the default and supports on-demand when an adapter is present). Add `adapter: netlify()`. Per-route `export const prerender = false` on the compare route only.
- **Match the adapter version to Astro:** `@astrojs/netlify@6` for Astro 5, `@7` for Astro 6. Report which. **Do not blind-install** `@astrojs/netlify` — the default (v7) peer-deps against Astro 6 and will mismatch on 5. Prefer `npx @astrojs/upgrade` or pin the correct adapter major.
- **If Astro 6:** confirm Netlify's Node is ≥ 22.12.0 (Astro 6 dropped Node 18/20) — set `NODE_VERSION` in `netlify.toml` or `.nvmrc` if not already. Report current state.

**0b. Totals fields (confirm the grid's data).** From a driver JSON, re-confirm presence of: `championships`, `wins`, `podiums`, `poles`, `fastestLaps`, `points`, `races`; and top-level `firstSeason` / `lastSeason` and `career[]` (for teams via `primaryTeamId`). Report anything missing. (Per Q2 these are present — confirm, don't assume.)

**0c. H2H cross-link source.** Confirm `data/records/h2h-census.json` is importable server-side, and that the compare canonical slug (`[a]-vs-[b]`) is the **same string** as the H2H slug suffix — so a compare page can look up `censusSlugs.has(canonicalSlug)` directly and, if present, link to `/h2h/[canonicalSlug]`. Confirm the two slug rules are identical.

**0d. Picker name source.** Confirm `public/search-index.json` filtered to `type === 'driver'` yields the 792 drivers with `id` + display name — the picker's autocomplete list. No new baked file for V1 (Q4).

**0e. Existing route patterns.** Read one existing page for the shared layout/table/ad-slot conventions (`f1-table.css`, the `#records-ad-slot` pattern) so the compare grid matches the site.

---

## Step 1 — Adapter (Commit 1, isolable)

- Install the **version-matched** `@astrojs/netlify` (per 0a).
- `astro.config.mjs`: add `adapter: netlify()`. **Do not add `output: 'hybrid'`.** Leave output at default (static). Keep `@astrojs/sitemap`.
- Existing routes keep `export const prerender = true` (redundant under static default, but harmless — leave them).
- If Astro 6: set `NODE_VERSION` per 0a.
- **Local build-check before Commit 2:** run the build; confirm `dist/` still emits the existing pages as static HTML (no behavior change) and the standalone `netlify/functions/` (driver, checkout, access) are untouched. The site is still 100% static at this point — the adapter is installed but nothing uses it yet.

Commit 1: `Brief 18: add Netlify adapter (on-demand rendering enabled, no routes using it yet)`.

---

## Step 2 — `/compare` static picker

`src/pages/compare/index.astro` — `prerender = true`.
- Two searchable driver inputs (A and B), autocomplete over the driver list from `search-index.json` (0d). Reuse the site's Babel-standalone pattern; a **name filter** is enough here (no need to port the full `scoreEntry`).
- Empty/default state: prompt to pick two drivers.
- On both selected → navigate to `/compare/[canonicalSlug]` (sort the two IDs, join with `-vs-`).
- Same-driver guard: block A === B.

---

## Step 3 — `/compare/[slug].astro` SSR grid (Commit 2)

`prerender = false` (on-demand — **no `getStaticPaths`**). At request time:

1. **Parse:** `Astro.params.slug` → split on `-vs-` → `[idA, idB]`. (`-vs-` never appears inside an F1DB ID, so the split is unambiguous — same as H2H.)
2. **Canonical redirect:** if `[idA, idB]` isn't already alphabetically sorted → `return Astro.redirect("/compare/" + sortedSlug, 301)`. (Kills duplicate-content.)
3. **Validate:** if either ID isn't a real driver (missing JSON / not in index) → `return new Response(null, { status: 404 })`.
4. **Read** both driver JSONs server-side (`fs.readFileSync`).
5. **Render the grid** (Apple-style spec rows, label column + 2 driver columns — **two only**, fits mobile with no horizontal scroll, C1):
   - **Career:** span (`firstSeason`–`lastSeason`), seasons, races (starts), teams (from `career[].primaryTeamId`), **championships**.
   - **Wins & podiums (raw counts):** wins, podiums, poles, fastest laps — **labeled era-dependent** (scoring/era-variable), not the comparison metric.
   - **Era-fair rates (career rate):** win %, podium %, pole %, points-finish % — computed inline from `totals` (`wins/races`, etc.), **labeled "career rate."** *(DNF% is the deferred 5th row — Brief 20.)*
   - **Points:** career total, with an inline caveat ("scoring-era variable") — never presented as the comparison metric (C3).
6. **Directional diff highlight (C4):** each row carries `higherIsBetter`. Highlight the better value per row — **win% higher = better; DNF% higher = worse** (matters once DNF% lands). Do not "bold the bigger number."
7. **H2H cross-link (pillar-reinforcer, E1):** if `h2hCensus` has this canonical slug (0c) → prominent red *"They shared a car — see the teammate head-to-head →"* to `/h2h/[slug]`. Absent otherwise.
8. **Links out (E1, red/tappable):** both driver names → `/drivers/[id]`; teams → `/teams/[constructorId]`.
9. **Ad slot (E2):** one, **after the table, before the links/footer.** Never mid-table.
10. **Caching (required — makes SSR behave like static):** set a long `Cache-Control` via `Astro.response.headers` (e.g. `public, max-age=…, s-maxage=…`) so Cloudflare + Netlify's durable cache serve cached HTML instead of invoking the function every hit. Data only changes on re-bake, and your existing **purge-on-deploy** busts the cache then. Report the header value chosen.

Commit 2: `Brief 18: /compare picker + SSR comparison grid`.

---

## Step 4 — Verify (local + note for Tom's live check)

Local:
1. Build succeeds; existing pages still emit as static (Step 1 check holds after the SSR route exists — now build output is "server" with the static pages prerendered).
2. `/compare` picker renders; selecting two drivers routes to the canonical URL; A === B blocked.
3. A compare URL renders the full grid (e.g. `/compare/ayrton-senna-vs-lewis-hamilton` — confirm canonical order and that rates/championships/points show with correct labels).
4. **Canonical 301:** the reversed URL redirects to the sorted one.
5. **404:** a bogus ID (`/compare/lewis-hamilton-vs-not-a-driver`) returns 404, not a broken page.
6. **H2H cross-link:** appears for a teammate pair (e.g. `lewis-hamilton-vs-valtteri-bottas` — they shared Mercedes → census hit → link present); **absent** for a non-teammate pair (`ayrton-senna-vs-lewis-hamilton`).
7. Directional highlight correct on rate rows.

For Tom's post-push live check (state in handback):
- Existing site unchanged (spot-check a driver + an H2H page still serve).
- A compare URL renders on prod; **a second hit is a cache HIT** (not a fresh function invocation) — confirms Cloudflare/Netlify caching is live.

---

## Step 5 — Commit (scoped) + push status

Two commits as above. `git add` **named paths, quoted for zsh brackets:**
- `astro.config.mjs`, `package.json`, `package-lock.json` (+ `netlify.toml` if Node set) — Commit 1.
- `"src/pages/compare/index.astro"`, `"src/pages/compare/[slug].astro"`, any picker JS/CSS — Commit 2.

Never `git add -A`. **Not pushed** — Tom reviews + pushes, then runs the live check (this is the first SSR deploy, so W2 verification matters).

---

## Step 6 — Handoffs

- **Brief 19 — discoverability:** "Compare with…" control on `/drivers/[id]` (prefills driver A); nav link to `/compare`; `sitemap-compare.xml.ts` for the **6,670 winner-vs-winner** pairs; a single `/compare` **tool entry** in `search-index.json` (ranked last in GROUPS). **Open call for 19:** whether the 6,670 pairs go in the *client* search-index or sitemap-only (lean: sitemap-only — the picker is the on-site path; keep the client index lean).
- **Brief 20 (later, optional) — derive:** add `dnfCount` (→ DNF% row) and `bestFinish` to `derive-f1.mjs`, re-derive, wire the rows in. Separate because it re-bakes all 792 driver JSONs (Brief 13's risk class).

---

## Definition of done

- [ ] Astro version confirmed; **matched** adapter version installed; config uses the static default + `adapter: netlify()` (NOT `hybrid`); Node set if Astro 6.
- [ ] Commit 1 (adapter) verified to not change existing static output or the standalone functions.
- [ ] `/compare` picker works; canonical routing + same-driver guard.
- [ ] SSR grid renders any valid pair; 301 on reversed; 404 on bad ID; H2H cross-link gated on census; one ad slot after the table.
- [ ] Grid uses only existing `totals` fields; 4 rates labeled "career rate"; points labeled era-variable; directional highlight correct.
- [ ] `Cache-Control` set so responses are CDN-cacheable; purge-on-deploy busts them.
- [ ] Scoped, quoted commits; not pushed. Tom's live check (site unchanged + cache hit) noted in handback.
