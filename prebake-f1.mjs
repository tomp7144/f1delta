#!/usr/bin/env node
/**
 * prebake-f1.mjs — one-time (re-runnable) snapshot of F1 history from Jolpica.
 *
 * Writes one JSON file per season into OUT_DIR, plus an index.json.
 * Designed to be a polite API citizen and fully resumable:
 *   - Completed seasons are immutable, so once a season file exists it's skipped.
 *   - The current season is always re-fetched (it grows race by race).
 *   - On HTTP 429 it honors Retry-After and backs off; if it gives up it exits
 *     cleanly with progress saved, so you just run it again later.
 *
 * Usage:
 *   node prebake-f1.mjs                # full history -> current year
 *   node prebake-f1.mjs 2015 2024      # only that year range
 *   node prebake-f1.mjs --refresh      # re-fetch even seasons already on disk
 *
 * Requires Node 18+ (uses global fetch).
 */

import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

// ---- config -------------------------------------------------------------
const BASE = "https://api.jolpi.ca/ergast/f1";
const OUT_DIR = path.resolve("./data/seasons"); // NOT public/ — see notes
const FIRST_SEASON = 1950;
const PAGE = 100;          // max rows Jolpica returns per request
const DELAY_MS = 1500;     // gap between requests (stays well under 4/sec)
const MAX_RETRIES = 5;     // per request, for 429 / network / 5xx
const INCLUDE_QUALIFYING = true; // quali H2H (data exists ~1994+)
const INCLUDE_SPRINT = true;     // sprint results (2021+)

// ---- tiny helpers -------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const currentYear = new Date().getFullYear();

const args = process.argv.slice(2);
const FORCE_REFRESH = args.includes("--refresh");
const years = args.filter((a) => /^\d{4}$/.test(a)).map(Number);
const START = years[0] ?? FIRST_SEASON;
const END = years[1] ?? currentYear;

async function fetchJson(url) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: { Accept: "application/json" } });
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      await sleep(DELAY_MS * attempt);
      continue;
    }
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("retry-after")) || 60;
      console.warn(`  429 rate-limited. Waiting ${retryAfter}s...`);
      await sleep((retryAfter + 1) * 1000);
      continue;
    }
    if (res.status >= 500) {
      if (attempt === MAX_RETRIES) throw new Error(`${res.status} on ${url}`);
      await sleep(DELAY_MS * attempt);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} on ${url}`);
    return res.json();
  }
  throw new Error(`Gave up after ${MAX_RETRIES} attempts: ${url}`);
}

/** Page through a season-level endpoint, merging split races by round. */
async function pagedRaces(endpoint) {
  const byRound = new Map(); // round -> race object with merged result arrays
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const url = `${BASE}/${endpoint}.json?limit=${PAGE}&offset=${offset}`;
    const data = await fetchJson(url);
    const mr = data.MRData;
    total = parseInt(mr.total, 10) || 0;
    const races = mr.RaceTable?.Races ?? [];
    for (const race of races) {
      const key = race.round;
      if (!byRound.has(key)) {
        byRound.set(key, race);
      } else {
        // same race split across a page boundary — concatenate result rows
        const prev = byRound.get(key);
        for (const field of ["Results", "QualifyingResults", "SprintResults"]) {
          if (race[field]) prev[field] = [...(prev[field] ?? []), ...race[field]];
        }
      }
    }
    offset += PAGE;
    if (offset < total) await sleep(DELAY_MS);
  }
  return [...byRound.values()].sort((a, b) => Number(a.round) - Number(b.round));
}

// ---- normalizers: keep files lean but complete for the Pro features -----
const num = (v) => (v == null || v === "" ? null : Number(v));

function normResult(r) {
  return {
    pos: num(r.position),
    posText: r.positionText, // "1", "R" (retired), "D" (DSQ), "W", etc.
    driverId: r.Driver.driverId,
    code: r.Driver.code ?? null,
    driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
    constructorId: r.Constructor.constructorId,
    constructor: r.Constructor.name,
    grid: num(r.grid),      // 0 = pit-lane start
    points: num(r.points),
    laps: num(r.laps),
    status: r.status,        // "Finished", "+1 Lap", "Engine", "Accident"...
    fastestLapRank: r.FastestLap ? num(r.FastestLap.rank) : null,
  };
}

function normQuali(q) {
  return {
    pos: num(q.position),
    driverId: q.Driver.driverId,
    constructorId: q.Constructor.constructorId,
    q1: q.Q1 ?? null,
    q2: q.Q2 ?? null,
    q3: q.Q3 ?? null,
  };
}

function normRaceMeta(race) {
  return {
    round: num(race.round),
    raceName: race.raceName,
    circuit: race.Circuit?.circuitName ?? null,
    country: race.Circuit?.Location?.country ?? null,
    date: race.date ?? null,
    time: race.time ?? null, // UTC, e.g. "13:00:00Z" — present for recent races
  };
}

// ---- per-season build ---------------------------------------------------
async function buildSeason(year) {
  const results = await pagedRaces(`${year}/results`);
  const quali = INCLUDE_QUALIFYING ? await pagedRaces(`${year}/qualifying`) : [];
  const sprint = INCLUDE_SPRINT ? await pagedRaces(`${year}/sprint`) : [];

  const qByRound = new Map(quali.map((r) => [r.round, r]));
  const sByRound = new Map(sprint.map((r) => [r.round, r]));

  const races = results.map((race) => {
    const meta = normRaceMeta(race);
    const q = qByRound.get(race.round);
    const s = sByRound.get(race.round);
    return {
      ...meta,
      results: (race.Results ?? []).map(normResult),
      qualifying: q ? (q.QualifyingResults ?? []).map(normQuali) : [],
      sprint: s ? (s.SprintResults ?? []).map(normResult) : [],
    };
  });

  return { season: year, raceCount: races.length, races };
}

// ---- main ---------------------------------------------------------------
async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Baking F1 history ${START}–${END} -> ${OUT_DIR}`);

  const baked = [];
  for (let year = START; year <= END; year++) {
    const file = path.join(OUT_DIR, `${year}.json`);
    const isCurrent = year >= currentYear;
    if (existsSync(file) && !isCurrent && !FORCE_REFRESH) {
      baked.push(year);
      console.log(`${year}  skip (already baked)`);
      continue;
    }
    try {
      const season = await buildSeason(year);
      if (season.raceCount === 0 && isCurrent) {
        console.log(`${year}  no races yet — skipping write`);
        continue;
      }
      await writeFile(file, JSON.stringify(season));
      baked.push(year);
      console.log(`${year}  ${season.raceCount} races`);
    } catch (err) {
      console.error(`${year}  FAILED: ${err.message}`);
      console.error("Progress is saved per-season. Re-run later to resume.");
      break; // stop cleanly; rerun picks up where we left off
    }
    await sleep(DELAY_MS);
  }

  // refresh the index of what we have on disk
  const onDisk = [];
  for (let y = FIRST_SEASON; y <= currentYear; y++) {
    if (existsSync(path.join(OUT_DIR, `${y}.json`))) onDisk.push(y);
  }
  await writeFile(
    path.join(OUT_DIR, "index.json"),
    JSON.stringify({ seasons: onDisk, updated: new Date().toISOString() })
  );
  console.log(`\nDone. ${onDisk.length} seasons on disk.`);
}

// run only when executed directly (so tests can import the internals)
import { fileURLToPath } from "node:url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { pagedRaces, normResult, normQuali, fetchJson };
