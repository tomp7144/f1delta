/* ============================================================
   F1 DELTA — shared paywall helpers
   Lives in /lib (a subfolder) so Netlify does NOT treat this as
   its own endpoint. Imported by the function files via esbuild.
   ============================================================ */

import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const b64url = (buf) =>
  Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromB64url = (str) =>
  Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64");

/* ---- Signed access tokens (HMAC-SHA256, no external dependency) ----
   Token = base64url(payloadJSON) + "." + base64url(hmac)
   The secret lives only on the server (TOKEN_SECRET env var), so the
   browser can hold a token but can never forge one. */
export function signToken(email, ttlSeconds = 60 * 60 * 24 * 30) {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) throw new Error("TOKEN_SECRET not set");
  const payload = {
    email: String(email).toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(crypto.createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  try {
    const secret = process.env.TOKEN_SECRET;
    if (!secret || !token || !token.includes(".")) return null;
    const [body, sig] = token.split(".");
    const expected = b64url(
      crypto.createHmac("sha256", secret).update(body).digest()
    );
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(fromB64url(body).toString("utf8"));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload; // { email, exp }
  } catch {
    return null;
  }
}

/* ---- Admin allowlist (this is how YOU pass through without paying) ---- */
export function isAdmin(email) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(String(email).toLowerCase());
}

/* ---- Subscriber store (Netlify Blobs, zero-config on Netlify) ---- */
function subStore() {
  // strong consistency => a read right after the webhook write sees it
  return getStore({ name: "subscribers", consistency: "strong" });
}

export async function readSub(email) {
  if (!email) return null;
  const store = subStore();
  return (
    (await store.get(`sub:${String(email).toLowerCase()}`, { type: "json" })) ||
    null
  );
}

export async function writeSub(email, data) {
  const store = subStore();
  await store.setJSON(`sub:${String(email).toLowerCase()}`, data);
}

// map Stripe customer id -> email, so subscription.* webhook events
// (which only carry the customer id) can resolve which user changed
export async function mapCustomer(customerId, email) {
  if (!customerId || !email) return;
  const store = subStore();
  await store.set(`cust:${customerId}`, String(email).toLowerCase());
}

export async function emailForCustomer(customerId) {
  if (!customerId) return null;
  const store = subStore();
  return (await store.get(`cust:${customerId}`)) || null;
}

export function isActive(sub) {
  return !!sub && (sub.status === "active" || sub.status === "trialing");
}

/* ---- tiny JSON Response helper for Netlify Functions v2 ---- */
export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
