#!/usr/bin/env node
/**
 * derive-standings.mjs — builds the Seasons entity.
 *
 * WDC table per year is reconstructed from each driver's career[].wdcFinish
 * (the SAME source the driver pages render, so the two can never disagree).
 * WCC table per year comes from f1db-seasons-constructor-standings.json.
 *
 * Reads:
 *   ./data/drivers/index.json                         (driver list)
 *   ./data/drivers/<id>.json                           (career[] -> WDC rows + constructor names)
 *   ./data/f1db/f1db-seasons-constructor-standings.json (WCC rows, championshipWon flag)
 *   ./data/standings/notes.source.json   (OPTIONAL, hand-maintained: { "2001": "markdown" })
 * Writes:
 *   ./data/standings/<year>.json   (full WDC + WCC tables + champions + notes)
 *   ./data/standings/index.json    (one row per season for the sortable index)
 *
 * Notes:
 *   - WCC began in 1958. Seasons 1950–1957 emit wcc:null / wccChampion:null;
 *     the page shows a blurb explaining the absence.
 *   - WDC table lists championship-CLASSIFIED drivers (wdcFinish != null),
 *     ordered by finishing position. Unclassified/0-point entries are omitted.
 *   - Season notes live in the hand-maintained source file so they survive
 *     re-derivation; backfill them over time.
 *
 *   node derive-standings.mjs
 */
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DRIVERS_DIR  = path.resolve("./data/drivers");
const OUT_DIR      = path.resolve("./data/standings");
const WCC_FILE     = path.resolve("./data/f1db/f1db-seasons-constructor-standings.json");
const NOTES_FILE   = path.resolve("./data/standings/notes.source.json");
const WCC_FIRST_YEAR = 1958;

const F1DB_DIR     = path.resolve("./data/f1db");
const RACES_FILE   = path.join(F1DB_DIR, "f1db-races.json");
const GPS_FILE     = path.join(F1DB_DIR, "f1db-grands-prix.json");
const RESULTS_FILE = path.join(F1DB_DIR, "f1db-races-race-results.json");
const F1DB_DRIVERS = path.join(F1DB_DIR, "f1db-drivers.json");

const writeJSON = (fp, obj) => writeFile(fp, JSON.stringify(obj, null, 2) + "\n");

async function loadJSON(fp, label, optional = false) {
  if (!existsSync(fp)) {
    if (optional) return null;
    console.error(`\nMissing required input: ${fp} (${label})\n`);
    process.exit(1);
  }
  return JSON.parse(await readFile(fp, "utf8"));
}

// Fail loud if an input's shape isn't what we expect, rather than emit garbage.
function assertFields(sample, fields, label) {
  const missing = fields.filter((f) => !(f in sample));
  if (missing.length) {
    console.error(`\n${label}: expected field(s) missing: ${missing.join(", ")}`);
    console.error(`Got keys: ${Object.keys(sample).join(", ")}\n`);
    process.exit(1);
  }
}

