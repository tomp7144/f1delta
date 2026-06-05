/* ============================================================
   F1 DELTA — POST /api/check-access
   Body either:
     { token }  -> normal returning visitor
     { email }  -> restore on a new device / cleared storage
   Returns: { active: boolean, email?, admin?, token? }
   ============================================================ */

import {
  json,
  verifyToken,
  isAdmin,
  readSub,
  isActive,
  signToken,
} from "./lib/access.mjs";

export default async (request) => {
  if (request.method !== "POST") return json({ active: false }, 405);

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is fine */
  }
  const { token, email: restoreEmail } = body;

  /* 1) Token path — the normal case for a returning subscriber. */
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const email = payload.email;
      if (isAdmin(email)) return json({ active: true, email, admin: true });
      const sub = await readSub(email);
      if (isActive(sub)) return json({ active: true, email });
      // token still valid but the subscription was cancelled/lapsed
      return json({ active: false, reason: "subscription_inactive" });
    }
  }

  /* 2) Restore path — convenience-grade auth (see PAYMENTS-SETUP.md).
        ---------------------------------------------------------------
        TO HARDEN: instead of trusting the typed email, email a one-time
        magic link to it and only mint the token when that link is
        clicked. That requires an email provider (Resend / Postmark /
        SendGrid). Swap this block for that flow when you're ready. */
  if (restoreEmail) {
    const email = String(restoreEmail).trim().toLowerCase();
    if (isAdmin(email))
      return json({ active: true, email, admin: true, token: signToken(email) });
    const sub = await readSub(email);
    if (isActive(sub))
      return json({ active: true, email, token: signToken(email) });
    return json({ active: false, reason: "no_active_sub" });
  }

  return json({ active: false, reason: "no_credentials" });
};

export const config = { path: "/api/check-access" };
