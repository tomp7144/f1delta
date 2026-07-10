# Brief: Legal pages + footer + GA4 (consent-aware)

**Status:** Ready for Cody — all values final, zero placeholders
**Type:** Build — read-and-report first, then implement

## Context

Adding four required pages (About, Contact, Privacy Policy, Terms) for AdSense approval and GDPR / UK compliance, wiring them into a new footer, and adding Google Analytics (GA4) with Consent Mode v2. Page content is provided as four separate markdown files (`about.md`, `contact.md`, `privacy-policy.md`, `terms.md`). This work is purely additive — leave all existing pages and behavior untouched.

## Step 1 — Read and report (no code yet)

- Read `BaseLayout.astro` in full. Report: its prop interface (exact prop names pages use to pass page title / meta description), the `<head>` structure (where scripts belong), and confirm there is currently no footer (audit found nav + `<slot />` only).
- Read one existing simple page (e.g. `src/pages/standings/index.astro`) to capture the exact convention for importing and using BaseLayout (frontmatter, prop passing).
- Report back, then implement Steps 2–4.

## Step 2 — Create the four pages

Create these Astro pages, each wrapping the provided content in BaseLayout, matching the convention from Step 1:

- `src/pages/about.astro` (from `about.md`)
- `src/pages/contact.astro` (from `contact.md`)
- `src/pages/privacy-policy.astro` (from `privacy-policy.md`)
- `src/pages/terms.astro` (from `terms.md`)

Set each page's `<title>` and meta description appropriately (e.g. `About — F1 Delta`). Render the markdown as clean semantic HTML (headings, paragraphs, links open normally). Keep styling minimal and token-consistent — these inherit the design consolidation later, so don't hand-style them. The content is final — the Ko-fi URL in `about.md` is already the real one (`https://ko-fi.com/f1delta`), no placeholders remain.

## Step 3 — Add a footer to BaseLayout

BaseLayout has no footer. Add a minimal one, rendered on all Astro pages, containing:

- Links: About · Contact · Privacy Policy · Terms
- Ko-fi donate link: `https://ko-fi.com/f1delta`
- Copyright with dynamic year: `© {current year} F1 Delta`
- Affiliation disclaimer (small print): "F1 Delta is an unofficial, independent fan project and is not affiliated with, endorsed by, or connected to Formula 1, the FIA, or related entities. F1 and FORMULA 1 are trademarks of their respective owners."

Minimal styling, token-consistent, to be restyled in the design consolidation. Note: the driver-page SPA doesn't use BaseLayout, so it won't get this footer until the Phase 2 fold — that's fine, the legal pages are reachable site-wide through this footer, which is what AdSense needs.

## Step 4 — Add GA4 with Consent Mode v2

In BaseLayout's `<head>`, add the block below exactly. **The consent-default script MUST come before the gtag.js script** — order matters. The Measurement ID (`G-WJ7VNMC69K`) is already filled in — no substitution needed.

```html
<!-- Google Consent Mode v2 — defaults set BEFORE gtag loads -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'wait_for_update': 500
  });
</script>
<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WJ7VNMC69K"></script>
<script>
  gtag('js', new Date());
  gtag('config', 'G-WJ7VNMC69K');
</script>
```

Notes:
- Defaults are `denied`, so GA4 runs in cookieless mode until a consent tool grants consent — GDPR-friendly out of the box. A CMP will later call `gtag('consent', 'update', ...)` on acceptance (Google's certified CMP does this automatically once enabled).
- Do **NOT** add any AdSense ad code in this brief — that's pending approval. Analytics + pages only.

## Step 5 — Commit

Scoped to: the four new page files and `BaseLayout.astro` (footer + GA4). No `git add -A`. Quote bracketed paths.
