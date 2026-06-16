#!/usr/bin/env node
/**
 * derive-gps.mjs — builds per-Grand-Prix reference data from F1DB.
 *
 * Reads:  ./data/f1db/*.json
 * Writes: ./data/grands-prix/index.json          (index of all 54 GPs)
 *         ./data/grands-prix/<grandPrixId>.json   (one per GP)
 *
 * No network. Pure computation. Re-run after pulling a newer F1DB release.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const F1DB = path.resolve("./data/f1db");
const OUT  = path.resolve("./data/grands-prix");

const FILES = {
  grandsPrix:   "f1db-grands-prix.json",
  races:        "f1db-races.json",
  raceResults:  "f1db-races-race-results.json",
  fastestLaps:  "f1db-races-fastest-laps.json",
  drivers:      "f1db-drivers.json",
  constructors: "f1db-constructors.json",
  circuits:     "f1db-circuits.json",
  countries:    "f1db-countries.json",
};

async function load(name) {
  const fp = path.join(F1DB, name);
  if (!existsSync(fp)) { console.error(`Missing: ${fp}`); process.exit(1); }
  return JSON.parse(await import("node:fs").then(m => m.promises.readFile(fp, "utf8")));
}

function fmtMargin(ms) {
  if (ms == null) return null;
  if (ms >= 60_000) {
    const m = Math.floor(ms / 60_000);
    const s = ((ms % 60_000) / 1000).toFixed(3);
    return `${m}:${s.padStart(6, "0")}`;
  }
  return `${(ms / 1000).toFixed(3)}s`;
}

async function main() {
  const [gpsArr, racesArr, raceRes, flArr, driversArr, constructorsArr, circuitsArr, countriesArr] =
    await Promise.all(Object.values(FILES).map(load));

  const driverName = new Map(driversArr.map(d => [d.id, d.name]));
  const teamName   = new Map(constructorsArr.map(c => [c.id, c.name]));
  const circuitName = new Map(circuitsArr.map(c => [c.id, c.name]));
  const countryByCountryId = new Map(countriesArr.map(c => [c.id, { name: c.name, a2: c.alpha2Code }]));

  // Index race results by raceId
  const resultsByRace = new Map();
  for (const r of raceRes) {
    if (!resultsByRace.has(r.raceId)) resultsByRace.set(r.raceId, []);
    resultsByRace.get(r.raceId).push(r);
  }

  // Index fastest laps by raceId (position 1)
  const fastestLapByRace = new Map();
  for (const f of flArr) {
    if (f.positionNumber === 1) fastestLapByRace.set(f.raceId, f);
  }

  // Group races by grandPrixId
  const racesByGP = new Map();
  for (const r of racesArr) {
    if (!racesByGP.has(r.grandPrixId)) racesByGP.set(r.grandPrixId, []);
    racesByGP.get(r.grandPrixId).push(r);
  }

  await mkdir(OUT, { recursive: true });
  const index = [];

  for (const gp of gpsArr) {
    const races = (racesByGP.get(gp.id) ?? []).sort((a, b) => a.year - b.year);
    if (races.length === 0) continue;

    const country = countryByCountryId.get(gp.countryId) ?? null;

    // Per-running rows
    const runnings = [];
    for (const race of races) {
      const results = resultsByRace.get(race.id) ?? [];

      // Winner: positionNumber === 1 (exclude sharedCar secondary entry)
      const winnerRow = results.find(r => r.positionNumber === 1 && !r.sharedCar)
        ?? results.find(r => r.positionNumber === 1); // fallback for shared-car era
      // Pole: polePosition flag
      const poleRow   = results.find(r => r.polePosition && !r.sharedCar)
        ?? results.find(r => r.polePosition);
      // Fastest lap from dedicated file
      const flRow     = fastestLapByRace.get(race.id);
      // Winning margin: P2's gapMillis (or gapLaps if lapped)
      const p2Row     = results.find(r => r.positionNumber === 2 && !r.sharedCar);
      let winningMarginMs   = null;
      let winningMarginText = null;
      if (p2Row) {
        if (p2Row.gapMillis != null) {
          winningMarginMs   = p2Row.gapMillis;
          winningMarginText = fmtMargin(p2Row.gapMillis);
        } else if (p2Row.gapLaps != null) {
          winningMarginText = `+${p2Row.gapLaps} lap${p2Row.gapLaps > 1 ? "s" : ""}`;
        }
      }

      runnings.push({
        year:              race.year,
        raceId:            race.id,
        circuitId:         race.circuitId,
        circuit:           circuitName.get(race.circuitId) ?? race.circuitId,
        winner:            winnerRow ? (driverName.get(winnerRow.driverId) ?? winnerRow.driverId) : null,
        winnerId:          winnerRow?.driverId ?? null,
        constructor:       winnerRow ? (teamName.get(winnerRow.constructorId) ?? winnerRow.constructorId) : null,
        constructorId:     winnerRow?.constructorId ?? null,
        pole:              poleRow ? (driverName.get(poleRow.driverId) ?? poleRow.driverId) : null,
        poleId:            poleRow?.driverId ?? null,
        fastestLap:        flRow ? (driverName.get(flRow.driverId) ?? flRow.driverId) : null,
        fastestLapId:      flRow?.driverId ?? null,
        laps:              race.laps ?? null,
        winningMarginMs,
        winningMarginText,
        grandSlam:         !!(winnerRow?.grandSlam),
        champDecider:      !!(race.driversChampionshipDecider || race.constructorsChampionshipDecider),
        wdcDecider:        !!race.driversChampionshipDecider,
        wccDecider:        !!race.constructorsChampionshipDecider,
      });
    }

    // ---- stat callouts ----
    const winsByDriver      = new Map();
    const polesByDriver     = new Map();
    const winsByConstructor = new Map();
    let biggestMarginMs = null, biggestMarginRow = null;
    let grandSlamCount = 0, champDeciderCount = 0;

    for (const r of runnings) {
      if (r.winnerId) {
        winsByDriver.set(r.winnerId, (winsByDriver.get(r.winnerId) ?? 0) + 1);
        winsByConstructor.set(r.constructorId, (winsByConstructor.get(r.constructorId) ?? 0) + 1);
      }
      if (r.poleId) polesByDriver.set(r.poleId, (polesByDriver.get(r.poleId) ?? 0) + 1);
      if (r.grandSlam) grandSlamCount++;
      if (r.champDecider) champDeciderCount++;
      if (r.winningMarginMs != null && (biggestMarginMs == null || r.winningMarginMs > biggestMarginMs)) {
        biggestMarginMs = r.winningMarginMs;
        biggestMarginRow = r;
      }
    }

    const topWinDriver = [...winsByDriver.entries()].sort((a, b) => b[1] - a[1])[0];
    const topPoleDriver = [...polesByDriver.entries()].sort((a, b) => b[1] - a[1])[0];
    const topConstructor = [...winsByConstructor.entries()].sort((a, b) => b[1] - a[1])[0];

    const circuits = [...new Set(runnings.map(r => r.circuitId))];

    const stats = {
      mostWinsDriver:       topWinDriver  ? { id: topWinDriver[0],  name: driverName.get(topWinDriver[0])  ?? topWinDriver[0],  wins: topWinDriver[1]  } : null,
      mostPolesDriver:      topPoleDriver ? { id: topPoleDriver[0], name: driverName.get(topPoleDriver[0]) ?? topPoleDriver[0], poles: topPoleDriver[1] } : null,
      mostWinsConstructor:  topConstructor ? { id: topConstructor[0], name: teamName.get(topConstructor[0]) ?? topConstructor[0], wins: topConstructor[1] } : null,
      biggestMargin:        biggestMarginRow ? {
        year:      biggestMarginRow.year,
        ms:        biggestMarginMs,
        text:      biggestMarginRow.winningMarginText,
        winnerId:  biggestMarginRow.winnerId,
        winner:    biggestMarginRow.winner,
      } : null,
      grandSlams:           grandSlamCount,
      champDeciders:        champDeciderCount,
    };

    const out = {
      id:          gp.id,
      name:        gp.fullName,
      shortName:   gp.shortName,
      country:     country,
      firstYear:   races[0].year,
      lastYear:    races[races.length - 1].year,
      runnings:    races.length,
      circuits,
      stats,
      runningsList: runnings,
    };

    await writeFile(path.join(OUT, `${gp.id}.json`), JSON.stringify(out));

    index.push({
      id:        gp.id,
      name:      gp.fullName,
      shortName: gp.shortName,
      country,
      firstYear: out.firstYear,
      lastYear:  out.lastYear,
      runnings:  out.runnings,
      circuits:  circuits.length,
    });
  }

  index.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(
    path.join(OUT, "index.json"),
    JSON.stringify({ count: index.length, grandsPrix: index, updated: new Date().toISOString() })
  );

  console.log(`Derived ${index.length} grands prix -> ${OUT}`);
}

main();
