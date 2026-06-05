/* ============================================================
   F1 DELTA — POST /api/stripe-webhook
   Stripe calls this when payments/subscriptions change.
   It is the source of truth for who is subscribed.
   ============================================================ */

import Stripe from "stripe";
import {
  writeSub,
  readSub,
  mapCustomer,
  emailForCustomer,
} from "./lib/access.mjs";

export default async (request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers.get("stripe-signature");

  // CRITICAL: Stripe verifies against the RAW body. Use .text(), never .json().
  const raw = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      raw,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("webhook signature failed:", err.message);
    return new Response("bad signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const email = (
          s.customer_details?.email ||
          s.customer_email ||
          ""
        ).toLowerCase();
        if (email) {
          await writeSub(email, {
            status: "active",
            customerId: s.customer,
            subscriptionId: s.subscription,
            updated: Date.now(),
          });
          await mapCustomer(s.customer, email);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const email = await emailForCustomer(sub.customer);
        if (email) {
          const existing = (await readSub(email)) || {};
          await writeSub(email, {
            ...existing,
            status: event.type.endsWith("deleted") ? "canceled" : sub.status,
            subscriptionId: sub.id,
            currentPeriodEnd: sub.current_period_end,
            updated: Date.now(),
          });
        }
        break;
      }

      default:
        break; // ignore everything else
    }
  } catch (err) {
    // Writes are idempotent, so it's safe to let Stripe retry on failure.
    console.error("webhook handler error:", err.message);
    return new Response("handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

export const config = { path: "/api/stripe-webhook" };
