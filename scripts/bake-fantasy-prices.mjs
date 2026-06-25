#!/usr/bin/env node
/**
 * scripts/bake-fantasy-prices.mjs
 *
 * Fetches official F1 Fantasy per-round price, ownership, and points data
 * from the public feeds API and writes to data/fantasy/prices.source.json.
 *
 * SOURCE
 *   GET https://fantasy.formula1.com/feeds/drivers/{N}_en.json
 *   N = gameday/round index (1-based). No auth required.
 *
 * SOURCE TYPOS (do NOT "fix" these — they are the actual API key names)
 *   FUllName      → driver's display name
 *   OverallPpints → cumulative season points
 *
 * KEY SCHEME
 *   Drivers     → DriverReference  (e.g. "PIEGAS01") — always non-empty
 *   Constructors → PlayerId         (e.g. "28")       — DriverReference is "" for these
 *
 * MODES
 *   node scripts/bake-fantasy-prices.mjs --full   initial seed, fetches all rounds
 *   node scripts/bake-fantasy-prices.mjs          cron mode: re-fetches only the live round
 *
 * FREEZE LOGIC
 *   A round is "frozen" (historical) when it has non-null GamedayPoints.
 *   Frozen rounds are never re-fetched.  Only the live (current) round updates.
 *
 * OUTPUT
 *   data/fantasy/prices.source.json  (Pro-gated — lives in data/, not public/)
 *   Shape: { "PIEGAS01": { "1": { price, prevPrice, ownership, ... }, "2": {...} }, ... }
 *
 * Failure mode: log + exit 0 (never aborts cron).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE     = "https://fantasy.formula1.com/feeds/drivers";
const OUT      = path.resolve("./data/fantasy/prices.source.json");
const MAX_PROBE = 30; // safety cap for round discovery

const FULL_MODE = process.argv.includes("--full");

// ── HTTP helpers ─────────────────────────────────────────────────────────────

async function fetchRound(n) {
  const url = `${BASE}/${n}_en.json`;
  let res;
  try {
    res = await fetch(url, { headers: { accept: "application/json" } });
  } catch (e) {
    throw new Error(`Network error fetching round ${n}: ${e.message}`);
  }
  if (res.status === 404 || res.status === 403) return null; // round doesn't exist yet
  if (!res.ok) throw new Error(`HTTP ${res.status} for round ${n}`);
  const json = await res.json();
  const drivers = json?.Data?.Value;
  if (!Array.isArray(drivers) || drivers.length === 0) {
    throw new Error(`Unexpected response shape for round ${n}`);
  }
  return drivers;
}

// ── Normalization ─────────────────────────────────────────────────────────────

function assetKey(d) {
  // Drivers have a DriverReference; constructors do not.
  return d.DriverReference || String(d.PlayerId);
}

function parseNum(v) {
  if (v == null || v === "") return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// Returns true when at least one session in SessionWisePoints has a non-null score.
// The live/upcoming round has GamedayPoints=0 (integer) with all session points null —
// treat that 0 as null so consumers can distinguish "not scored" from "scored 0".
function hasSessionPoints(d) {
  const swp = d.SessionWisePoints;
  return Array.isArray(swp) && swp.some(s => s.points !== null && s.points !== undefined);
}

function normalizeEntry(d, round) {
  return {
    round,
    tla:           d.DriverTLA    || null,
    name:          d.FUllName     || null,   // source typo: FUllName
    team:          d.TeamName     || null,
    positionType:  d.PositionName || null,   // "DRIVER" | "CONSTRUCTOR"
    price:         parseNum(d.Value),
    prevPrice:     parseNum(d.OldPlayerValue),
    ownership:     parseNum(d.SelectedPercentage),
    captainPct:    parseNum(d.CaptainSelectedPercentage),
    gamedayPoints: hasSessionPoints(d) ? parseNum(d.GamedayPoints) : null, // null = not yet scored
    overallPoints: parseNum(d.OverallPpints),  // source typo: OverallPpints
    stats:         d.AdditionalStats || null,
  };
}

function roundIsFrozen(entries) {
  // Historical (scored) rounds have at least one asset with non-null
  // session-level points inside SessionWisePoints.
  // The live/upcoming round has GamedayPoints=0 (integer) but all
  // SessionWisePoints[*].points are null — do NOT confuse with a
  // genuine 0-point score, which arrives as a decimal string ("0.00").
  return entries.some(d => {
    const swp = d.SessionWisePoints;
    return Array.isArray(swp) && swp.some(s => s.points !== null && s.points !== undefined);
  });
}

// ── Merge helpers ─────────────────────────────────────────────────────────────

function applyRound(db, rawEntries, round) {
  for (const d of rawEntries) {
    const key = assetKey(d);
    if (!key) continue;
    if (!db[key]) db[key] = {};
    db[key][String(round)] = normalizeEntry(d, round);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Load existing output
  let db = {};
  try {
    db = JSON.parse(await readFile(OUT, "utf8"));
  } catch { /* first run or corrupt — start fresh */ }

  // Which rounds are already frozen in the DB?
  function frozenRoundsInDb() {
    const frozen = new Set();
    for (const rounds of Object.values(db)) {
      for (const [rStr, entry] of Object.entries(rounds)) {
        if (entry.gamedayPoints !== null) frozen.add(Number(rStr));
      }
    }
    return frozen;
  }

  if (FULL_MODE) {
    // ── Full seed: fetch all rounds until 404 ──────────────────────────────
    console.log("Mode: --full (fetching all available rounds)");
    let fetched = 0;
    for (let n = 1; n <= MAX_PROBE; n++) {
      const raw = await fetchRound(n);
      if (!raw) { console.log(`Round ${n}: 404 — stopping.`); break; }
      const frozen = roundIsFrozen(raw);
      applyRound(db, raw, n);
      console.log(`Round ${n}: ${raw.length} assets, frozen=${frozen}`);
      fetched++;
    }
    console.log(`Full seed complete — ${fetched} rounds fetched.`);

  } else {
    // ── Cron mode: only update the live (unfrozen) round ──────────────────
    console.log("Mode: cron (updating live round only)");
    const frozen = frozenRoundsInDb();

    // Determine current live round: highest round in db + probe for next
    let knownMax = frozen.size > 0 ? Math.max(...frozen) : 0;

    // Check if the round after knownMax exists (new round opened since last run)
    let liveRound = null;
    for (let n = knownMax + 1; n <= knownMax + 2; n++) {
      const raw = await fetchRound(n);
      if (!raw) break;
      const f = roundIsFrozen(raw);
      applyRound(db, raw, n);
      console.log(`Round ${n}: ${raw.length} assets, frozen=${f}`);
      if (!f) { liveRound = n; break; }
      // If this new round is already frozen (edge: race scored before cron ran),
      // keep probing for the next live one.
      knownMax = n;
    }

    // Also re-fetch the highest unfrozen round already in db (if any)
    const dbRounds = new Set(
      Object.values(db).flatMap(r => Object.keys(r).map(Number))
    );
    const allRounds = [...dbRounds].sort((a, b) => a - b);
    const unfrozenInDb = allRounds.filter(n => !frozen.has(n));
    for (const n of unfrozenInDb) {
      if (n === liveRound) continue; // already fetched above
      const raw = await fetchRound(n);
      if (!raw) continue;
      const f = roundIsFrozen(raw);
      applyRound(db, raw, n);
      console.log(`Round ${n} (re-fetch unfrozen): ${raw.length} assets, frozen=${f}`);
    }

    if (liveRound == null && unfrozenInDb.length === 0) {
      console.log("Nothing to update — all rounds are frozen and no new round found.");
    }
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(db, null, 2));

  const assetCount  = Object.keys(db).length;
  const roundCounts = Object.values(db).map(r => Object.keys(r).length);
  const maxRound    = roundCounts.length ? Math.max(...roundCounts) : 0;
  console.log(`Written: ${OUT} (${assetCount} assets, up to round ${maxRound})`);
}

main().catch(err => {
  console.error("bake-fantasy-prices:", err.message);
  process.exit(0); // graceful — never abort cron
});
