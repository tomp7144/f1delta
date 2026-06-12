/* ============================================================
   F1 DELTA — driver-data endpoint   (Netlify Functions v2)
   GET /api/driver?d=max_verstappen   → ONE driver, tiered
   GET /api/driver?list=1             → the index (public)

   SPLIT TIER: everyone gets free facts (identity, totals, career)
   plus a single teammate TEASER. Only Pro gets the full teammates
   array (every H2H + per-season detail). The Pro payload never
   leaves the server for a non-Pro request — gating is real, not
   cosmetic. Auth reuses lib/access.mjs (same gate as check-access).

   data/drivers/*.json are NOT in public/. Bundled via netlify.toml:
       included_files = ["data/drivers/**"]
   ============================================================ */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { verifyToken, isAdmin, readSub, isActive } from "./lib/access.mjs";

const DRIVERS_DIR = path.join(process.cwd(), "data", "drivers");
const SLUG_RE = /^[a-z0-9_-]{1,64}$/;

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

// Build the free-tier view: full facts, but teammates reduced to a
// single teaser (top by shared races) + a count. Drops per-season detail.
function freeView(full) {
  const { teammates, ...rest } = full;
  const list = Array.isArray(teammates) ? teammates : [];
  const top = [...list].sort((a, b) => b.aggregate.races - a.aggregate.races)[0];
  const teaser = top
    ? { teammate: top.teammate, teammateId: top.teammateId, seasonsShared: top.seasonsShared, aggregate: top.aggregate }
    : null;
  return { ...rest, teammateTeaser: teaser, teammateCount: list.length, pro: false };
}

export default async (req) => {
  if (req.method !== "GET") return json(405, { error: "method_not_allowed" });

  const params = new URL(req.url).searchParams;

  // PUBLIC index (names + light stats) — drives the funnel.
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

  const slug = (params.get("d") || "").toLowerCase();
  if (!SLUG_RE.test(slug)) return json(400, { error: "bad_slug" });

  let full;
  try {
    const file = path.join(DRIVERS_DIR, `${slug}.json`);
    if (!file.startsWith(DRIVERS_DIR + path.sep)) return json(400, { error: "bad_slug" });
    full = JSON.parse(await readFile(file, "utf8"));
  } catch {
    return json(404, { error: "not_found" });
  }

  const pro = await hasAccess(req);
  // NOTE: both tiers kept private for now to avoid any shared-cache
  // cross-tier mixup. Public caching of the free tier is a later
  // optimization (verify Netlify Vary behavior first).
  if (pro) return json(200, { ...full, pro: true });
  return json(200, freeView(full));
};

export const config = { path: "/api/driver" };
