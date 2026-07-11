# Brief 15 — Driver-page → H2H "Full breakdown" links

**Purpose:** On each `/drivers/[id]` page, add a "→ Full breakdown" link in every teammate row whose pairing has an H2H page (race-comparable). Makes the 3,223 H2H pages reachable from driver pages (E1). **Depends on Brief 14 (H2H pages) + Brief 13 (census).**

**Push status:** Cody commits (scoped). Deploys driver-page changes → Tom reviews + pushes. (W1)

---

## Step 0 — READ AND REPORT

**0a. Row markup.** Confirm the teammate-row markup in `src/pages/drivers/[id].astro` (read in Brief 14 0a) is unchanged. Identify the exact cell/element where the link is appended — end of each row, after the "years + N r compared, N excl" text (per Brief 12).

**0b. Census import.** Confirm `data/records/h2h-census.json` imports at module level in `[id].astro`, and that building a `Set` of race-comparable slugs is straightforward:
```js
const h2hSlugs = new Set(
  census.pairings.filter(p => p.class === "race-comparable").map(p => p.slug)
);
```

---

## Step 1 — Add the gated link per teammate row

For each teammate row on driver **X**'s page (teammate **Y**):

- **Canonical slug:** `[X.id, Y.id].sort().join("-vs-")` — alphabetical sort of the two IDs, `-vs-` join. (Identical to the census slug rule, so it matches an existing page exactly.)
- **Gate:** render the link **only if** that slug is in `h2hSlugs`. Quali-only/excluded pairings have no page → **no link** (avoids a 404).
- **Link:** `→ Full breakdown` → `/h2h/[canonicalSlug]`. **Red accent, visibly tappable** (E1).

Because both X's page (Y row) and Y's page (X row) produce the same canonical slug, both link to the same H2H page.

---

## Step 2 — Verify

1. **Hamilton's page:** Rosberg row shows `→ Full breakdown` → `/h2h/lewis-hamilton-vs-nico-rosberg`. (Bottas, Russell, Button, Kovalainen, Alonso rows are all race-comparable — all linked.)
2. **Bearman's page:** Leclerc row → `/h2h/charles-leclerc-vs-oliver-bearman`.
3. **No-link path:** pick a driver with a teammate pairing in the census **excluded** set (quali-only/contested — from the 1,969), confirm that row renders with **no link** (no 404).
4. No build errors.

---

## Step 3 — Commit (scoped)

`git add "src/pages/drivers/[id].astro"` — **quote it** (zsh glob).

Single commit:
```
Brief 15: driver-page H2H full-breakdown links
```
Not pushed (Tom reviews + pushes).

---

## Definition of done

- [ ] Row markup confirmed unchanged; census `Set` built at module level.
- [ ] Link gated on census membership — shows for race-comparable rows, absent for excluded rows (no 404).
- [ ] Ham→Rosberg and Bearman→Leclerc link correctly; a known excluded row shows no link.
- [ ] Red/tappable (E1); no build errors.
- [ ] Scoped, quoted commit landed; not pushed.
