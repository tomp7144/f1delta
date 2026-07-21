#!/usr/bin/env node
/**
 * derive-f1delta.mjs — computes the f1δ Score for every driver.
 *
 * Definition (locked):
 *   f1δ (season) = driver's actual awarded points that season
 *                  ÷ season's max theoretically winnable points  × 100
 *   f1δ (career) = sum of all season f1δ values
 *
 * Rules:
 *   - Points from F1DB's race-results `points` field (includes FL bonus where
 *     that era's rules apply). Sprint points added from sprint-race-results.
 *   - Indianapolis 500 (grandPrixId "indianapolis") excluded from both numerator
 *     and denominator for all 11 rounds (1950–1960).
 *   - FL bonus years: 1950–1959 and 2019+ (1 point).  No FL bonus 1960–2018.
 *   - All races counted (no best-N cap); DNFs / no-scores are zeros.
 *   - Season max = Σ race_max + Σ sprint_max, where
 *       race_max   = win_base + (1 if FL year, else 0)
 *       sprint_max = sprint winner's actual awarded points that race
 *       win_base   = P1.points − (1 if P1 had FL in an FL year, else 0)
 *
 * Writes:
 *   data/drivers/<id>.json    — adds/replaces top-level `f1delta` field
 *   data/f1delta/index.json   — sorted leaderboard (all drivers, career desc)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const r = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

// ── Load F1DB data ─────────────────────────────────────────────────────────
const races        = r("data/f1db/f1db-races.json");
const raceResults  = r("data/f1db/f1db-races-race-results.json");
const sprintResult = r("data/f1db/f1db-races-sprint-race-results.json");
const driversIdx   = r("data/drivers/index.json").drivers;

// ── Indy race IDs ──────────────────────────────────────────────────────────
const indyIds = new Set(
  races.filter(rc => rc.grandPrixId === "indianapolis").map(rc => rc.id)
);

// ── FL bonus predicate ─────────────────────────────────────────────────────
const hasFL = (year) => year <= 1959 || year >= 2019;

// ── Race lookup ────────────────────────────────────────────────────────────
const raceById = new Map(races.map(rc => [rc.id, rc]));

// ── Compute per-race max (main races, excluding Indy) ──────────────────────
const raceMaxPts = new Map(); // raceId → max pts winnable
{
  const byRace = new Map();
  for (const rr of raceResults) {
    if (indyIds.has(rr.raceId)) continue;
    if (!byRace.has(rr.raceId)) byRace.set(rr.raceId, []);
    byRace.get(rr.raceId).push(rr);
  }
  for (const [raceId, rows] of byRace) {
    const p1 = rows.find(rr => rr.positionNumber === 1);
    if (!p1) continue;
    const fl      = hasFL(raceById.get(raceId).year);
    const winBase = fl && p1.fastestLap ? p1.points - 1 : p1.points;
    raceMaxPts.set(raceId, winBase + (fl ? 1 : 0));
  }
}

// ── Compute per-sprint-race max ────────────────────────────────────────────
const sprintMaxPts = new Map(); // raceId → max sprint pts winnable
{
  const bySprint = new Map();
  for (const sr of sprintResult) {
    if (!bySprint.has(sr.raceId)) bySprint.set(sr.raceId, []);
    bySprint.get(sr.raceId).push(sr);
  }
  for (const [raceId, rows] of bySprint) {
    const p1 = rows.find(sr => sr.positionNumber === 1);
    if (p1) sprintMaxPts.set(raceId, p1.points);
  }
}

// ── Season max totals ──────────────────────────────────────────────────────
const seasonMax = new Map(); // year → total max pts
for (const [raceId, mx] of raceMaxPts) {
  const yr = raceById.get(raceId).year;
  seasonMax.set(yr, (seasonMax.get(yr) || 0) + mx);
}
for (const [raceId, mx] of sprintMaxPts) {
  const yr = raceById.get(raceId).year;
  seasonMax.set(yr, (seasonMax.get(yr) || 0) + mx);
}

// ── Driver numerator: race pts by (driverId, year) ─────────────────────────
const driverRacePts = new Map(); // `${id}::${year}` → pts
for (const rr of raceResults) {
  if (indyIds.has(rr.raceId)) continue;
  const yr = raceById.get(rr.raceId)?.year;
  if (!yr) continue;
  const k = `${rr.driverId}::${yr}`;
  driverRacePts.set(k, (driverRacePts.get(k) || 0) + (rr.points || 0));
}

// ── Driver numerator: sprint pts by (driverId, year) ──────────────────────
const driverSprintPts = new Map();
for (const sr of sprintResult) {
  const yr = raceById.get(sr.raceId)?.year;
  if (!yr) continue;
  const k = `${sr.driverId}::${yr}`;
  driverSprintPts.set(k, (driverSprintPts.get(k) || 0) + (sr.points || 0));
}

// ── Compute f1δ for all drivers ────────────────────────────────────────────
const leaderboard = [];
let updated = 0;

for (const d of driversIdx) {
  const drvPath = path.join(root, "data/drivers", `${d.driverId}.json`);
  if (!fs.existsSync(drvPath)) continue;
  const driver = JSON.parse(fs.readFileSync(drvPath, "utf8"));

  const seasons = [];
  let careerTotal = 0;

  for (const s of (driver.career ?? [])) {
    const yr  = s.season;
    const max = seasonMax.get(yr);
    if (!max) continue;
    const pts = (driverRacePts.get(`${d.driverId}::${yr}`) || 0)
              + (driverSprintPts.get(`${d.driverId}::${yr}`) || 0);
    const f1d = (pts / max) * 100;
    careerTotal += f1d;
    seasons.push({ year: yr, f1delta: Math.round(f1d * 10) / 10, pts, max });
  }

  if (seasons.length === 0) continue;

  const f1delta = {
    career:  Math.round(careerTotal * 10) / 10,
    seasons,
  };

  driver.f1delta = f1delta;
  fs.writeFileSync(drvPath, JSON.stringify(driver));
  updated++;

  leaderboard.push({
    driverId:    d.driverId,
    name:        d.name,
    career:      f1delta.career,
    seasons:     seasons.length,
    races:       driver.totals?.races ?? 0,
    firstSeason: d.firstSeason,
    lastSeason:  d.lastSeason,
  });
}

// ── Sort and write leaderboard ─────────────────────────────────────────────
leaderboard.sort((a, b) => b.career - a.career);
fs.mkdirSync(path.join(root, "data/f1delta"), { recursive: true });
fs.writeFileSync(
  path.join(root, "data/f1delta/index.json"),
  JSON.stringify({ drivers: leaderboard })
);

console.log(`derive-f1delta: ${updated} drivers updated, ${leaderboard.length} in leaderboard`);

// ── Sanity checks ──────────────────────────────────────────────────────────
const checks = [
  { id: "max-verstappen",     yr: 2023, expect: 92.7 },
  { id: "michael-schumacher", yr: 2004, expect: 82.2 },
  { id: "nino-farina",        yr: 1950, expect: 55.6 },
];
console.log("\nSanity check (expect ≈ target):");
for (const c of checks) {
  const entry = leaderboard.find(x => x.driverId === c.id);
  const drvPath = path.join(root, "data/drivers", `${c.id}.json`);
  const drv = JSON.parse(fs.readFileSync(drvPath, "utf8"));
  const s = drv.f1delta.seasons.find(s => s.year === c.yr);
  const got = s?.f1delta ?? "not found";
  const ok  = s && Math.abs(s.f1delta - c.expect) < 1.5;
  console.log(`  ${c.id} ${c.yr}: got=${got} expect≈${c.expect} ${ok ? "✓" : "✗ MISMATCH"}`);
  if (s) console.log(`    pts=${s.pts} max=${s.max}`);
}

// ── Top 10 leaderboard preview ─────────────────────────────────────────────
console.log("\nTop 10 career f1δ:");
for (const d of leaderboard.slice(0, 10)) {
  console.log(`  ${d.career.toFixed(1).padStart(7)}  ${d.name} (${d.firstSeason}–${d.lastSeason}, ${d.seasons} seasons)`);
}
