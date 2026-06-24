#!/usr/bin/env node
/**
 * bake-fantasy.mjs — bakes F1 Fantasy price/points into static data files.
 *
 * Source: fantasy.formula1.com feeds API (no auth required)
 * Writes: ./data/fantasy/players.json       (latest snapshot — Pro-gated page reads this)
 *         ./data/fantasy/price-history.json  (append-only ledger, de-duped)
 *
 * Failure mode: log + exit 0 (never aborts cron, never touches existing files).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ppm } from "./fantasy-scoring.mjs";

const BASE        = "https://fantasy.formula1.com";
const PLAYERS_OUT = path.resolve("./data/fantasy/players.json");
const HISTORY_OUT = path.resolve("./data/fantasy/price-history.json");

async function getJSON(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    throw new Error(`Non-JSON response (${ct.split(";")[0]}) for ${url}`);
  }
  return res.json();
}

// F1DB driver name → id lookup with manual overrides for known name mismatches.
// Fantasy API uses "Carlos Sainz"; F1DB id is "carlos-sainz-jr".
const DRIVER_OVERRIDES = {
  "carlos sainz":    "carlos-sainz-jr",   // F1DB id has -jr suffix
  "sergio perez":    "sergio-perez",       // F1DB name is "Sergio Pérez"
  "nico hulkenberg": "nico-hulkenberg",    // F1DB name is "Nico Hülkenberg"
};
// Fantasy constructor name → F1DB constructor id
const CTOR_ID = {
  "mercedes":       "mercedes",
  "ferrari":        "ferrari",
  "mclaren":        "mclaren",
  "red bull racing": "red-bull",
  "alpine":         "alpine",
  "racing bulls":   "racing-bulls",
  "haas f1 team":   "haas",
  "williams":       "williams",
  "audi":           "audi",
  "cadillac":       "cadillac",
  "aston martin":   "aston-martin",
};

async function buildDriverLookup() {
  try {
    const raw = JSON.parse(await readFile(path.resolve("./data/f1db/f1db-drivers.json"), "utf8"));
    // Map normalized name → F1DB id
    const map = new Map();
    for (const d of raw) {
      const key = d.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      map.set(key, d.id);
    }
    return map;
  } catch {
    return new Map();
  }
}

function resolveDriverId(fantasyName, driverLookup) {
  const norm = fantasyName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (DRIVER_OVERRIDES[norm]) return DRIVER_OVERRIDES[norm];
  return driverLookup.get(norm) ?? null;
}

async function main() {
  const driverLookup = await buildDriverLookup();

  // 1. Resolve current tourId from config (falls back to 4 if unavailable).
  const cfg    = await getJSON(`${BASE}/feeds/v2/apps/web_config.json`);
  const tourId = cfg?.Data?.config?.tourId ?? 4;

  // 2. Fetch combined driver + constructor stats.
  const raw        = await getJSON(`${BASE}/feeds/v2/statistics/driverconstructors_${tourId}.json`);
  const drvBucket  = raw?.Data?.driver?.[0]?.participants;
  const ctorBucket = raw?.Data?.constructor?.[0]?.participants;
  if (!Array.isArray(drvBucket) || !Array.isArray(ctorBucket)) {
    throw new Error("Unexpected response shape — missing participant arrays");
  }

  // 3. Normalize to a uniform schema (with pageId for driver/team links).
  const unmatched = [];
  const assets = [
    ...drvBucket.map(p => {
      const name   = p.playername ?? p.teamname;
      const pageId = resolveDriverId(name, driverLookup);
      if (!pageId) unmatched.push(`driver: ${name}`);
      return { id: p.playerid, name, type: "driver", team: p.teamname, price: p.curvalue, points: p.statvalue, pageId };
    }),
    ...ctorBucket.map(p => {
      const name   = p.teamname;
      const pageId = CTOR_ID[name.toLowerCase()] ?? null;
      if (!pageId) unmatched.push(`constructor: ${name}`);
      return { id: p.playerid, name, type: "constructor", team: p.teamname, price: p.curvalue, points: p.statvalue, pageId };
    }),
  ];
  if (unmatched.length) console.warn("bake-fantasy: unmatched pageId for:", unmatched.join(", "));

  // 4. Load existing price history.
  let history = [];
  try {
    const raw = JSON.parse(await readFile(HISTORY_OUT, "utf8"));
    if (Array.isArray(raw)) history = raw;
  } catch { /* first run or corrupt — start fresh */ }

  // 5. priceDelta = current price minus the previous snapshot's price for that asset.
  const prevPrices = new Map(
    (history[history.length - 1]?.assets ?? []).map(a => [a.id, a.price])
  );
  const stamped = assets.map(a => ({
    ...a,
    priceDelta: prevPrices.has(a.id) ? +(a.price - prevPrices.get(a.id)).toFixed(1) : 0,
  }));

  const syncedAt = new Date().toISOString();

  // 6. Write players.json (always — it's the current-state snapshot).
  await mkdir(path.dirname(PLAYERS_OUT), { recursive: true });
  await writeFile(PLAYERS_OUT, JSON.stringify({ syncedAt, season: 2026, assets: stamped }, null, 2));

  // 7. Append to history only if any price or points changed vs the last snapshot.
  const lastMap    = new Map((history[history.length - 1]?.assets ?? []).map(a => [a.id, a]));
  const anyChanged = stamped.some(a => {
    const p = lastMap.get(a.id);
    return !p || p.price !== a.price || p.points !== a.points;
  });

  if (anyChanged) {
    history.push({ syncedAt, assets: stamped });
    await writeFile(HISTORY_OUT, JSON.stringify(history, null, 2));
    console.log(`Appended new price-history snapshot (${stamped.length} assets, ${history.length} total).`);
  } else {
    console.log("No change in prices or points — skipping history append.");
  }

  console.log(`Baked fantasy data -> ${PLAYERS_OUT}  (${assets.length} assets, tourId=${tourId})`);
}

main().catch(err => {
  console.error("bake-fantasy: failed —", err.message);
  process.exit(0); // graceful — never abort cron
});
