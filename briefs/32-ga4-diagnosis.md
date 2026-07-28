# Brief 32 — GA4 diagnosis: why analytics is dark

**Purpose:** Find out why GA4 isn't collecting by **reading what's actually wired** — not by theorizing about the config. This has been mis-diagnosed twice ("it waits on AdSense approval"), and the common thread each time was reasoning from memory instead of from the code. So: read, report, then apply the fix that matches the **confirmed** cause.

**The record, corrected (state this so it stops resurfacing):** GA4 and AdSense are unrelated products. GA4 does **not** wait on AdSense approval, and a consent banner does **not** require ads to be live to function. A dark GA4 is a tag problem or a consent-wiring problem — both checkable today, independent of AdSense.

**Push status:** Cody reports **Step 0 first**. Mechanical fixes (Steps 1, and the message-publish / ordering fixes in Step 2) can be applied once confirmed. The **regional-consent-default** change (Step 2b) is a compliance-posture choice — **report it and wait for Tom's sign-off**, don't just apply it. Tom reviews + pushes any change.

---

## Step 0 — DIAGNOSE AND REPORT (the point of this brief — do this before changing anything)

**A. The GA4 tag**
- Where is it — `BaseLayout` `<head>`, a component, a GTM container, Cloudflare Zaraz? Quote it.
- gtag.js direct, GTM, or Zaraz?
- The measurement ID (`G-XXXXXXX`) — confirm it matches the GA4 property Tom is actually checking.
- On **every** page, or conditional (env var, route, a consent flag)?

**B. Consent Mode**
- Is there a `gtag('consent', 'default', {...})` call? Quote it. Is `analytics_storage` set to `denied` or `granted`?
- Region-scoped (a `region: [...]` array) or global?
- **Ordering (classic bug):** does the consent `default` fire **before** the GA `config` / tag load? If it fires after, it's ignored.

**C. The consent banner / CMP**
- What is it — Google Privacy & messaging (Funding Choices), Cookiebot, Osano, a custom banner, or none?
- Does it call `gtag('consent', 'update', {analytics_storage: 'granted'})` on accept? Quote that path.
- Does the banner actually **render**? Is it conditional on anything (AdSense active, a region, an env var)?
- **If it's Google Privacy & messaging:** is a consent message actually **created and published** in the console — not just drafted? A drafted-but-unpublished message shows no banner → consent stays at the denied default → dark. (Publishable independent of ad approval.)

**D. Cloudflare**
- Any Zaraz or Cloudflare setting injecting/managing analytics? **Note:** the Cloudflare Web Analytics beacon is a *separate* product already on the site — confirm which is which; don't conflate it with GA4.

**E. Live checks (on the deployed site)**
- DevTools → Network → filter `collect` (i.e. `google-analytics.com/g/collect`). Load a page: **does a collect request fire?** Then accept the banner if one appears: **does one fire after?**
- GA4 **Realtime** report: does a self-visit appear? *(Realtime is instant — use it. Standard reports lag 24–48h and are a red herring for "is it working.")*
- GA4 **DebugView** (debug mode on): do events arrive?

**Report the findings as a set** — the cause is almost always obvious from the combination.

---

## Candidate causes → matching fix (apply only the one the findings confirm)

### Step 1 — Tag never fires (no collect request, ever)
Installation problem, not consent. Likely wrong/missing measurement ID, tag not on all pages, or a gated load that's never true. **Fix:** correct the ID, place the tag unconditionally in `BaseLayout` `<head>`, remove gating. Re-verify a collect request fires. *(Mechanical — apply once confirmed.)*

### Step 2 — Tag fires but consent is denied and never granted
Consent Mode is holding it down. Two sub-cases:

**2a — Banner never renders / never updates consent** *(CMP problem — mechanical fixes):*
- Google Privacy & messaging → **publish the message** (Step 0.C).
- Custom banner → wire the accept handler to call `gtag('consent', 'update', {analytics_storage: 'granted', ad_storage: 'granted'})`.
- Either way, ensure the consent `default` fires **before** the GA config (Step 0.B ordering).

**2b — Default is `denied` globally, but the banner is EEA-only** *(compliance-posture choice — REPORT, don't auto-apply):*
- Symptom fit: non-EEA traffic — **including Tom's own Michigan test visits** — is never prompted, so consent stays denied and analytics is dark for most of the audience. This matches "it's just dark" well.
- The standard compliant fix is **regional consent defaults**: `denied` for EEA/UK regions (the banner gates them, GDPR-correct), `granted` elsewhere (the US doesn't require prior opt-in for analytics). But defaulting analytics to granted outside the EEA is a *posture decision* — report the current region logic and the proposed change, and let Tom confirm before shipping it.

### Step 3 — Collect requests fire and Realtime shows visits
Not actually broken — a reporting-delay illusion (standard reports lag; Realtime is truth). No code change; confirm in Realtime and move on.

---

## If none match
**Stop and report.** Do not force-fit a fix — the entire purpose here is to stop guessing at the cause.

## Verify (after any fix)
- A self-visit (from the relevant region) appears in GA4 **Realtime** within seconds.
- A `collect` request fires on page load (post-consent where consent gates it).
- Consent `default` fires before GA `config`.

## Commit (scoped)
Whatever holds the tag/consent wiring (likely `BaseLayout` + any consent script). Named paths, not `-A`. Commit: `Brief 32: fix GA4 [confirmed cause] — analytics collecting`. Not pushed.

## Definition of done
- [ ] Step 0 findings reported as a set before any change.
- [ ] Confirmed cause matched to exactly one fix (or reported as none-match).
- [ ] Mechanical fixes applied; **regional-consent-default change reported for Tom's sign-off, not auto-applied**.
- [ ] Self-visit confirmed in Realtime; collect request fires; ordering correct.
- [ ] Scoped commit; not pushed.
