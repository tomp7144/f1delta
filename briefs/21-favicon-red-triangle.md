# Brief 21 — Favicon: replace the default Astro logo with the F1 Delta red triangle

**Purpose:** Swap the browser-tab icon from Astro's default to the F1 Delta red delta, across all formats. **Assets are provided** (favicon.svg, favicon.ico, apple-touch-icon.png, favicon-32x32.png) — this brief just places them and wires the `<head>`.

**Push status:** Cody commits (scoped). Deploys a small asset + head change → **Tom reviews + pushes.** (W1)

**Numbering note:** this takes Brief 21. The optional derive additions (dnfCount / points-finish / bestFinish) move to **Brief 22**, still optional.

---

## The one-file instant win

Astro's head already links `/favicon.svg`. Dropping the provided **`favicon.svg`** into `public/` (replacing the existing Astro one) swaps the tab icon in all modern browsers **with no code change.** If you only do one thing, do that. The rest below is the render-everywhere completeness pass.

---

## Step 0 — READ

Find where the favicon `<link>` tags live — likely `BaseLayout.astro`'s `<head>` (the same layout the nav lives in). Quote the current favicon link(s) and confirm the existing `public/favicon.svg` is Astro's default (the one in the tab now).

---

## Step 1 — Place assets in `public/`

Replace/add, at the repo's `public/` root (or wherever the current `favicon.svg` sits — match it):
- `favicon.svg` (replaces Astro's)
- `favicon.ico` (multi-res 16/32/48 — legacy + Windows/crawler fallback)
- `apple-touch-icon.png` (180×180 — iOS home screen)
- `favicon-32x32.png` (optional explicit PNG)

## Step 2 — Wire the `<head>` (BaseLayout)

Ensure the head has (adapt to existing markup — replace the lone Astro `favicon.svg` line):
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

## Step 3 — Color match (confirm)

The triangle fill is **`#E10600`** (F1 red). Confirm this matches the nav mark / `tokens.css` `--red` (whatever the site's accent red actually is) so the tab icon and the "F1 ▲ DELTA" nav triangle are the *same* red. If the token differs, change the single `fill` in `favicon.svg` to match — and ping me and I'll regenerate the `.ico` / PNG in the corrected red (they're raster, so they don't inherit the SVG edit).

---

## Step 4 — Verify

1. Build; load the site — the tab shows the red triangle, not the Astro logo.
2. **Favicons cache hard.** If you still see the old icon, that's the browser cache (hard-refresh / new tab) or Cloudflare's cached copy (your purge-on-deploy busts the CDN one on push). Not a bug — just the two cache layers.
3. Triangle red matches the nav triangle.

## Step 5 — Commit (scoped)

`git add` the placed asset paths + the layout file (named paths, not `-A`):
- `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/favicon-32x32.png`
- the `BaseLayout` file (head links)

Single commit:
```
Brief 21: F1 Delta favicon (red triangle) replacing Astro default
```
Not pushed — Tom reviews + pushes.

---

## Definition of done

- [ ] `favicon.svg` swapped in `public/` (the instant win); `.ico` + apple-touch + png placed.
- [ ] Head links all three; Astro default no longer referenced.
- [ ] Tab shows the red triangle; color matches the nav mark (or SVG fill corrected to the token).
- [ ] Scoped commit; not pushed.
