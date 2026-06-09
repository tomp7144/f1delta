/* ============================================================
   F1 DELTA — gated driver-data endpoint   (Netlify Functions v2)
   GET /api/driver?d=max_verstappen

   The ONLY door to data/drivers/*.json — those files are NOT in
   public/, so they never reach the CDN. Bundled at deploy via
   netlify.toml:   included_files = ["data/drivers/**"]

   Auth reuses the SAME lib/access.mjs as check-access.mjs — one
   source of truth. Access decision mirrors check-access's token
   path exactly: valid signed token + (admin OR live-active sub).
   ============================================================ */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { verifyToken, isAdmin, readSub, isActive } from "./lib/access.mjs";

const DRIVERS_DIR = path.join(process.cwd(), "data", "drivers");
const SLUG_RE = /^[a-z0-9_]{1,64}$/; // slug == driverId; blocks traversal

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "private, no-store" },
  });
}

function bearer(req) {
  const a = req.headers.get("authorization") || "";
  return a.startsWith("Bearer ") ? a.slice(7).trim() : "";
}

// Same gate as check-access.mjs (token path), via the shared lib.
async function hasAccess(req) {
  const payload = verifyToken(bearer(req)); // null if missing/forged/expired
  if (!payload || !payload.email) return false;
  if (isAdmin(payload.email)) return true;   // ADMIN_EMAILS passthrough
  const sub = await readSub(payload.email);
  return isActive(sub);                       // live status, not just signature
}

export default async (req) => {
  if (req.method !== "GET") return json(405, { error: "method_not_allowed" });
  if (!(await hasAccess(req))) return json(401, { error: "locked" });

  const slug = (new URL(req.url).searchParams.get("d") || "").toLowerCase();
  if (!SLUG_RE.test(slug)) return json(400, { error: "bad_slug" });

  try {
    const file = path.join(DRIVERS_DIR, `${slug}.json`);
    if (!file.startsWith(DRIVERS_DIR + path.sep)) return json(400, { error: "bad_slug" });
    const raw = await readFile(file, "utf8");
    return new Response(raw, {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "private, max-age=3600" },
    });
  } catch {
    return json(404, { error: "not_found" });
  }
};

export const config = { path: "/api/driver" };
