#!/usr/bin/env node
/**
 * derive-teams.mjs — builds one JSON file per constructor for the team pages.
 *
 * Reads:  ./data/f1db/*.json   (F1DB "json-splitted" release, committed to the repo)
 * Writes: ./data/teams/{constructorId}.json   (one per team)
 *         ./data/teams/index.json              (sortable teams index)
 *
 * No network. Pure derivation — re-run after pulling a newer F1DB release,
 * same Actions step as derive-f1.mjs / derive-records.mjs:
 *   node derive-teams.mjs
 *
 * Per-team payload (all free-tier funnel content):
 *   - identity + nationality
 *   - career totals (F1DB precomputed)
 *   - season-by-season (F1DB precomputed per-season)
 *   - driver lineup: every driver who raced for the team, derived from race
 *     results (years active, races, wins, podiums, points for THIS team)
 *
 * The Pro gate (engineers / upgrades / salary intel) slots in later, same way
 * the driver page gates H2H — there's nothing to gate yet, so v1 ships free.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const F1DB_DIR = path.resolve("./data/f1db");
const OUT_DIR  = path.resolve("./data/teams");

const FILES = {
  constructors:        "f1db-constructors.json",
  seasonsConstructors: "f1db-seasons-constructors.json",
  races:               "f1db-races.json",
  raceResults:         "f1db-races-race-results.json",
  drivers:             "f1db-drivers.json",
  countries:           "f1db-countries.json",
};

const round1 = (n) => Math.round((n + Number.EPSILON) * 10) / 10;
const get = (map, key, make) => { if (!map.has(key)) map.set(key, make()); return map.get(key); };

async function loadJSON(name) {
  const fp = path.join(F1DB_DIR, name);
  if (!existsSync(fp)) {
    console.error(
      `\nMissing: ${fp}\n` +
      `  -> Unzip f1db-json-splitted.zip into data/f1db/.\n` +
      `  -> Run \`ls data/f1db\` and confirm names match the FILES map in this script.\n`
    );
    process.exit(1);
  }
  return JSON.parse(await readFile(fp, "utf8"));
}

async function main() {
  const [constructors, seasonsCon, races, raceRes, drivers, countries] = await Promise.all([
    loadJSON(FILES.constructors), loadJSON(FILES.seasonsConstructors),
    loadJSON(FILES.races), loadJSON(FILES.raceResults),
    loadJSON(FILES.drivers), loadJSON(FILES.countries),
  ]);

  const flagOf = new Map(countries.map((c) => [c.id, { id: c.id, code: c.alpha3Code, a2: c.alpha2Code }]));
  const raceYear = new Map(races.map((r) => [r.id, r.year]));
  const driverMeta = new Map(drivers.map((d) => [d.id, { id: d.id, name: d.name, nat: flagOf.get(d.nationalityCountryId) ?? null }]));

  // season rows grouped by constructor (desc by year)
  const seasonsByCon = new Map();
  for (const s of seasonsCon) {
    get(seasonsByCon, s.constructorId, () => []).push({
      year: s.year,
      pos: s.positionNumber ?? null,
      wins: s.totalRaceWins ?? 0,
      podiums: s.totalPodiums ?? 0,
      poles: s.totalPolePositions ?? 0,
      points: round1(s.totalPoints ?? 0),
      entries: s.totalRaceEntries ?? 0,
    });
  }

  // ---- one pass over race results: driver lineup per constructor ----
  // conId -> driverId -> { races, wins, podiums, points, years:Set }
  const lineup = new Map();
  for (const r of raceRes) {
    if (!r.constructorId || !r.driverId) continue;
    const yr = raceYear.get(r.raceId);
    const byDriver = get(lineup, r.constructorId, () => new Map());
    const d = get(byDriver, r.driverId, () => ({ races: 0, wins: 0, podiums: 0, points: 0, years: new Set() }));
    d.races += 1;
    if (r.positionNumber === 1) d.wins += 1;
    if (r.positionNumber != null && r.positionNumber <= 3) d.podiums += 1;
    d.points += r.points ?? 0;
    if (yr != null) d.years.add(yr);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const index = [];

  for (const c of constructors) {
    const nat = flagOf.get(c.countryId) ?? null;
    const seasons = (seasonsByCon.get(c.id) ?? []).sort((a, b) => b.year - a.year);

    const byDriver = lineup.get(c.id) ?? new Map();
    const drivers = [...byDriver.entries()].map(([id, d]) => {
      const m = driverMeta.get(id);
      const years = [...d.years].sort((a, b) => a - b);
      return {
        id, name: m ? m.name : id, nat: m ? m.nat : null,
        first: years[0] ?? null, last: years[years.length - 1] ?? null,
        races: d.races, wins: d.wins, podiums: d.podiums, points: round1(d.points),
      };
    }).sort((a, b) => b.races - a.races || (a.first ?? 0) - (b.first ?? 0));

    const seasonYears = seasons.map((s) => s.year);
    const driverYears = drivers.flatMap((d) => [d.first, d.last]).filter((y) => y != null);
    const allYears = [...seasonYears, ...driverYears];
    const span = allYears.length ? { first: Math.min(...allYears), last: Math.max(...allYears) } : { first: null, last: null };

    const totals = {
      championships: c.totalChampionshipWins ?? 0,
      wins: c.totalRaceWins ?? 0,
      podiums: c.totalPodiums ?? 0,
      poles: c.totalPolePositions ?? 0,
      fastestLaps: c.totalFastestLaps ?? 0,
      points: round1(c.totalPoints ?? 0),
      entries: c.totalRaceEntries ?? 0,
      starts: c.totalRaceStarts ?? 0,
      oneTwoFinishes: c.total1And2Finishes ?? 0,
      laps: c.totalRaceLaps ?? 0,
      sprintWins: c.totalSprintRaceWins ?? 0,
    };

    const team = {
      id: c.id, name: c.name, fullName: c.fullName ?? c.name, nat, span,
      best: {
        championship: c.bestChampionshipPosition ?? null,
        race: c.bestRaceResult ?? null,
        grid: c.bestStartingGridPosition ?? null,
      },
      totals, seasons, drivers,
      updated: new Date().toISOString().slice(0, 10),
    };

    await writeFile(path.join(OUT_DIR, `${c.id}.json`), JSON.stringify(team));
    index.push({
      id: c.id, name: c.name, nat,
      championships: totals.championships, wins: totals.wins,
      points: totals.points, entries: totals.entries,
      first: span.first, last: span.last,
    });
  }

  index.sort((a, b) => b.wins - a.wins || b.points - a.points);
  await writeFile(path.join(OUT_DIR, "index.json"),
    JSON.stringify({ count: index.length, updated: new Date().toISOString(), teams: index }));

  console.log(`Derived ${index.length} team files -> ${OUT_DIR}`);
}

main();
