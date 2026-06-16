#!/usr/bin/env node
/**
 * derive-circuits.mjs — builds per-circuit reference data from F1DB.
 *
 * Reads:  ./data/f1db/*.json
 * Writes: ./data/circuits/index.json          (index of all 78 circuits)
 *         ./data/circuits/<circuitId>.json    (one per circuit)
 *
 * No network. Pure computation. Re-run after pulling a newer F1DB release.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const F1DB = path.resolve("./data/f1db");
const OUT  = path.resolve("./data/circuits");

const FILES = {
  circuits:     "f1db-circuits.json",
  layouts:      "f1db-circuits-layouts.json",
  grandsPrix:   "f1db-grands-prix.json",
  races:        "f1db-races.json",
  raceResults:  "f1db-races-race-results.json",
  fastestLaps:  "f1db-races-fastest-laps.json",
  drivers:      "f1db-drivers.json",
  constructors: "f1db-constructors.json",
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
  const [circuitsArr, layoutsArr, gpsArr, racesArr, raceRes, flArr, driversArr, constructorsArr, countriesArr] =
    await Promise.all(Object.values(FILES).map(load));

  const driverName  = new Map(driversArr.map(d => [d.id, d.name]));
  const teamName    = new Map(constructorsArr.map(c => [c.id, c.name]));
  const gpMeta      = new Map(gpsArr.map(g => [g.id, { name: g.fullName, shortName: g.shortName }]));
  const countryById = new Map(countriesArr.map(c => [c.id, { name: c.name, a2: c.alpha2Code }]));

  // layouts grouped by circuitId
  const layoutsByCircuit = new Map();
  for (const l of layoutsArr) {
    if (!layoutsByCircuit.has(l.circuitId)) layoutsByCircuit.set(l.circuitId, []);
    layoutsByCircuit.get(l.circuitId).push(l);
  }

  // race results indexed by raceId
  const resultsByRace = new Map();
  for (const r of raceRes) {
    if (!resultsByRace.has(r.raceId)) resultsByRace.set(r.raceId, []);
    resultsByRace.get(r.raceId).push(r);
  }

  // fastest lap (pos 1) indexed by raceId
  const fastestLapByRace = new Map();
  for (const f of flArr) {
    if (f.positionNumber === 1) fastestLapByRace.set(f.raceId, f);
  }

  // races grouped by circuitId
  const racesByCircuit = new Map();
  for (const r of racesArr) {
    if (!racesByCircuit.has(r.circuitId)) racesByCircuit.set(r.circuitId, []);
    racesByCircuit.get(r.circuitId).push(r);
  }

  await mkdir(OUT, { recursive: true });
  const index = [];

  for (const circuit of circuitsArr) {
    const races = (racesByCircuit.get(circuit.id) ?? []).sort((a, b) => a.year - b.year);
    const layouts = (layoutsByCircuit.get(circuit.id) ?? []);
    const country = countryById.get(circuit.countryId) ?? null;

    // Which GPs have been held here (deduplicated, in order first appeared)
    const gpOrder = [];
    const gpSeen = new Set();
    for (const r of races) {
      if (!gpSeen.has(r.grandPrixId)) {
        gpSeen.add(r.grandPrixId);
        const gp = gpMeta.get(r.grandPrixId);
        if (gp) gpOrder.push({ id: r.grandPrixId, name: gp.name, shortName: gp.shortName });
      }
    }

    // Per-running rows
    const runnings = [];
    for (const race of races) {
      const results = resultsByRace.get(race.id) ?? [];
      const gp = gpMeta.get(race.grandPrixId);

      const winnerRow = results.find(r => r.positionNumber === 1 && !r.sharedCar)
        ?? results.find(r => r.positionNumber === 1);
      const poleRow   = results.find(r => r.polePosition && !r.sharedCar)
        ?? results.find(r => r.polePosition);
      const flRow     = fastestLapByRace.get(race.id);
      const p2Row     = results.find(r => r.positionNumber === 2 && !r.sharedCar);

      let winningMarginMs = null, winningMarginText = null;
      if (p2Row?.gapMillis != null) {
        winningMarginMs   = p2Row.gapMillis;
        winningMarginText = fmtMargin(p2Row.gapMillis);
      } else if (p2Row?.gapLaps != null) {
        winningMarginText = `+${p2Row.gapLaps} lap${p2Row.gapLaps > 1 ? "s" : ""}`;
      }

      runnings.push({
        year:              race.year,
        raceId:            race.id,
        grandPrixId:       race.grandPrixId,
        grandPrix:         gp?.shortName ?? race.grandPrixId,
        layoutId:          race.circuitLayoutId ?? null,
        courseLength:      race.courseLength ?? null,
        turns:             race.turns ?? null,
        laps:              race.laps ?? null,
        winner:            winnerRow ? (driverName.get(winnerRow.driverId) ?? winnerRow.driverId) : null,
        winnerId:          winnerRow?.driverId ?? null,
        constructor:       winnerRow ? (teamName.get(winnerRow.constructorId) ?? winnerRow.constructorId) : null,
        constructorId:     winnerRow?.constructorId ?? null,
        pole:              poleRow ? (driverName.get(poleRow.driverId) ?? poleRow.driverId) : null,
        poleId:            poleRow?.driverId ?? null,
        fastestLap:        flRow ? (driverName.get(flRow.driverId) ?? flRow.driverId) : null,
        fastestLapId:      flRow?.driverId ?? null,
        fastestLapTime:    flRow?.time ?? null,
        winningMarginMs,
        winningMarginText,
        grandSlam:         !!(winnerRow?.grandSlam),
        champDecider:      !!(race.driversChampionshipDecider || race.constructorsChampionshipDecider),
        wdcDecider:        !!race.driversChampionshipDecider,
        wccDecider:        !!race.constructorsChampionshipDecider,
      });
    }

    // ---- stat callouts ----
    const winsByDriver = new Map(), polesByDriver = new Map(), winsByConstructor = new Map();
    let grandSlamCount = 0, champDeciderCount = 0;

    for (const r of runnings) {
      if (r.winnerId) {
        winsByDriver.set(r.winnerId, (winsByDriver.get(r.winnerId) ?? 0) + 1);
        winsByConstructor.set(r.constructorId, (winsByConstructor.get(r.constructorId) ?? 0) + 1);
      }
      if (r.poleId) polesByDriver.set(r.poleId, (polesByDriver.get(r.poleId) ?? 0) + 1);
      if (r.grandSlam) grandSlamCount++;
      if (r.champDecider) champDeciderCount++;
    }

    const topWinDriver   = [...winsByDriver.entries()].sort((a, b) => b[1] - a[1])[0];
    const topPoleDriver  = [...polesByDriver.entries()].sort((a, b) => b[1] - a[1])[0];
    const topConstructor = [...winsByConstructor.entries()].sort((a, b) => b[1] - a[1])[0];

    const stats = {
      mostWinsDriver:      topWinDriver   ? { id: topWinDriver[0],   name: driverName.get(topWinDriver[0])   ?? topWinDriver[0],   wins:  topWinDriver[1]   } : null,
      mostPolesDriver:     topPoleDriver  ? { id: topPoleDriver[0],  name: driverName.get(topPoleDriver[0])  ?? topPoleDriver[0],  poles: topPoleDriver[1]  } : null,
      mostWinsConstructor: topConstructor ? { id: topConstructor[0], name: teamName.get(topConstructor[0])   ?? topConstructor[0], wins:  topConstructor[1]  } : null,
      grandSlams:          grandSlamCount,
      champDeciders:       champDeciderCount,
    };

    const out = {
      id:            circuit.id,
      name:          circuit.name,
      fullName:      circuit.fullName,
      previousNames: circuit.previousNames ?? null,
      country,
      placeName:     circuit.placeName ?? null,
      type:          circuit.type,
      direction:     circuit.direction,
      length:        circuit.length,
      turns:         circuit.turns,
      totalRacesHeld: races.length,
      layouts,
      grandsPrix:    gpOrder,
      stats,
      runningsList:  runnings,
    };

    await writeFile(path.join(OUT, `${circuit.id}.json`), JSON.stringify(out));

    index.push({
      id:            circuit.id,
      name:          circuit.name,
      country,
      placeName:     circuit.placeName ?? null,
      type:          circuit.type,
      direction:     circuit.direction,
      length:        circuit.length,
      turns:         circuit.turns,
      totalRacesHeld: races.length,
      firstYear:     races[0]?.year ?? null,
      lastYear:      races[races.length - 1]?.year ?? null,
    });
  }

  index.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(
    path.join(OUT, "index.json"),
    JSON.stringify({ count: index.length, circuits: index, updated: new Date().toISOString() })
  );

  console.log(`Derived ${index.length} circuits -> ${OUT}`);
}

main();
