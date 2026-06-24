#!/usr/bin/env node
/**
 * bake-fantasy-history.mjs  ―  derive f1delta Fantasy Scores for all F1 history.
 *
 * Reads:  data/f1db/  (F1DB source files — committed to repo)
 * Writes: public/fantasy/by-driver/<driverId>.json  (~915 files)
 *         public/fantasy/by-season/<year>.json       (~77 files)
 *         public/fantasy/race-summaries.json         (1 file, keyed by raceId)
 *
 * Scoring formula is imported from fantasy-scoring.mjs (single source of truth).
 * Re-run after pulling a newer F1DB release; script is pure + idempotent.
 * Failure mode: log + exit 0 (never aborts cron).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { driverScore } from "./fantasy-scoring.mjs";

const F1DB  = "./data/f1db";
const OUT   = "./public/fantasy";

async function rj(file) {
  return JSON.parse(await readFile(path.resolve(file), "utf8"));
}

async function main() {
  const [races, results, drivers, gps] = await Promise.all([
    rj(`${F1DB}/f1db-races.json`),
    rj(`${F1DB}/f1db-races-race-results.json`),
    rj(`${F1DB}/f1db-drivers.json`),
    rj(`${F1DB}/f1db-grands-prix.json`),
  ]);

  const racesMeta   = new Map(races.map(r => [r.id, r]));
  const gpShortName = new Map(gps.map(g => [g.id, g.shortName]));
  const driverName  = new Map(drivers.map(d => [d.id, d.name]));
  const knockoutIds = new Set(
    races.filter(r => r.qualifyingFormat === "KNOCKOUT").map(r => r.id)
  );

  // Group results by raceId
  const byRace = new Map();
  for (const r of results) {
    let arr = byRace.get(r.raceId);
    if (!arr) { arr = []; byRace.set(r.raceId, arr); }
    arr.push(r);
  }

  // Accumulators
  // driverSeasons: driverId → Map<year, { score, races, partial }>
  const driverSeasons = new Map();
  // seasonData:   year → { drivers: Map<driverId, agg>, races: [] }
  const seasonData    = new Map();
  // raceSummaries: raceId → { topDriverId, topDriverName, topScore, partial }
  const raceSummaries = new Map();

  for (const [raceId, raceResults] of byRace) {
    const meta = racesMeta.get(raceId);
    if (!meta) continue;
    const { year, round, grandPrixId } = meta;
    const isKO = knockoutIds.has(raceId);

    let topScore  = -Infinity;
    let topId     = null;
    let topName   = null;
    let raceHasPartial = false;

    for (const r of raceResults) {
      const { score, partial } = driverScore(r, isKO);
      const dId = r.driverId;

      if (partial) raceHasPartial = true;

      // ── per-driver season accumulation ──
      if (!driverSeasons.has(dId)) driverSeasons.set(dId, new Map());
      const dMap = driverSeasons.get(dId);
      if (!dMap.has(year)) dMap.set(year, { score: 0, races: 0, partial: 0 });
      const da = dMap.get(year);
      da.score  += score;
      da.races  += 1;
      if (partial) da.partial += 1;

      // ── per-season driver accumulation ──
      if (!seasonData.has(year)) seasonData.set(year, { drivers: new Map(), races: [] });
      const sd = seasonData.get(year);
      if (!sd.drivers.has(dId)) sd.drivers.set(dId, { score: 0, races: 0, partial: 0 });
      const sda = sd.drivers.get(dId);
      sda.score  += score;
      sda.races  += 1;
      if (partial) sda.partial += 1;

      // ── top scorer for this race ──
      if (score > topScore) {
        topScore = score;
        topId    = dId;
        topName  = driverName.get(dId) ?? dId;
      }
    }

    // race summary
    if (topId != null) {
      raceSummaries.set(raceId, {
        topDriverId:   topId,
        topDriverName: topName,
        topScore,
        partial: raceHasPartial,
      });
    }

    // add race row to season
    seasonData.get(year).races.push({
      round,
      raceId,
      gpId:    grandPrixId,
      name:    gpShortName.get(grandPrixId) ?? grandPrixId,
      topId,
      topName,
      topScore,
      partial: raceHasPartial,
    });
  }

  // Sort each season's races by round
  for (const s of seasonData.values()) s.races.sort((a, b) => a.round - b.round);

  // ── Write files ────────────────────────────────────────────────────────────
  await mkdir(path.resolve(`${OUT}/by-driver`), { recursive: true });
  await mkdir(path.resolve(`${OUT}/by-season`), { recursive: true });

  // by-driver/<driverId>.json
  let drvCount = 0;
  const writes = [];
  for (const [dId, seasonMap] of driverSeasons) {
    const name    = driverName.get(dId) ?? dId;
    const seasons = [...seasonMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([year, agg]) => ({ year, ...agg }));
    const career  = seasons.reduce(
      (acc, s) => ({ score: acc.score + s.score, races: acc.races + s.races, partial: acc.partial + s.partial }),
      { score: 0, races: 0, partial: 0 }
    );
    writes.push(writeFile(
      path.resolve(`${OUT}/by-driver/${dId}.json`),
      JSON.stringify({ driverId: dId, name, career, seasons }, null, 2)
    ));
    drvCount++;
  }

  // by-season/<year>.json
  let yrCount = 0;
  for (const [year, data] of seasonData) {
    writes.push(writeFile(
      path.resolve(`${OUT}/by-season/${year}.json`),
      JSON.stringify({
        year,
        drivers: Object.fromEntries(data.drivers),
        races:   data.races,
      }, null, 2)
    ));
    yrCount++;
  }

  // race-summaries.json
  const summaryObj = Object.fromEntries(
    [...raceSummaries.entries()].map(([id, v]) => [String(id), v])
  );
  writes.push(writeFile(
    path.resolve(`${OUT}/race-summaries.json`),
    JSON.stringify(summaryObj, null, 2)
  ));

  await Promise.all(writes);

  console.log(
    `bake-fantasy-history: ${drvCount} drivers, ${yrCount} seasons, ${raceSummaries.size} races.`
  );
}

main().catch(err => {
  console.error("bake-fantasy-history: failed —", err.message);
  process.exit(0); // graceful — never abort cron
});