async function main() {
  const index = await loadJSON(path.join(DRIVERS_DIR, "index.json"), "drivers index");
  const drivers = index.drivers ?? index;
  const wccRows = await loadJSON(WCC_FILE, "constructor standings");
  const notes   = (await loadJSON(NOTES_FILE, "season notes", true)) ?? {};

  assertFields(drivers[0], ["driverId", "name", "code"], "drivers index");
  assertFields(wccRows[0], ["year", "constructorId", "points", "championshipWon"], "constructor standings");

  // year -> { wdc:[], wcc:[] }
  const seasons = new Map();
  const ensure = (y) => seasons.get(y) ?? seasons.set(y, { wdc: [], wcc: [] }).get(y);
  const constructorName = new Map();   // constructorId -> display name, harvested from driver careers

  // ---- WDC: transpose driver careers into per-year tables ----
  for (const d of drivers) {
    const rec = await loadJSON(path.join(DRIVERS_DIR, `${d.driverId}.json`), `driver ${d.driverId}`);
    for (const s of rec.career ?? []) {
      for (const t of s.teams ?? []) if (t.constructorId && t.constructor) constructorName.set(t.constructorId, t.constructor);
      if (s.wdcFinish == null) continue;   // unclassified — not in the championship table
      ensure(s.season).wdc.push({
        position: s.wdcFinish,
        driverId: d.driverId,
        name: d.name,
        code: d.code,
        points: s.wdcPoints ?? 0,
        teamId: s.primaryTeamId ?? null,
        team: s.primaryTeam ?? null,
      });
    }
  }

  // ---- WCC: group the standings file by year ----
  for (const r of wccRows) {
    ensure(r.year).wcc.push({
      position: r.positionNumber ?? null,
      constructorId: r.constructorId,
      name: constructorName.get(r.constructorId) ?? r.constructorId,
      points: r.points ?? 0,
      championshipWon: r.championshipWon === true,
    });
  }

  // ---- Races: per-season round list, linking to /grands-prix/<grandPrixId> ----
  // Reuses the exact grandPrixId keying that derive-gps.mjs uses for GP pages,
  // so the links match the GP routes by construction.
  const racesArr   = await loadJSON(RACES_FILE, "races");
  const gpsArr     = await loadJSON(GPS_FILE, "grands prix");
  const resultsArr = await loadJSON(RESULTS_FILE, "race results");
  const f1dbDrvArr = await loadJSON(F1DB_DRIVERS, "f1db drivers");
  assertFields(racesArr[0], ["id", "year", "round", "grandPrixId"], "races");
  assertFields(gpsArr[0], ["id"], "grands prix");

  const gpName     = new Map(gpsArr.map((g) => [g.id, g.shortName ?? g.fullName ?? g.id]));
  const f1dbName   = new Map(f1dbDrvArr.map((d) => [d.id, d.name]));
  const winnerByRace = new Map();
  for (const r of resultsArr) {
    if (r.positionNumber === 1 && !winnerByRace.has(r.raceId)) winnerByRace.set(r.raceId, r);
  }

  const racesByYear = new Map();
  for (const race of racesArr) {
    if (!racesByYear.has(race.year)) racesByYear.set(race.year, []);
    const w = winnerByRace.get(race.id);
    racesByYear.get(race.year).push({
      round: race.round,
      grandPrixId: race.grandPrixId,
      name: gpName.get(race.grandPrixId) ?? race.grandPrixId,
      winnerId: w?.driverId ?? null,
      winner: w ? (f1dbName.get(w.driverId) ?? w.driverId) : null,
    });
  }
  for (const list of racesByYear.values()) list.sort((a, b) => (a.round ?? 0) - (b.round ?? 0));

  await mkdir(OUT_DIR, { recursive: true });
  const now = new Date().toISOString().slice(0, 10);
  const indexRows = [];

  for (const [year, { wdc, wcc }] of [...seasons.entries()].sort((a, b) => a[0] - b[0])) {
    wdc.sort((a, b) => a.position - b.position);
    wcc.sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

    const hasWCC = year >= WCC_FIRST_YEAR;
    const wdcChampion = wdc.find((r) => r.position === 1) ?? null;
    const wccChampion = hasWCC ? (wcc.find((r) => r.championshipWon) ?? null) : null;

    await writeJSON(path.join(OUT_DIR, `${year}.json`), {
      year,
      wccExists: hasWCC,
      wdcChampion: wdcChampion && { driverId: wdcChampion.driverId, name: wdcChampion.name, code: wdcChampion.code },
      wccChampion: wccChampion && { constructorId: wccChampion.constructorId, name: wccChampion.name },
      wdc,
      wcc: hasWCC ? wcc : null,
      races: racesByYear.get(year) ?? [],
      notes: notes[String(year)] ?? null,
      updated: now,
    });

    indexRows.push({
      year,
      wdcChampion: wdcChampion && { driverId: wdcChampion.driverId, name: wdcChampion.name, code: wdcChampion.code },
      wccChampion: wccChampion && { constructorId: wccChampion.constructorId, name: wccChampion.name },
      driverCount: wdc.length,
      hasNotes: notes[String(year)] != null,
    });
  }

  indexRows.sort((a, b) => b.year - a.year);   // newest first (default index sort)
  await writeJSON(path.join(OUT_DIR, "index.json"), { count: indexRows.length, updated: now, seasons: indexRows });

  const withWcc = indexRows.filter((r) => r.wccChampion).length;
  console.log(`Derived ${indexRows.length} seasons -> ${OUT_DIR}`);
  console.log(`  ${indexRows.length - withWcc} pre-1958 seasons with no WCC, ${withWcc} with both championships`);
  console.log(`  season notes present for ${indexRows.filter((r) => r.hasNotes).length} season(s)`);
}
main();
