#!/usr/bin/env node
/**
 * derive-engineers.mjs — builds engineer data from the hand-edited source file.
 *
 * Reads:  ./data/engineers/engineers.source.json  (hand-maintained)
 *         ./data/drivers/index.json               (for driverId validation)
 *         ./data/teams/index.json                 (for teamId validation)
 * Writes: ./data/engineers/<id>.json              (per-engineer full career)
 *         ./data/engineers/index.json             (hub list)
 *         ./data/engineers/by-driver.json         (reverse lookup: driverId -> engineers)
 *
 * No network. Re-run whenever engineers.source.json is edited:
 *   node derive-engineers.mjs
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC_FILE      = path.resolve("./data/engineers/engineers.source.json");
const OUT_DIR       = path.resolve("./data/engineers");
const DRIVERS_INDEX = path.resolve("./data/drivers/index.json");
const TEAMS_INDEX   = path.resolve("./data/teams/index.json");

async function loadJSON(fp, label) {
  if (!existsSync(fp)) {
    console.error(`\nMissing: ${fp} (${label})\n  -> Run derive-f1.mjs / derive-teams.mjs first.\n`);
    process.exit(1);
  }
  return JSON.parse(await readFile(fp, "utf8"));
}

async function main() {
  const [source, driversIndex, teamsIndex] = await Promise.all([
    loadJSON(SRC_FILE, "engineers source"),
    loadJSON(DRIVERS_INDEX, "drivers index"),
    loadJSON(TEAMS_INDEX, "teams index"),
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

  await mkdir(OUT_DIR, { recursive: true });

  const byDriver = new Map(); // driverId -> { current: null|{...}, past: [...] }
  const indexList = [];
  const now = new Date().toISOString().slice(0, 10);

  for (const eng of source) {
    const pairings = eng.pairings.map((p) => ({
      driverId:   p.driverId,
      driverName: driverName.get(p.driverId) ?? p.driverId,
      teamId:     p.teamId,
      teamName:   teamName.get(p.teamId) ?? p.teamId,
      fromYear:   p.fromYear,
      toYear:     p.toYear ?? null,
      notes:      p.notes ?? null,
    }));

    // Per-engineer file
    await writeFile(
      path.join(OUT_DIR, `${eng.id}.json`),
      JSON.stringify({
        id:       eng.id,
        name:     eng.name,
        aka:      eng.aka ?? null,
        status:   eng.status ?? "unknown",
        pairings,
        updated:  now,
      })
    );

    // Index entry — derive span and current pairing for quick display
    const years = pairings
      .flatMap((p) => [p.fromYear, p.toYear])
      .filter((y) => y != null);
    const firstYear     = years.length ? Math.min(...years) : null;
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
  }

  // Write hub index (alpha by name)
  indexList.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(
    path.join(OUT_DIR, "index.json"),
    JSON.stringify({ count: indexList.length, updated: new Date().toISOString(), engineers: indexList })
  );

  // Write by-driver reverse lookup
  const byDriverObj = Object.fromEntries(byDriver.entries());
  await writeFile(path.join(OUT_DIR, "by-driver.json"), JSON.stringify(byDriverObj));

  // Write by-team reverse lookup: teamId -> [{ engineerId, engineerName, engineerAka, driverId, driverName, fromYear, toYear, notes }]
  const byTeam = new Map();
  for (const eng of source) {
    for (const p of eng.pairings) {
      if (!byTeam.has(p.teamId)) byTeam.set(p.teamId, []);
      byTeam.get(p.teamId).push({
        engineerId:   eng.id,
        engineerName: eng.name,
        engineerAka:  eng.aka ?? null,
        driverId:     p.driverId,
        driverName:   driverName.get(p.driverId) ?? p.driverId,
        fromYear:     p.fromYear,
        toYear:       p.toYear ?? null,
        notes:        p.notes ?? null,
      });
    }
  }
  // Sort each team's list newest-first
  for (const list of byTeam.values()) list.sort((a, b) => (b.fromYear ?? 0) - (a.fromYear ?? 0));
  await writeFile(path.join(OUT_DIR, "by-team.json"), JSON.stringify(Object.fromEntries(byTeam.entries())));

  console.log(`Derived ${indexList.length} engineer file(s) -> ${OUT_DIR}`);
  if (warnings.length) console.warn(`⚠️  ${warnings.length} validation warning(s) — see above.`);
}

main();
