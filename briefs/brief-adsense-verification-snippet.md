# Brief: Add AdSense verification snippet to BaseLayout `<head>`

**Status:** Ready for Cody
**Type:** Build — small, single-file. Verification snippet only (no ad units).

## Task

Add the AdSense site-verification script to BaseLayout's `<head>`, alongside the existing GA4 gtag block, so it lands on all 21 Astro pages for AdSense's site review. Publisher ID is `ca-pub-6298973348658731`.

Paste exactly this, preserving `async` and `crossorigin="anonymous"`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6298973348658731"
     crossorigin="anonymous"></script>
```

## Rules

- Place it in `<head>`. Position relative to the GA4 block doesn't matter — after it is fine.
- **Do NOT add any ad units** (`<ins class="adsbygoogle">`, no `(adsbygoogle = window.adsbygoogle || []).push({})`). This is site verification only — ads serve after approval, via a later brief.
- **Do NOT touch the driver SPA** (`public/driver.html` / `f1-driver.jsx`). Its `<head>` gets the tag at the SPA fold; BaseLayout covering the Astro pages is enough for verification.
- **Do NOT modify** the existing GA4 / Consent Mode block. Leave it exactly as is.

## Verify

- View the built HTML for the homepage (`/`): the `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6298973348658731` script is present in `<head>`, with `async` and `crossorigin="anonymous"` intact.
- GA4 block unchanged.

## Commit

Scoped to `BaseLayout.astro` only. No `git add -A`. Quote bracketed paths. **This brief ends in a push.**
