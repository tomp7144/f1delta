#!/usr/bin/env node
/**
 * prebake-standings.mjs — final driver & constructor standings per season.
 *
 * The one thing you can't derive from race results: championship position.
 * Historical seasons used dropped-scores rules, so summed race points != the
 * official championship order. This pulls the real final standings.
 *
 * Writes ./data/standings/{year}.json = { season, drivers:[...], constructors:[...] }
 *
 * Same manners as prebake-f1.mjs: spaced requests, 429 backoff, resumable
 * (completed seasons skipped once on disk; current season always refreshed).
 *
 * Usage:
 *   node prebake-standings.mjs            # all seasons -> current year
 *   node prebake-standings.mjs 2021 2026  # a range
 *   node prebake-standings.mjs --refresh  # re-pull even seasons on disk
 *
 * Note: the Constructors' Championship only began in 1958, so seasons
 * 1950–1957 will have an empty constructors array — that's expected.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE = "https://api.jolpi.ca/ergast/f1";
const OUT_DIR = path.resolve("./data/standings");
const FIRST_SEASON = 1950;
const PAGE = 100;
const DELAY_MS = 1500;
const MAX_RETRIES = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => (v == null || v === "" ? null : Number(v));
const currentYear = new Date().getFullYear();

const args = process.argv.slice(2);
const FORCE_REFRESH = args.includes("--refresh");
const yrs = args.filter((a) => /^\d{4}$/.test(a)).map(Number);
const START = yrs[0] ?? FIRST_SEASON;
const END = yrs[1] ?? currentYear;

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

/** Page through a standings endpoint, concatenating the standings rows. */
async function pagedStandings(endpoint, listKey, rowKey) {
  const rows = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const data = await fetchJson(`${BASE}/${endpoint}.json?limit=${PAGE}&offset=${offset}`);
    const mr = data.MRData;
    total = parseInt(mr.total, 10) || 0;
    const list = mr.StandingsTable?.StandingsLists?.[0];
    if (list?.[rowKey]) rows.push(...list[rowKey]);
    offset += PAGE;
    if (offset < total) await sleep(DELAY_MS);
  }
  return rows;
}

const normDriver = (d) => ({
  pos: num(d.position),
  driverId: d.Driver.driverId,
  code: d.Driver.code ?? null,
  driver: `${d.Driver.givenName} ${d.Driver.familyName}`,
  points: num(d.points),
  wins: num(d.wins),
  constructorIds: (d.Constructors ?? []).map((c) => c.constructorId),
});

const normConstructor = (c) => ({
  pos: num(c.position),
  constructorId: c.Constructor.constructorId,
  constructor: c.Constructor.name,
  points: num(c.points),
  wins: num(c.wins),
});

async function buildSeason(year) {
  const drivers = (await pagedStandings(`${year}/driverStandings`, "StandingsLists", "DriverStandings"))
    .map(normDriver);
  await sleep(DELAY_MS);
  const constructors = (await pagedStandings(`${year}/constructorStandings`, "StandingsLists", "ConstructorStandings"))
    .map(normConstructor);
  return { season: year, drivers, constructors };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Baking standings ${START}–${END} -> ${OUT_DIR}`);

  for (let year = START; year <= END; year++) {
    const file = path.join(OUT_DIR, `${year}.json`);
    const isCurrent = year >= currentYear;
    if (existsSync(file) && !isCurrent && !FORCE_REFRESH) {
      console.log(`${year}  skip (already baked)`);
      continue;
    }
    try {
      const season = await buildSeason(year);
      if (season.drivers.length === 0 && isCurrent) {
        console.log(`${year}  no standings yet — skipping write`);
        continue;
      }
      await writeFile(file, JSON.stringify(season));
      console.log(`${year}  ${season.drivers.length} drivers, ${season.constructors.length} constructors`);
    } catch (err) {
      console.error(`${year}  FAILED: ${err.message}`);
      console.error("Progress is saved per-season. Re-run later to resume.");
      break;
    }
    await sleep(DELAY_MS);
  }
  console.log("Done.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();

export { pagedStandings, normDriver, normConstructor };
