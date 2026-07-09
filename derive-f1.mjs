#!/usr/bin/env node
/**
 * derive-f1.mjs — turns the committed F1DB dump into per-driver pages.
 *
 * Reads:  ./data/f1db/*.json   (F1DB "json-splitted" release, committed to the repo)
 * Writes: ./data/drivers/{driverId}.json   (one per driver, for the driver page)
 *         ./data/drivers/index.json         (searchable list for the picker)
 *
 * No network. Pure computation. Re-run whenever you pull a newer F1DB release:
 *   node derive-f1.mjs
 *
 * What F1DB now hands us for free (these used to be computed by hand):
 *   - Lifetime totals (wins/podiums/poles/points/...) ....... f1db-drivers.json
 *   - Per-season totals + WDC finish per season ............. f1db-seasons-drivers.json
 *     (positionNumber = championship finish — closes the old dropped-scores gap)
 * What we STILL compute here (F1DB does not ship it):
 *   - Teammate head-to-head, per the locked rules below.
 *
 * H2H rules (locked, unchanged from the Jolpica version):
 *   - Quali H2H uses qualifying classification (not race grid); counts only races
 *     where BOTH teammates set a qualifying position.
 *   - Race H2H counts only races where BOTH were classified (a numeric finishing
 *     position). DNFs are EXCLUDED from race H2H and tallied separately.
 *   - Every pairing is computed regardless of shared-race count; the page decides
 *     what to show by default vs. behind "see all".
 *   - Each record: aggregate headline + per-season array (for the dropdown).
 *
 * Output JSON shape is IDENTICAL to the old derive (plus a few additive bonus
 * totals), so the driver-page frontend doesn't care which source fed it.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const F1DB_DIR = path.resolve("./data/f1db");
const OUT_DIR  = path.resolve("./data/drivers");

// F1DB "json-splitted" filenames. If `ls data/f1db` shows different names,
// fix them here (one place). These match the F1DB v2026.x splitted release.
const FILES = {
  drivers:         "f1db-drivers.json",
  seasonsDrivers:  "f1db-seasons-drivers.json",
  constructors:    "f1db-constructors.json",
  raceResults:     "f1db-races-race-results.json",
  qualiResults:    "f1db-races-qualifying-results.json",
  countries:       "f1db-countries.json",
  entrantsDrivers: "f1db-seasons-entrants-drivers.json",
};

const round1 = (n) => Math.round((n + Number.EPSILON) * 10) / 10;
const get = (map, key, make) => { if (!map.has(key)) map.set(key, make()); return map.get(key); };

// --- F1DB classification semantics (compiled release JSON) ---
// A driver is "classified" when F1DB gives them a numeric finishing position.
const isClassified = (r) => r.positionNumber != null;
// A "DNF" (for the separate tally) = retired AND not classified. This mirrors the
// old Ergast posText === "R" rule: a late retirement that was still classified
// counts as classified, not as a DNF.
const isDNF = (r) => r.positionNumber == null && r.reasonRetired != null;

async function loadJSON(name) {
  const fp = path.join(F1DB_DIR, name);
  if (!existsSync(fp)) {
    console.error(
      `\nMissing: ${fp}\n` +
      `  -> Unzip f1db-json-splitted.zip into data/f1db/ (files directly in that folder).\n` +
      `  -> Run \`ls data/f1db\` and confirm the names match the FILES map in this script.\n`
    );
    process.exit(1);
  }
  return JSON.parse(await readFile(fp, "utf8"));
}

function newSeasonH2H(year) {
  return {
    year, races: 0, excluded: 0,
    bothQualified: 0, qualiAhead: 0, qualiBehind: 0,
    raceAhead: 0, raceBehind: 0,
    dnfSelf: 0, dnfMate: 0,
    pointsSelf: 0, pointsMate: 0,
  };
}

async function main() {
  const [drvArr, seasonsDrv, constructors, raceRes, qualiRes, countriesArr, entrantsDrv] = await Promise.all([
    loadJSON(FILES.drivers),
    loadJSON(FILES.seasonsDrivers),
    loadJSON(FILES.constructors),
    loadJSON(FILES.raceResults),
    loadJSON(FILES.qualiResults),
    loadJSON(FILES.countries),
    loadJSON(FILES.entrantsDrivers),
  ]);

  // driverId -> meta + lifetime totals (precomputed by F1DB)
  const meta = new Map();
  for (const d of drvArr) {
    meta.set(d.id, {
      driverId: d.id, code: d.abbreviation, name: d.name,
      totals: {
        entries: d.totalRaceEntries ?? 0,
        races: d.totalRaceStarts ?? 0,
        wins: d.totalRaceWins ?? 0,
        podiums: d.totalPodiums ?? 0,
        poles: d.totalPolePositions ?? 0,
        points: round1(d.totalPoints ?? 0),
        // additive bonus stats F1DB ships for free (frontend can ignore these):
        championships: d.totalChampionshipWins ?? 0,
        fastestLaps: d.totalFastestLaps ?? 0,
        driverOfTheDay: d.totalDriverOfTheDay ?? 0,
        grandSlams: d.totalGrandSlams ?? 0,
      },
    });
  }

  // constructorId -> display name
  const teamName = new Map();
  for (const c of constructors) teamName.set(c.id, c.name);

  // countryId -> demonym (e.g. "united-kingdom" -> "British")
  const countryDemonym = new Map();
  for (const c of countriesArr) if (c.demonym) countryDemonym.set(c.id, c.demonym);

  // driverId -> entrant rows (for teams of test/reserve drivers + year ranges)
  const entrantsByDriver = new Map();
  for (const e of entrantsDrv) get(entrantsByDriver, e.driverId, () => []).push(e);

  // per-season career rows, read straight from F1DB: driverId -> Map(year -> row)
  const careerByDriver = new Map();
  for (const s of seasonsDrv) {
    const m = get(careerByDriver, s.driverId, () => new Map());
    m.set(s.year, {
      season: s.year,
      entries: s.totalRaceEntries ?? 0,
      races: s.totalRaceStarts ?? 0,
      wins: s.totalRaceWins ?? 0,
      podiums: s.totalPodiums ?? 0,
      poles: s.totalPolePositions ?? 0,
      points: round1(s.totalPoints ?? 0),
      wdcFinish: s.positionNumber ?? null,   // championship finishing position (gap closed)
      wdcPoints: round1(s.totalPoints ?? 0), // championship points
      _teamRaces: new Map(),                 // constructorId -> races (filled from race-results)
    });
  }

  // quali positions for H2H: raceId -> Map(driverId -> qualifying positionNumber)
  const qualiByRace = new Map();
  for (const q of qualiRes) {
    if (q.positionNumber == null) continue;
    get(qualiByRace, q.raceId, () => new Map()).set(q.driverId, q.positionNumber);
  }

  // bucket race results by race and by driver; tally per-season team participation
  const resultsByRace = new Map();   // raceId -> [rows]
  const resultsByDriver = new Map(); // driverId -> [rows] (used for never-started reason)
  for (const r of raceRes) {
    get(resultsByRace, r.raceId, () => []).push(r);
    get(resultsByDriver, r.driverId, () => []).push(r);
    const cs = careerByDriver.get(r.driverId)?.get(r.year);
    if (cs) cs._teamRaces.set(r.constructorId, (cs._teamRaces.get(r.constructorId) ?? 0) + 1);
  }

  // teammate H2H: driverId -> Map(mateId -> Map(year -> h2h))
  const h2h = new Map();

  for (const [raceId, rows] of resultsByRace) {
    const year = rows[0]?.year;
    const qPos = qualiByRace.get(raceId) ?? new Map();

    const byTeam = new Map();
    for (const r of rows) get(byTeam, r.constructorId, () => []).push(r);

    for (const group of byTeam.values()) {
      if (group.length < 2) continue; // need a teammate
      for (const self of group) {
        for (const mate of group) {
          if (self.driverId === mate.driverId) continue;
          const byMate = get(h2h, self.driverId, () => new Map());
          const seasons = get(byMate, mate.driverId, () => new Map());
          const s = get(seasons, year, () => newSeasonH2H(year));

          const selfFinished = self.positionNumber != null && self.reasonRetired == null;
          const mateFinished = mate.positionNumber != null && mate.reasonRetired == null;
          // shared-car entries give identical positionNumbers — not comparable
          const comparable = selfFinished && mateFinished
            && self.positionNumber !== mate.positionNumber;
          if (comparable) {
            s.races++;
            if (self.positionNumber < mate.positionNumber) s.raceAhead++;
            else if (self.positionNumber > mate.positionNumber) s.raceBehind++;
          } else {
            s.excluded++;
          }

          s.pointsSelf += self.points ?? 0;
          s.pointsMate += mate.points ?? 0;
          if (isDNF(self)) s.dnfSelf++;
          if (isDNF(mate)) s.dnfMate++;

          // quali H2H — both must have a qualifying position
          const qs = qPos.get(self.driverId), qm = qPos.get(mate.driverId);
          if (qs != null && qm != null) {
            s.bothQualified++;
            if (qs < qm) s.qualiAhead++;
            else if (qs > qm) s.qualiBehind++;
          }
        }
      }
    }
  }

  // ---- assemble + write per-driver files ----
  await mkdir(OUT_DIR, { recursive: true });
  const index = [];

  for (const [driverId, seasonMap] of careerByDriver) {
    const info = meta.get(driverId)
      ?? { driverId, code: driverId.slice(0, 3).toUpperCase(), name: driverId, totals: {} };

    const career = [...seasonMap.values()]
      .filter((cs) => (cs.races ?? 0) > 0) // only seasons where the driver actually started a race
      .sort((a, b) => a.season - b.season)
      .map((cs) => {
        const teams = [...cs._teamRaces.entries()]
          .map(([constructorId, races]) => ({
            constructorId,
            constructor: teamName.get(constructorId) ?? constructorId,
            races,
          }))
          .sort((a, b) => b.races - a.races);
        const { _teamRaces, ...row } = cs;
        return {
          ...row,
          teams,
          primaryTeamId: teams[0]?.constructorId ?? null,
          primaryTeam: teams[0]?.constructor ?? null,
        };
      });

    // Skip entrants who never actually started a race (test/reserve-only).
    // Matches the old derive, which only knew drivers that appeared in race results.
    if (career.length === 0) continue;

    const teammates = [...(h2h.get(driverId)?.entries() ?? [])]
      .map(([mateId, seasonsMap]) => {
        const seasons = [...seasonsMap.values()].sort((a, b) => a.year - b.year);
        const agg = seasons.reduce((a, s) => {
          for (const k of ["races", "excluded", "bothQualified", "qualiAhead", "qualiBehind",
            "raceAhead", "raceBehind", "dnfSelf", "dnfMate",
            "pointsSelf", "pointsMate"]) a[k] += s[k];
          return a;
        }, newSeasonH2H(null));
        delete agg.year;
        agg.pointsSelf = round1(agg.pointsSelf);
        agg.pointsMate = round1(agg.pointsMate);
        return {
          teammateId: mateId,
          teammate: meta.get(mateId)?.name ?? mateId,
          seasonsShared: seasons.map((s) => s.year),
          aggregate: agg,
          seasons: seasons.map((s) => ({
            ...s,
            pointsSelf: round1(s.pointsSelf),
            pointsMate: round1(s.pointsMate),
          })),
        };
      })
      .sort((a, b) => b.aggregate.races - a.aggregate.races); // rivalries first

    const out = {
      driverId,
      code: info.code,
      name: info.name,
      firstSeason: career[0]?.season ?? null,
      lastSeason: career[career.length - 1]?.season ?? null,
      totals: info.totals,
      career,
      teammates,
    };
    await writeFile(path.join(OUT_DIR, `${driverId}.json`), JSON.stringify(out));

    index.push({
      driverId, code: info.code, name: info.name,
      firstSeason: out.firstSeason, lastSeason: out.lastSeason,
      races: info.totals.races ?? 0, wins: info.totals.wins ?? 0,
      podiums: info.totals.podiums ?? 0, poles: info.totals.poles ?? 0,
      championships: info.totals.championships ?? 0, points: info.totals.points ?? 0,
    });
  }

  index.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(
    path.join(OUT_DIR, "index.json"),
    JSON.stringify({ count: index.length, drivers: index, updated: new Date().toISOString() })
  );

  // ---- never-started.json ----
  // Drivers with totalRaceStarts === 0: test/reserve drivers and those who DNQ'd, DNS'd, etc.
  const neverStarted = [];
  for (const drv of drvArr) {
    if ((drv.totalRaceStarts ?? 0) > 0) continue;

    // year range from seasons-drivers (all 123 are present there)
    const yearMap = careerByDriver.get(drv.id);
    const years = yearMap ? [...yearMap.keys()].sort((a, b) => a - b) : [];
    const firstYear = years[0] ?? null;
    const lastYear = years[years.length - 1] ?? null;

    // teams from entrants file (covers test-only and race-entering drivers)
    const entrants = entrantsByDriver.get(drv.id) ?? [];
    const teamsSeen = new Map();
    for (const e of entrants) {
      if (!teamsSeen.has(e.constructorId))
        teamsSeen.set(e.constructorId, teamName.get(e.constructorId) ?? e.constructorId);
    }
    const teams = [...teamsSeen.values()];

    // reason from race results positionText
    const results = resultsByDriver.get(drv.id) ?? [];
    let reason;
    if (results.length === 0) {
      reason = "Reserve/Test";
    } else {
      const texts = new Set(results.map((r) => r.positionText));
      if (texts.has("DNPQ"))      reason = "DNPQ";
      else if (texts.has("DNQ"))  reason = "DNQ";
      else if (texts.has("DNS"))  reason = "DNS";
      else                        reason = [...texts][0] ?? "Unknown";
    }

    neverStarted.push({
      id: drv.id,
      name: drv.name,
      nat: countryDemonym.get(drv.nationalityCountryId) ?? drv.nationalityCountryId ?? null,
      firstYear,
      lastYear,
      entries: drv.totalRaceEntries ?? 0,
      bestGrid: drv.bestStartingGridPosition ?? null,
      teams,
      reason,
    });
  }
  neverStarted.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(
    path.join(OUT_DIR, "never-started.json"),
    JSON.stringify({ count: neverStarted.length, drivers: neverStarted })
  );

  console.log(`Derived ${index.length} drivers from F1DB -> ${OUT_DIR}`);
  console.log(`Never-started: ${neverStarted.length} drivers -> ${OUT_DIR}/never-started.json`);
}

main();
