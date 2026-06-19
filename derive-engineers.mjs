#!/usr/bin/env node
/**
 * derive-engineers.mjs — builds engineer data from the hand-edited source file.
 *
 * Reads:  ./data/engineers/engineers.source.json  (hand-maintained)
 *         ./data/drivers/index.json               (for driverId validation)
 *         ./data/teams/index.json                 (for teamId validation)
 *         ./data/f1db/f1db-races-race-results.json (for per-pairing race stats)
 *         ./data/f1db/f1db-seasons-drivers.json   (for WDC titles per season)
 * Writes: ./data/engineers/<id>.json              (per-engineer full career)
 *         ./data/engineers/index.json             (hub list)
 *         ./data/engineers/by-driver.json         (reverse lookup: driverId -> engineers)
 *         ./data/engineers/by-team.json           (reverse lookup: teamId -> pairings)
 *
 * No network. Re-run whenever engineers.source.json is edited:
 *   node derive-engineers.mjs
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC_FILE      = path.resolve("./data/engineers/engineers.source.json");
const OUT_DIR       = path.resolve("./data/engineers");
const F1DB_DIR      = path.resolve("./data/f1db");
const DRIVERS_INDEX = path.resolve("./data/drivers/index.json");
const TEAMS_INDEX   = path.resolve("./data/teams/index.json");

// Treat toYear=null as running through this season.
// Only seasons strictly before CURRENT_SEASON are fully completed — the
// live season's positionNumber in seasons-drivers is a mid-year leader,
// not a confirmed title, so championship counting stops at CURRENT_SEASON-1.
const CURRENT_SEASON    = 2026;
const LAST_FULL_SEASON  = CURRENT_SEASON - 1;

// Keywords in notes that indicate the role was not a standard race engineer role.
// Warn rather than silently emit potentially-inflated numbers.
const HYBRID_ROLE_KEYWORDS = ["hybrid", "performance engineer", "coaching", "coach", "head of"];

async function loadJSON(fp, label) {
  if (!existsSync(fp)) {
    console.error(`\nMissing: ${fp} (${label})\n  -> Run derive-f1.mjs / derive-teams.mjs first.\n`);
    process.exit(1);
  }
  return JSON.parse(await readFile(fp, "utf8"));
}

async function main() {
  const [source, driversIndex, teamsIndex, raceResArr, seasonsDrvArr] = await Promise.all([
    loadJSON(SRC_FILE,      "engineers source"),
    loadJSON(DRIVERS_INDEX, "drivers index"),
    loadJSON(TEAMS_INDEX,   "teams index"),
    loadJSON(path.join(F1DB_DIR, "f1db-races-race-results.json"),  "race results"),
    loadJSON(path.join(F1DB_DIR, "f1db-seasons-drivers.json"),      "seasons-drivers"),
  ]);

  const knownDrivers = new Set(driversIndex.drivers.map((d) => d.driverId));
  const knownTeams   = new Set(teamsIndex.teams.map((t) => t.id));
  const driverName   = new Map(driversIndex.drivers.map((d) => [d.driverId, d.name]));
  const teamName     = new Map(teamsIndex.teams.map((t) => [t.id, t.name]));

  // Validate all ids in source before writing anything
  const warnings = [];
  for (const eng of source) {
    for (const p of eng.pairings) {
      if (!knownDrivers.has(p.driverId))
        warnings.push(`  UNKNOWN driverId "${p.driverId}"  (engineer: "${eng.id}")`);
      if (!knownTeams.has(p.teamId))
        warnings.push(`  UNKNOWN teamId "${p.teamId}"  (engineer: "${eng.id}")`);
    }
  }
  if (warnings.length) {
    console.warn("\n⚠️  VALIDATION WARNINGS — fix engineers.source.json before publishing:");
    for (const w of warnings) console.warn(w);
    console.warn(`\n  ${warnings.length} issue(s) found.\n`);
  }

  // ---- Build F1DB lookup indexes ----

  // racesByDriverYearTeam: `${driverId}|${year}|${constructorId}` → result rows[]
  const racesByDYT = new Map();
  for (const r of raceResArr) {
    const key = `${r.driverId}|${r.year}|${r.constructorId}`;
    if (!racesByDYT.has(key)) racesByDYT.set(key, []);
    racesByDYT.get(key).push(r);
  }

  // seasonsByDriverYear: `${driverId}|${year}` → season row (for WDC finish)
  const seasonsByDY = new Map();
  for (const s of seasonsDrvArr) {
    seasonsByDY.set(`${s.driverId}|${s.year}`, s);
  }

  // ---- Per-pairing stats ----
  function statsForPairing(p) {
    const endYear = p.toYear ?? CURRENT_SEASON;
    let races = 0, wins = 0, podiums = 0, poles = 0, championships = 0;

    for (let yr = p.fromYear; yr <= endYear; yr++) {
      // Race stats filtered by driver + team + year
      const results = racesByDYT.get(`${p.driverId}|${yr}|${p.teamId}`) ?? [];
      for (const r of results) {
        races++;
        if (r.positionNumber === 1) wins++;
        if (r.positionNumber != null && r.positionNumber <= 3) podiums++;
        if (r.polePosition === true) poles++;
      }
      // Championship: only count completed seasons — the current season's
      // positionNumber reflects mid-year standings, not a confirmed title.
      if (yr <= LAST_FULL_SEASON) {
        const season = seasonsByDY.get(`${p.driverId}|${yr}`);
        if (season && season.positionNumber === 1) championships++;
      }
    }

    // Warn if the noted role was not purely a race engineer
    const noteLower = (p.notes ?? "").toLowerCase();
    const hybridRole = HYBRID_ROLE_KEYWORDS.some((kw) => noteLower.includes(kw));

    return {
      races, wins, podiums, poles, championships,
      ...(hybridRole ? { dataWarning: "Role may not have been exclusively race engineer — see notes." } : {}),
    };
  }

  await mkdir(OUT_DIR, { recursive: true });

  const byDriver = new Map(); // driverId -> { current: null|{...}, past: [...] }
  const byTeam   = new Map(); // teamId -> [pairing objects]
  const indexList = [];
  const now = new Date().toISOString().slice(0, 10);

  for (const eng of source) {
    const pairings = eng.pairings.map((p) => {
      const stats = statsForPairing(p);
      return {
        driverId:   p.driverId,
        driverName: driverName.get(p.driverId) ?? p.driverId,
        teamId:     p.teamId,
        teamName:   teamName.get(p.teamId) ?? p.teamId,
        fromYear:   p.fromYear,
        toYear:     p.toYear ?? null,
        notes:      p.notes ?? null,
        stats,
      };
    });

    // Career totals across all pairings
    const distinctDrivers = new Set(pairings.map((p) => p.driverId)).size;
    const totalSeasons    = pairings.reduce((s, p) => s + ((p.toYear ?? CURRENT_SEASON) - p.fromYear + 1), 0);
    const totals = {
      seasons:       totalSeasons,
      drivers:       distinctDrivers,
      races:         pairings.reduce((s, p) => s + p.stats.races, 0),
      wins:          pairings.reduce((s, p) => s + p.stats.wins, 0),
      podiums:       pairings.reduce((s, p) => s + p.stats.podiums, 0),
      poles:         pairings.reduce((s, p) => s + p.stats.poles, 0),
      championships: pairings.reduce((s, p) => s + p.stats.championships, 0),
    };

    // Per-engineer file
    await writeFile(
      path.join(OUT_DIR, `${eng.id}.json`),
      JSON.stringify({
        id:       eng.id,
        name:     eng.name,
        aka:      eng.aka ?? null,
        status:   eng.status ?? "unknown",
        totals,
        pairings,
        updated:  now,
      })
    );

    // Index entry — derive span and current pairing for quick display
    const years = pairings
      .flatMap((p) => [p.fromYear, p.toYear])
      .filter((y) => y != null);
    const firstYear      = years.length ? Math.min(...years) : null;
    const currentPairing = pairings.find((p) => p.toYear === null) ?? null;

    indexList.push({
      id:                eng.id,
      name:              eng.name,
      aka:               eng.aka ?? null,
      status:            eng.status ?? "unknown",
      pairingsCount:     pairings.length,
      firstYear,
      currentDriverId:   currentPairing?.driverId ?? null,
      currentDriverName: currentPairing
        ? (driverName.get(currentPairing.driverId) ?? currentPairing.driverId)
        : null,
      currentTeamId:     currentPairing?.teamId ?? null,
      currentFromYear:   currentPairing?.fromYear ?? null,
      totals,
    });

    // Reverse-lookup: contribute to by-driver map
    for (const p of pairings) {
      if (!byDriver.has(p.driverId)) byDriver.set(p.driverId, { current: null, past: [] });
      const slot = byDriver.get(p.driverId);
      const ref = {
        engineerId:   eng.id,
        engineerName: eng.name,
        engineerAka:  eng.aka ?? null,
        teamId:       p.teamId,
        teamName:     p.teamName,
        fromYear:     p.fromYear,
        toYear:       p.toYear,
        notes:        p.notes,
      };
      if (p.toYear === null) {
        slot.current = ref;
      } else {
        slot.past.push(ref);
      }
    }

    // Reverse-lookup: contribute to by-team map
    for (const p of pairings) {
      if (!byTeam.has(p.teamId)) byTeam.set(p.teamId, []);
      byTeam.get(p.teamId).push({
        engineerId:   eng.id,
        engineerName: eng.name,
        engineerAka:  eng.aka ?? null,
        driverId:     p.driverId,
        driverName:   p.driverName,
        fromYear:     p.fromYear,
        toYear:       p.toYear,
        notes:        p.notes,
      });
    }
  }

  // Write hub index (alpha by name)
  indexList.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(
    path.join(OUT_DIR, "index.json"),
    JSON.stringify({ count: indexList.length, updated: new Date().toISOString(), engineers: indexList })
  );

  // Write by-driver reverse lookup
  await writeFile(
    path.join(OUT_DIR, "by-driver.json"),
    JSON.stringify(Object.fromEntries(byDriver.entries()))
  );

  // Write by-team reverse lookup (newest-first within each team)
  for (const list of byTeam.values()) list.sort((a, b) => (b.fromYear ?? 0) - (a.fromYear ?? 0));
  await writeFile(
    path.join(OUT_DIR, "by-team.json"),
    JSON.stringify(Object.fromEntries(byTeam.entries()))
  );

  console.log(`Derived ${indexList.length} engineer file(s) -> ${OUT_DIR}`);
  if (warnings.length) console.warn(`⚠️  ${warnings.length} validation warning(s) — see above.`);
}

main();
