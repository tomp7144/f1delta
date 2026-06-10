/* ============================================================
   F1 DELTA — gated driver-data endpoint   (Netlify Functions v2)
   GET /api/driver?d=max_verstappen   → ONE driver (Pro-gated)
   GET /api/driver?list=1             → the index (PUBLIC teaser)

   data/drivers/*.json are NOT in public/, so they never reach the
   CDN. Bundled at deploy via netlify.toml:
       included_files = ["data/drivers/**"]

   Auth reuses lib/access.mjs — same gate as check-access.mjs.
   ============================================================ */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { verifyToken, isAdmin, readSub, isActive } from "./lib/access.mjs";

const DRIVERS_DIR = path.join(process.cwd(), "data", "drivers");
const SLUG_RE = /^[a-z0-9_-]{1,64}$/; // slug == driverId; allows _ AND - ; blocks traversal

function json(status, body, cache = "private, no-store") {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": cache },
  });
}

function bearer(req) {
  const a = req.headers.get("authorization") || "";
  return a.startsWith("Bearer ") ? a.slice(7).trim() : "";
}

async function hasAccess(req) {
  const payload = verifyToken(bearer(req));
  if (!payload || !payload.email) return false;
  if (isAdmin(payload.email)) return true;
  const sub = await readSub(payload.email);
  return isActive(sub);
}

export default async (req) => {
  if (req.method !== "GET") return json(405, { error: "method_not_allowed" });

  const params = new URL(req.url).searchParams;

  // PUBLIC: the index (names + light stats only — not the Pro value).
  // Drives the funnel: anyone can browse, individual pages stay gated.
  if (params.get("list") === "1") {
    try {
      const raw = await readFile(path.join(DRIVERS_DIR, "index.json"), "utf8");
      return new Response(raw, {
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" },
      });
    } catch {
      return json(500, { error: "index_unavailable" });
    }
  }

  // GATED: a single driver's full record (career + H2H).
  if (!(await hasAccess(req))) return json(401, { error: "locked" });

  const slug = (params.get("d") || "").toLowerCase();
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
