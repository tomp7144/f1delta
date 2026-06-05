/* ============================================================
   F1 DELTA — GET /api/verify-session?session_id=...
   Called once, right after Stripe redirects back to /pro.
   Confirms the payment with Stripe directly (doesn't rely on the
   webhook having landed yet) and mints a signed access token.
   This is the strong, can't-fake path: a token only exists if
   Stripe says a real session completed and the sub is active.
   ============================================================ */

import Stripe from "stripe";
import { json, signToken, writeSub, mapCustomer } from "./lib/access.mjs";

export default async (request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return json({ active: false, error: "missing session_id" }, 400);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    const paid =
      session.status === "complete" || session.payment_status === "paid";
    const email = (
      session.customer_details?.email ||
      session.customer_email ||
      ""
    ).toLowerCase();
    const sub = session.subscription;
    const active =
      paid && sub && (sub.status === "active" || sub.status === "trialing");

    if (!active || !email) return json({ active: false });

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    // Record it now too, so a refresh before the webhook lands still works.
    await writeSub(email, {
      status: sub.status,
      customerId,
      subscriptionId: sub.id,
      currentPeriodEnd: sub.current_period_end,
      updated: Date.now(),
    });
    await mapCustomer(customerId, email);

    return json({ active: true, email, token: signToken(email) });
  } catch (err) {
    console.error("verify-session:", err.message);
    return json({ active: false, error: "verify failed" }, 500);
  }
};

export const config = { path: "/api/verify-session" };
