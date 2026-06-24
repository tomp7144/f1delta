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

// Phase 2: swap out the numerator here to change the value metric.
export function ppm(price, points) {
  if (!price) return null;
  return Math.round((points / price) * 10) / 10;
}

async function main() {
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

  // 3. Normalize to a uniform schema.
  const assets = [
    ...drvBucket.map(p => ({
      id:     p.playerid,
      name:   p.playername ?? p.teamname,
      type:   "driver",
      team:   p.teamname,
      price:  p.curvalue,
      points: p.statvalue,
    })),
    ...ctorBucket.map(p => ({
      id:     p.playerid,
      name:   p.teamname,
      type:   "constructor",
      team:   p.teamname,
      price:  p.curvalue,
      points: p.statvalue,
    })),
  ];

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
