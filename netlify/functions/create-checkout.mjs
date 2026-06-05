/* ============================================================
   F1 DELTA — POST /api/create-checkout
   Body: { email?: string }
   Returns: { url } — the Stripe Checkout page to redirect to.
   ============================================================ */

import Stripe from "stripe";
import { json } from "./lib/access.mjs";

export default async (request) => {
  if (request.method !== "POST") return json({ error: "POST only" }, 405);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let email = "";
  try {
    const body = await request.json();
    email = (body.email || "").trim().toLowerCase();
  } catch {
    /* email is optional — Stripe Checkout will collect one if absent */
  }

  // Build absolute URLs for the return trip.
  const origin =
    request.headers.get("origin") ||
    `https://${request.headers.get("host") || ""}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      ...(email ? { customer_email: email } : {}),
      allow_promotion_codes: true, // lets you comp people with a 100%-off coupon
      success_url: `${origin}/pro?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro?checkout=cancelled`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("create-checkout:", err.message);
    return json({ error: "could not start checkout" }, 500);
  }
};

export const config = { path: "/api/create-checkout" };
