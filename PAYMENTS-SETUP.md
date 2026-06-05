# F1 Delta — Payments Setup

A subscription paywall for the Pro area. Stripe takes the money, Netlify
Functions verify it, the browser never sees a secret.

## 1. Where the files go (repo root, NOT inside `public/`)

```
f1delta/
├─ netlify.toml                      ← new
├─ netlify/
│  └─ functions/
│     ├─ create-checkout.mjs         ← new
│     ├─ verify-session.mjs          ← new
│     ├─ check-access.mjs            ← new
│     ├─ stripe-webhook.mjs          ← new
│     └─ lib/
│        └─ access.mjs               ← new (shared, not an endpoint)
└─ public/
   └─ f1-access.js                   ← new (load before the app scripts)
```

`netlify/functions/` is a sibling of `public/`. Functions run server-side;
nothing in them ships to the browser.

## 2. Install dependencies

```
npm install stripe @netlify/blobs
```

(Netlify Blobs is zero-config when deployed on Netlify — no account setup,
no provisioning.)

## 3. Stripe, one-time

1. Create a Stripe account → **Test mode** while building.
2. Product catalog → **add a product** (e.g. "F1 Delta Pro"), give it a
   **recurring price**. Copy the **price ID** (`price_...`).
3. Developers → API keys → copy the **Secret key** (`sk_test_...`).
4. Developers → Webhooks → **add endpoint**:
   - URL: `https://YOURSITE/api/stripe-webhook`
   - Events: `checkout.session.completed`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Signing secret** (`whsec_...`).

## 4. Environment variables (Netlify → Site settings → Environment variables)

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` (then `sk_live_...` for launch) |
| `STRIPE_PRICE_ID` | `price_...` from step 3.2 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from step 3.4 |
| `TOKEN_SECRET` | any long random string — `openssl rand -hex 32` |
| `ADMIN_EMAILS` | your email(s), comma-separated — these pass through free |

Set the same vars for `netlify dev` in a local `.env` (do not commit it).

## 5. Passing through yourself

Put your email in `ADMIN_EMAILS`. The Pro page will let you in without
paying, on any device, for any email in that list. You never pay yourself.
(If you ever want a *real* comp subscription in Stripe's records instead,
make a 100%-off coupon — the checkout box already accepts promo codes.)

## 6. Local testing

```
npm install -g netlify-cli      # if you don't have it
netlify dev                     # serves the site + functions locally

# in a second terminal, forward Stripe webhooks to your local function:
stripe listen --forward-to localhost:8888/api/stripe-webhook
# (use the whsec_ it prints as STRIPE_WEBHOOK_SECRET while testing)
```

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

## 7. The endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/create-checkout` | `{email?}` → `{url}` to Stripe Checkout |
| GET | `/api/verify-session?session_id=` | confirm payment, mint token |
| POST | `/api/check-access` | `{token}` or `{email}` → `{active, ...}` |
| POST | `/api/stripe-webhook` | Stripe → updates subscriber status |

## 8. Notes / honest caveats

- **The Pro page content is still static.** Gating the *UI* stops casual
  visitors, but a determined user can read JSX served from `public/`. To
  truly protect premium data, serve it from a function that calls the same
  access check first. Worth doing only for whatever is actually valuable.
- **Restore-by-email is convenience-grade.** Anyone who knows a subscriber's
  email could claim access via the restore box. Fine for v1; the marked
  block in `check-access.mjs` shows where to swap in a magic-link.
- `success_url` points at `/pro` — that page needs to exist (built next).
