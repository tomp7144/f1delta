/* ============================================================
   F1 DELTA — fantasy-data endpoint   (Netlify Functions v2)
   GET /api/fantasy-data
   Returns the full players.json payload (syncedAt + assets) only
   for authenticated Pro users. Non-Pro requests get 403.
   Pro check is real server-side — no data reaches non-Pro clients.
   data/fantasy/** bundled via netlify.toml included_files.
   ============================================================ */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { verifyToken, isAdmin, readSub, isActive } from "./lib/access.mjs";

const PLAYERS_FILE = path.join(process.cwd(), "data", "fantasy", "players.json");

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

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "private, no-store" },
  });
}

export default async (req) => {
  if (req.method !== "GET") return json(405, { error: "method_not_allowed" });

  const pro = await hasAccess(req);
  if (!pro) return json(403, { error: "pro_required" });

  try {
    const raw = await readFile(PLAYERS_FILE, "utf8");
    return new Response(raw, {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "private, max-age=900",
      },
    });
  } catch {
    return json(503, { error: "data_unavailable" });
  }
};

export const config = { path: "/api/fantasy-data" };
