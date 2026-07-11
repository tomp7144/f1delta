#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const load = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

function toSlug(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Lookup maps
const driverName = new Map(load("data/f1db/f1db-drivers.json").map(d => [d.id, d.name]));
const driverCode = new Map(load("data/f1db/f1db-drivers.json").map(d => [d.id, d.abbreviation]));
const constructorName = new Map(load("data/f1db/f1db-constructors.json").map(c => [c.id, c.name]));
const gpIndex = load("data/grands-prix/index.json").grandsPrix;
const gpName = new Map(gpIndex.map(g => [g.id, g.name]));
const gpCountry = new Map(gpIndex.map(g => [g.id, g.country?.name ?? null]));
const circuitName = new Map(load("data/circuits/index.json").circuits.map(c => [c.id, c.name]));

const races = load("data/f1db/f1db-races.json");

// Round counts per year
const roundsPerYear = new Map();
for (const r of races) roundsPerYear.set(r.year, (roundsPerYear.get(r.year) ?? 0) + 1);

// Index session data by raceId
function indexBy(rows, key = "raceId") {
  const m = new Map();
  for (const r of rows) {
    if (!m.has(r[key])) m.set(r[key], []);
    m.get(r[key]).push(r);
  }
  return m;
}

const resultsByRace = indexBy(load("data/f1db/f1db-races-race-results.json"));
const qualByRace    = indexBy(load("data/f1db/f1db-races-qualifying-results.json"));
const flByRace      = indexBy(load("data/f1db/f1db-races-fastest-laps.json"));
const dotdByRace    = indexBy(load("data/f1db/f1db-races-driver-of-the-day-results.json"));

const outDir = path.join(root, "data/races");
fs.mkdirSync(outDir, { recursive: true });

const index = [];

for (const race of races) {
  const results = resultsByRace.get(race.id);
  if (!results || results.length === 0) continue;

  const gpN = gpName.get(race.grandPrixId) ?? race.grandPrixId;
  const slug = `${race.year}-${toSlug(gpN)}`;

  const raceResults = results
    .sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder)
    .map(r => ({
      posText: r.positionText,
      driverId: r.driverId,
      driverName: driverName.get(r.driverId) ?? r.driverId,
      code: driverCode.get(r.driverId) ?? null,
      constructorId: r.constructorId,
      constructorName: constructorName.get(r.constructorId) ?? r.constructorId,
      laps: r.laps,
      time: r.time ?? null,
      gap: r.gap ?? null,
      gapLaps: r.gapLaps ?? null,
      reasonRetired: r.reasonRetired ?? null,
      points: r.points ?? 0,
      grid: r.gridPositionNumber ?? null,
      gridText: r.gridPositionText ?? null,
      fastestLap: r.fastestLap ?? false,
      driverOfTheDay: r.driverOfTheDay ?? false,
      grandSlam: r.grandSlam ?? false,
      pitStops: r.pitStops ?? null,
      polePosition: r.polePosition ?? false,
    }));

  const rawQual = (qualByRace.get(race.id) ?? [])
    .sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder);
  const qualifying = rawQual.map(q => ({
    posText: q.positionText,
    driverId: q.driverId,
    driverName: driverName.get(q.driverId) ?? q.driverId,
    code: driverCode.get(q.driverId) ?? null,
    constructorId: q.constructorId,
    constructorName: constructorName.get(q.constructorId) ?? q.constructorId,
    q1: q.q1 ?? null,
    q2: q.q2 ?? null,
    q3: q.q3 ?? null,
    time: q.time ?? null,
    gap: q.gap ?? null,
  }));

  const flRows = (flByRace.get(race.id) ?? []).sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder);
  const fastestLap = flRows[0] ? {
    driverId: flRows[0].driverId,
    driverName: driverName.get(flRows[0].driverId) ?? flRows[0].driverId,
    constructorId: flRows[0].constructorId,
    constructorName: constructorName.get(flRows[0].constructorId) ?? flRows[0].constructorId,
    time: flRows[0].time,
    lap: flRows[0].lap ?? null,
  } : null;

  const dotdRows = (dotdByRace.get(race.id) ?? []).sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder);
  const dotd = dotdRows[0] ? {
    driverId: dotdRows[0].driverId,
    driverName: driverName.get(dotdRows[0].driverId) ?? dotdRows[0].driverId,
  } : null;

  const raceData = {
    slug,
    raceId: race.id,
    year: race.year,
    round: race.round,
    totalRounds: roundsPerYear.get(race.year) ?? null,
    grandPrixId: race.grandPrixId,
    gpName: gpN,
    gpCountry: gpCountry.get(race.grandPrixId) ?? null,
    officialName: race.officialName ?? null,
    circuitId: race.circuitId,
    circuitName: circuitName.get(race.circuitId) ?? race.circuitId,
    date: race.date,
    laps: race.laps ?? null,
    distance: race.distance ?? null,
    qualifyingFormat: race.qualifyingFormat ?? null,
    wdcDecider: race.driversChampionshipDecider ?? false,
    wccDecider: race.constructorsChampionshipDecider ?? false,
    results: raceResults,
    qualifying,
    fastestLap,
    dotd,
  };

  fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(raceData));

  index.push({
    slug,
    raceId: race.id,
    year: race.year,
    round: race.round,
    grandPrixId: race.grandPrixId,
    gpName: gpN,
    gpCountry: gpCountry.get(race.grandPrixId) ?? null,
    circuitId: race.circuitId,
    date: race.date,
  });
}

index.sort((a, b) => b.year - a.year || (b.round ?? 0) - (a.round ?? 0));
fs.writeFileSync(path.join(outDir, "index.json"), JSON.stringify({ count: index.length, races: index }));
console.log(`data/races/: ${index.length} race files + index.json`);
