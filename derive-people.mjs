#!/usr/bin/env node
/**
 * derive-people.mjs — builds personnel data from the unified source file.
 * Generalized from derive-engineers.mjs: one person, many roles.
 *
 * Reads:  ./data/people/people.source.json        (hand-maintained)
 *         ./data/drivers/index.json               (driverId + person-id<->driver validation)
 *         ./data/teams/index.json                 (teamId validation)
 *         ./data/f1db/f1db-races-race-results.json (race-engineer stats)
 *         ./data/f1db/f1db-seasons-drivers.json   (WDC titles)
 * Writes: ./data/people/<id>.json                 (per-person, all roles)
 *         ./data/people/index.json                (everyone)
 *         ./data/people/engineers.json            (view: has a race-engineer role)
 *         ./data/people/principals.json           (view: has a team-principal role)
 *         ./data/people/technical-directors.json  (view: has a technical-director role)
 *         ./data/people/by-driver.json            (driverId -> race engineers)
 *         ./data/people/by-team.json              (teamId -> all roles, typed)
 *
 * No network. Output is pretty-printed for readable diffs.
 *   node derive-people.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC_FILE      = path.resolve("./data/people/people.source.json");
const OUT_DIR       = path.resolve("./data/people");
const F1DB_DIR      = path.resolve("./data/f1db");
const DRIVERS_INDEX = path.resolve("./data/drivers/index.json");
const TEAMS_INDEX   = path.resolve("./data/teams/index.json");

const CURRENT_SEASON   = 2026;
const LAST_FULL_SEASON = CURRENT_SEASON - 1;
const HYBRID_ROLE_KEYWORDS = ["hybrid", "performance engineer", "coaching", "coach", "head of"];

// Which role types get a driver-keyed stat join. Add to this set when a new
// driver-facing role type is introduced; other types render timeline-only.
const DRIVER_KEYED = new Set(["race-engineer"]);

const writeJSON = (fp, obj) => writeFile(fp, JSON.stringify(obj, null, 2) + "\n");

async function loadJSON(fp, label) {
  if (!existsSync(fp)) {
    console.error(`\nMissing: ${fp} (${label})\n`);
    process.exit(1);
  }
  return JSON.parse(await readFile(fp, "utf8"));
}

async function main() {
  const [people, driversIndex, teamsIndex, raceResArr, seasonsDrvArr] = await Promise.all([
    loadJSON(SRC_FILE,      "people source"),
    loadJSON(DRIVERS_INDEX, "drivers index"),
    loadJSON(TEAMS_INDEX,   "teams index"),
    loadJSON(path.join(F1DB_DIR, "f1db-races-race-results.json"), "race results"),
    loadJSON(path.join(F1DB_DIR, "f1db-seasons-drivers.json"),    "seasons-drivers"),
  ]);

  const knownDrivers = new Set(driversIndex.drivers.map((d) => d.driverId));
  const knownTeams   = new Set(teamsIndex.teams.map((t) => t.id));
  const driverName   = new Map(driversIndex.drivers.map((d) => [d.driverId, d.name]));
  const teamName     = new Map(teamsIndex.teams.map((t) => [t.id, t.name]));

  // ---- validation ----
  const warnings = [];
  for (const person of people) {
    for (const r of person.roles) {
      if (!knownTeams.has(r.teamId))
        warnings.push(`  UNKNOWN teamId "${r.teamId}"  (person: "${person.id}")`);
      if (DRIVER_KEYED.has(r.type) && !knownDrivers.has(r.driverId))
        warnings.push(`  UNKNOWN driverId "${r.driverId}"  (person: "${person.id}")`);
      if (!DRIVER_KEYED.has(r.type) && r.driverId)
        warnings.push(`  ${r.type} role should not carry a driverId  (person: "${person.id}")`);
    }
    // person-id<->driver reconciliation: a record flagged RECONCILE must resolve
    // to a real F1DB driver slug, or the role->driver cross-link breaks.
    const flagged = person.roles.some((r) => (r.notes ?? "").includes("RECONCILE"));
    if (flagged && !knownDrivers.has(person.id))
      warnings.push(`  RECONCILE FAILED: "${person.id}" not found in F1DB drivers — fix the slug.`);
  }
  if (warnings.length) {
    console.warn("\n⚠️  VALIDATION WARNINGS — fix people.source.json before publishing:");
    for (const w of warnings) console.warn(w);
    console.warn(`\n  ${warnings.length} issue(s).\n`);
  }

  // ---- F1DB lookups ----
  const racesByDYT = new Map();
  for (const r of raceResArr) {
    const key = `${r.driverId}|${r.year}|${r.constructorId}`;
    (racesByDYT.get(key) ?? racesByDYT.set(key, []).get(key)).push(r);
  }
  const seasonsByDY = new Map();
  for (const s of seasonsDrvArr) seasonsByDY.set(`${s.driverId}|${s.year}`, s);

  function statsForRole(r) {
    const endYear = r.toYear ?? CURRENT_SEASON;
    let races = 0, wins = 0, podiums = 0, poles = 0, championships = 0;
    for (let yr = r.fromYear; yr <= endYear; yr++) {
      for (const res of racesByDYT.get(`${r.driverId}|${yr}|${r.teamId}`) ?? []) {
        races++;
        if (res.positionNumber === 1) wins++;
        if (res.positionNumber != null && res.positionNumber <= 3) podiums++;
        if (res.polePosition === true) poles++;
      }
      if (yr <= LAST_FULL_SEASON) {
        const s = seasonsByDY.get(`${r.driverId}|${yr}`);
        if (s && s.positionNumber === 1) championships++;
      }
    }
    const hybrid = HYBRID_ROLE_KEYWORDS.some((kw) => (r.notes ?? "").toLowerCase().includes(kw));
    return { races, wins, podiums, poles, championships,
      ...(hybrid ? { dataWarning: "Role may not have been exclusively race engineer — see notes." } : {}) };
  }

  await mkdir(OUT_DIR, { recursive: true });
  const now = new Date().toISOString().slice(0, 10);
  const byDriver = new Map();
  const byTeam   = new Map();
  const index    = [];
  const views    = { "race-engineer": [], "team-principal": [], "technical-director": [] };

  for (const person of people) {
    const roles = person.roles.map((r) => {
      const out = {
        type:     r.type,
        teamId:   r.teamId,
        teamName: teamName.get(r.teamId) ?? r.teamId,
        fromYear: r.fromYear,
        toYear:   r.toYear ?? null,
        ...(r.title ? { title: r.title } : {}),
        ...(r.confidence ? { confidence: r.confidence } : {}),
        ...(r.notes ? { notes: r.notes } : {}),
      };
      if (DRIVER_KEYED.has(r.type)) {
        out.driverId   = r.driverId;
        out.driverName = driverName.get(r.driverId) ?? r.driverId;
        out.stats      = statsForRole(r);   // TP/TD: no stats yet (Phase 2)
      }
      return out;
    });

    // Derived status — kills the stale-status bug class. Any open role => active.
    const hasOpen = (t) => roles.some((r) => r.toYear === null && (!t || r.type === t));
    const reRoles = roles.filter((r) => r.type === "race-engineer");
    const status  = hasOpen() ? "active" : "former";
    const engineerLabel = reRoles.length === 0 ? null : (hasOpen("race-engineer") ? "active" : "former");

    // Career totals are race-engineer-only for now (the only role with stats).
    const totals = {
      seasons:       reRoles.reduce((s, r) => s + ((r.toYear ?? CURRENT_SEASON) - r.fromYear + 1), 0),
      drivers:       new Set(reRoles.map((r) => r.driverId)).size,
      races:         reRoles.reduce((s, r) => s + r.stats.races, 0),
      wins:          reRoles.reduce((s, r) => s + r.stats.wins, 0),
      podiums:       reRoles.reduce((s, r) => s + r.stats.podiums, 0),
      poles:         reRoles.reduce((s, r) => s + r.stats.poles, 0),
      championships: reRoles.reduce((s, r) => s + r.stats.championships, 0),
    };

    const roleTypes = [...new Set(roles.map((r) => r.type))];
    const record = {
      id: person.id, name: person.name, aka: person.aka ?? null,
      status, engineerLabel, roleTypes,
      isDriverEntity: knownDrivers.has(person.id),  // enables person<->driver cross-link
      totals, roles, updated: now,
    };
    await writeJSON(path.join(OUT_DIR, `${person.id}.json`), record);

    const years = roles.flatMap((r) => [r.fromYear, r.toYear]).filter((y) => y != null);
    const summary = {
      id: person.id, name: person.name, aka: person.aka ?? null,
      status, roleTypes, firstYear: years.length ? Math.min(...years) : null, totals,
    };
    index.push(summary);
    for (const t of roleTypes) if (views[t]) views[t].push(summary);

    for (const r of roles) {
      if (r.type === "race-engineer") {
        if (!byDriver.has(r.driverId)) byDriver.set(r.driverId, { current: null, past: [] });
        const slot = byDriver.get(r.driverId);
        const ref = { personId: person.id, personName: person.name, aka: person.aka ?? null,
          teamId: r.teamId, teamName: r.teamName, fromYear: r.fromYear, toYear: r.toYear, notes: r.notes ?? null };
        if (r.toYear === null) slot.current = ref; else slot.past.push(ref);
      }
      if (!byTeam.has(r.teamId)) byTeam.set(r.teamId, []);
      byTeam.get(r.teamId).push({ personId: person.id, personName: person.name, type: r.type,
        driverId: r.driverId ?? null, fromYear: r.fromYear, toYear: r.toYear, notes: r.notes ?? null });
    }
  }

  const alpha = (a, b) => a.name.localeCompare(b.name);
  index.sort(alpha);
  await writeJSON(path.join(OUT_DIR, "index.json"), { count: index.length, updated: now, people: index });
  await writeJSON(path.join(OUT_DIR, "engineers.json"),           { count: views["race-engineer"].length,     people: views["race-engineer"].sort(alpha) });
  await writeJSON(path.join(OUT_DIR, "principals.json"),          { count: views["team-principal"].length,     people: views["team-principal"].sort(alpha) });
  await writeJSON(path.join(OUT_DIR, "technical-directors.json"), { count: views["technical-director"].length, people: views["technical-director"].sort(alpha) });
  await writeJSON(path.join(OUT_DIR, "by-driver.json"), Object.fromEntries(byDriver));
  for (const list of byTeam.values()) list.sort((a, b) => (b.fromYear ?? 0) - (a.fromYear ?? 0));
  await writeJSON(path.join(OUT_DIR, "by-team.json"), Object.fromEntries(byTeam));

  console.log(`Derived ${index.length} people -> ${OUT_DIR}`);
  console.log(`  views: ${views["race-engineer"].length} engineers, ${views["team-principal"].length} principals, ${views["technical-director"].length} technical-directors`);
  if (warnings.length) console.warn(`⚠️  ${warnings.length} validation warning(s) — see above.`);
}
main();
