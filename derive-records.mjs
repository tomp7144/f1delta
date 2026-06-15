#!/usr/bin/env node
/**
 * derive-records.mjs — turns the committed F1DB dump into all-time record boards.
 *
 * Reads:  ./data/f1db/*.json   (F1DB "json-splitted" release, committed to the repo)
 * Writes: ./data/records/{entity}/{slug}.json   (one leaderboard per board)
 *         ./data/records/index.json              (the records-hub manifest)
 *
 * No network. Pure computation. Re-run whenever you pull a newer F1DB release
 * (and it can share the same Actions step as derive-f1.mjs):
 *   node derive-records.mjs
 *
 * Design (curated matrix, NOT a blind cross-product — nonsense combos are never
 * emitted, so no thin pages dilute the funnel):
 *   - career boards ............ F1DB precomputed lifetime totals (drivers + teams)
 *   - single-season boards ..... F1DB precomputed per-season totals (drivers + teams)
 *   - per-Grand-Prix boards ..... computed here from race results (drivers, v1)
 *   - per-circuit boards ........ computed here from race results (drivers, v1)
 *   - rate boards (%) ........... precomputed totals + a couple of pass counters
 *   - streak boards ............. one date-ordered walk per driver
 *
 * Counting note: career & single-season figures are F1DB's own (already correct
 * for the team-vs-car subtleties — e.g. a 1–2 is one team win, not two). The
 * per-GP / per-circuit pass here counts a DRIVER's classified results, which is
 * why constructor GP/circuit boards are deferred to v2 (they need race-level
 * de-duplication; flagged below).
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const F1DB_DIR = path.resolve("./data/f1db");
const OUT_DIR  = path.resolve("./data/records");

// F1DB "json-splitted" filenames. If `ls data/f1db` shows different names,
// fix them here (one place). These match the F1DB v2026.x splitted release.
const FILES = {
  drivers:             "f1db-drivers.json",
  constructors:        "f1db-constructors.json",
  seasonsDrivers:      "f1db-seasons-drivers.json",
  seasonsConstructors: "f1db-seasons-constructors.json",
  races:               "f1db-races.json",
  raceResults:         "f1db-races-race-results.json",
  grandsPrix:          "f1db-grands-prix.json",
  circuits:            "f1db-circuits.json",
  countries:           "f1db-countries.json",
};

// Tunables (one place).
const TOP_N        = 100; // length of a count leaderboard
const TOP_N_RATE   = 50;  // length of a rate / streak leaderboard
const MIN_ENTRIES  = 40;  // a driver needs this many race entries to chart on a rate board

const round1 = (n) => Math.round((n + Number.EPSILON) * 10) / 10;
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const get = (map, key, make) => { if (!map.has(key)) map.set(key, make()); return map.get(key); };
const inc = (map, a, b, n = 1) => { const m = get(map, a, () => new Map()); m.set(b, (m.get(b) ?? 0) + n); };

// --- F1DB classification semantics (same rules as derive-f1.mjs) ---
const isClassified = (r) => r.positionNumber != null;
const isDNF        = (r) => r.positionNumber == null && r.reasonRetired != null;

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

/* ----------------------------------------------------------------------------
 * Curated stat matrix. `field` is the precomputed total — identical key on both
 * the lifetime object (Driver/Constructor) and the per-season object
 * (SeasonDriver/SeasonConstructor), which is why career + single-season share it.
 * `scoped` is the per-result predicate key used for per-GP / per-circuit boards
 * (null = not a per-venue board). `entities` controls who gets the board.
 * ------------------------------------------------------------------------- */
const STATS = [
  { slug: "wins",             label: "Wins",            field: "totalRaceWins",        entities: ["drivers", "constructors"], season: true,  scoped: "win"  },
  { slug: "pole-positions",   label: "Pole Positions",  field: "totalPolePositions",   entities: ["drivers", "constructors"], season: true,  scoped: "pole" },
  { slug: "podiums",          label: "Podiums",         field: "totalPodiums",         entities: ["drivers", "constructors"], season: true,  scoped: "pod"  },
  { slug: "fastest-laps",     label: "Fastest Laps",    field: "totalFastestLaps",     entities: ["drivers", "constructors"], season: true,  scoped: "fl"   },
  { slug: "points",           label: "Points",          field: "totalPoints",          entities: ["drivers", "constructors"], season: true,  scoped: null   },
  { slug: "race-starts",      label: "Race Starts",     field: "totalRaceStarts",      entities: ["drivers", "constructors"], season: false, scoped: null   },
  { slug: "race-entries",     label: "Race Entries",    field: "totalRaceEntries",     entities: ["drivers", "constructors"], season: false, scoped: null   },
  { slug: "championships",    label: "Championships",   field: "totalChampionshipWins",entities: ["drivers", "constructors"], season: false, scoped: null   },
  { slug: "laps-raced",       label: "Laps Raced",      field: "totalRaceLaps",        entities: ["drivers", "constructors"], season: false, scoped: null   },
  { slug: "sprint-wins",      label: "Sprint Wins",     field: "totalSprintRaceWins",  entities: ["drivers", "constructors"], season: false, scoped: null   },
  { slug: "driver-of-the-day",label: "Driver of the Day",field:"totalDriverOfTheDay",  entities: ["drivers"],                 season: true,  scoped: null   },
  { slug: "grand-slams",      label: "Grand Slams",     field: "totalGrandSlams",      entities: ["drivers"],                 season: false, scoped: null   },
  { slug: "one-two-finishes", label: "1–2 Finishes",    field: "total1And2Finishes",   entities: ["constructors"],            season: true,  scoped: null   },
];

// Rate boards (drivers). `den` is the denominator field; `numPass` pulls the
// numerator from a pass counter instead of a precomputed total.
const RATES = [
  { slug: "win-rate",           label: "Win %",           num: "totalRaceWins",      den: "totalRaceEntries" },
  { slug: "pole-rate",          label: "Pole %",          num: "totalPolePositions", den: "totalRaceEntries" },
  { slug: "podium-rate",        label: "Podium %",        num: "totalPodiums",       den: "totalRaceEntries" },
  { slug: "points-finish-rate", label: "Points Finish %", numPass: "pointsFin",      den: "totalRaceEntries" },
  { slug: "dnf-rate",           label: "DNF %",           numPass: "dnf",            den: "totalRaceStarts"  },
];

// Streak boards (drivers). `key` is the per-race boolean walked in date order.
const STREAKS = [
  { slug: "consecutive-wins",             label: "Consecutive Wins",            key: "win"  },
  { slug: "consecutive-podiums",          label: "Consecutive Podiums",         key: "pod"  },
  { slug: "consecutive-points-finishes",  label: "Consecutive Points Finishes", key: "pts"  },
  { slug: "consecutive-pole-positions",   label: "Consecutive Pole Positions",  key: "pole" },
];

async function main() {
  const [drivers, constructors, seasonsDrv, seasonsCon, races, raceRes, gps, circuits, countries] =
    await Promise.all([
      loadJSON(FILES.drivers), loadJSON(FILES.constructors),
      loadJSON(FILES.seasonsDrivers), loadJSON(FILES.seasonsConstructors),
      loadJSON(FILES.races), loadJSON(FILES.raceResults),
      loadJSON(FILES.grandsPrix), loadJSON(FILES.circuits), loadJSON(FILES.countries),
    ]);

  // lookups
  const flagOf = new Map(countries.map((c) => [c.id, { id: c.id, code: c.alpha3Code, a2: c.alpha2Code }]));
  const gpName = new Map(gps.map((g) => [g.id, g.shortName || g.name]));
  const ccName = new Map(circuits.map((c) => [c.id, c.name]));
  const raceOf = new Map(races.map((r) => [r.id, { year: r.year, gpId: r.grandPrixId, circuitId: r.circuitId, date: r.date }]));

  // entity meta: id -> { id, name, nat } and the raw record (for precomputed fields)
  const driverMeta = new Map(drivers.map((d) => [d.id, { id: d.id, name: d.name, nat: flagOf.get(d.nationalityCountryId) ?? null, rec: d }]));
  const conMeta    = new Map(constructors.map((c) => [c.id, { id: c.id, name: c.name, nat: flagOf.get(c.countryId) ?? null, rec: c }]));
  const metaFor = (entity) => (entity === "drivers" ? driverMeta : conMeta);

  // ---- single pass over race results: per-GP/circuit tallies, rate counters, streak feed ----
  const gpT = { win: new Map(), pole: new Map(), pod: new Map(), fl: new Map() };
  const ccT = { win: new Map(), pole: new Map(), pod: new Map(), fl: new Map() };
  const pointsFin = new Map(); // driverId -> count of points-scoring races
  const dnf = new Map();       // driverId -> DNFs
  const driverRaces = new Map(); // driverId -> [{ date, win, pod, pts, pole }]

  for (const r of raceRes) {
    const rc = raceOf.get(r.raceId);
    if (!rc) continue;
    const d = r.driverId;
    const pos = r.positionNumber;
    const win = pos === 1, pod = pos != null && pos <= 3, pole = r.polePosition === true, fl = r.fastestLap === true;
    const pts = (r.points ?? 0) > 0;

    if (win)  { inc(gpT.win,  d, rc.gpId); inc(ccT.win,  d, rc.circuitId); }
    if (pole) { inc(gpT.pole, d, rc.gpId); inc(ccT.pole, d, rc.circuitId); }
    if (pod)  { inc(gpT.pod,  d, rc.gpId); inc(ccT.pod,  d, rc.circuitId); }
    if (fl)   { inc(gpT.fl,   d, rc.gpId); inc(ccT.fl,   d, rc.circuitId); }

    if (pts) pointsFin.set(d, (pointsFin.get(d) ?? 0) + 1);
    if (isDNF(r)) dnf.set(d, (dnf.get(d) ?? 0) + 1);

    get(driverRaces, d, () => []).push({ date: rc.date ?? "", win, pod, pts, pole });
  }

  // ---- board writer ----
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = [];

  async function writeBoard({ entity, slug, title, blurb, scope, valueCol, contextCol, methodology, rows }) {
    const ranked = rows
      .map((r, i) => ({ rank: i + 1, ...r }))
      .slice(0, scope === "rate" || scope === "streak" ? TOP_N_RATE : TOP_N);
    const columns = [entity === "drivers" ? "Driver" : "Constructor", valueCol, ...(contextCol ? [contextCol] : [])];
    const file = {
      meta: { entity, slug, scope, title, blurb, methodology, updated: new Date().toISOString().slice(0, 10) },
      columns,
      rows: ranked,
    };
    await mkdir(path.join(OUT_DIR, entity), { recursive: true });
    await writeFile(path.join(OUT_DIR, entity, `${slug}.json`), JSON.stringify(file));
    manifest.push({ entity, scope, slug, title, count: ranked.length });
  }

  const nameRow = (m, value, context) => ({ id: m.id, name: m.name, nat: m.nat, value, ...(context !== undefined ? { context } : {}) });
  const fmtPts = (n) => round1(n);

  // ---- 1. career boards (precomputed lifetime totals) ----
  for (const s of STATS) {
    for (const entity of s.entities) {
      const meta = [...metaFor(entity).values()];
      const rows = meta
        .map((m) => nameRow(m, s.field === "totalPoints" ? fmtPts(m.rec[s.field] ?? 0) : (m.rec[s.field] ?? 0)))
        .filter((r) => r.value > 0)
        .sort((a, b) => b.value - a.value);
      await writeBoard({
        entity, slug: s.slug, scope: "career",
        title: `Most ${s.label} — ${entity === "drivers" ? "Drivers" : "Constructors"} (All-Time)`,
        blurb: `All-time F1 ${entity} ranked by career ${s.label.toLowerCase()}.`,
        valueCol: s.label, methodology: "F1DB precomputed career totals (1950–present).",
        rows,
      });
    }
  }

  // ---- 2. single-season boards (precomputed per-season totals; max per entity) ----
  const seasonSrc = { drivers: seasonsDrv, constructors: seasonsCon };
  const seasonIdKey = { drivers: "driverId", constructors: "constructorId" };
  for (const s of STATS.filter((x) => x.season)) {
    for (const entity of s.entities) {
      const best = new Map(); // id -> { value, year }
      for (const row of seasonSrc[entity]) {
        const v = row[s.field] ?? 0;
        if (v <= 0) continue;
        const id = row[seasonIdKey[entity]];
        const cur = best.get(id);
        if (!cur || v > cur.value) best.set(id, { value: v, year: row.year });
      }
      const meta = metaFor(entity);
      const rows = [...best.entries()]
        .map(([id, b]) => { const m = meta.get(id); return m ? nameRow(m, s.field === "totalPoints" ? fmtPts(b.value) : b.value, String(b.year)) : null; })
        .filter(Boolean)
        .sort((a, b) => b.value - a.value);
      await writeBoard({
        entity, slug: `${s.slug}-by-season`, scope: "season",
        title: `Most ${s.label} in a Single Season — ${entity === "drivers" ? "Drivers" : "Constructors"}`,
        blurb: `Best single-season ${s.label.toLowerCase()} tally for each ${entity === "drivers" ? "driver" : "constructor"}.`,
        valueCol: s.label, contextCol: "Season",
        methodology: "F1DB precomputed per-season totals; each entity's best single season.",
        rows,
      });
    }
  }

  // ---- 3. per-Grand-Prix & per-circuit boards (drivers; computed above) ----
  const venueBoards = [
    { tally: gpT, scope: "grand-prix", nameMap: gpName, ctxCol: "Grand Prix", suffix: "by-grand-prix", noun: "a single Grand Prix" },
    { tally: ccT, scope: "circuit",   nameMap: ccName, ctxCol: "Circuit",     suffix: "by-circuit",     noun: "a single circuit" },
  ];
  for (const vb of venueBoards) {
    for (const s of STATS.filter((x) => x.scoped && x.entities.includes("drivers"))) {
      const t = vb.tally[s.scoped];
      const rows = [];
      for (const [driverId, byVenue] of t) {
        const m = driverMeta.get(driverId);
        if (!m) continue;
        let bestVenue = null, bestVal = 0;
        for (const [venueId, n] of byVenue) if (n > bestVal) { bestVal = n; bestVenue = venueId; }
        rows.push(nameRow(m, bestVal, vb.nameMap.get(bestVenue) ?? bestVenue));
      }
      rows.sort((a, b) => b.value - a.value);
      await writeBoard({
        entity: "drivers", slug: `${s.slug}-${vb.suffix}`, scope: vb.scope,
        title: `Most ${s.label} at ${vb.noun} — Drivers`,
        blurb: `Drivers ranked by the most ${s.label.toLowerCase()} at ${vb.noun}.`,
        valueCol: s.label, contextCol: vb.ctxCol,
        methodology: "Counts classified race results per driver. Constructor venue boards: v2 (need race-level de-duplication).",
        rows,
      });
    }
  }

  // ---- 4. rate boards (drivers; min-entries qualifier) ----
  for (const rt of RATES) {
    const rows = [];
    for (const m of driverMeta.values()) {
      const den = m.rec[rt.den] ?? 0;
      if (den < MIN_ENTRIES) continue;
      const num = rt.numPass ? ((rt.numPass === "pointsFin" ? pointsFin : dnf).get(m.id) ?? 0) : (m.rec[rt.num] ?? 0);
      const pct = round2((num / den) * 100);
      if (pct <= 0) continue;
      rows.push(nameRow(m, pct, `${num}/${den}`));
    }
    rows.sort((a, b) => b.value - a.value);
    await writeBoard({
      entity: "drivers", slug: rt.slug, scope: "rate",
      title: `${rt.label} Leaders — Drivers (min. ${MIN_ENTRIES} entries)`,
      blurb: `Drivers ranked by ${rt.label}, minimum ${MIN_ENTRIES} race entries to qualify.`,
      valueCol: rt.label, contextCol: "Raw",
      methodology: `Percentage from F1DB totals. Minimum ${MIN_ENTRIES} entries to chart.`,
      rows,
    });
  }

  // ---- 5. streak boards (drivers; one date-ordered walk each) ----
  for (const st of STREAKS) {
    const rows = [];
    for (const [driverId, list] of driverRaces) {
      const m = driverMeta.get(driverId);
      if (!m) continue;
      list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      let cur = 0, best = 0;
      for (const r of list) { if (r[st.key]) { cur++; if (cur > best) best = cur; } else cur = 0; }
      if (best > 1) rows.push(nameRow(m, best));
    }
    rows.sort((a, b) => b.value - a.value);
    await writeBoard({
      entity: "drivers", slug: st.slug, scope: "streak",
      title: `Longest ${st.label} Streak — Drivers`,
      blurb: `Drivers ranked by their longest run of ${st.label.toLowerCase().replace("consecutive ", "")} in consecutive races.`,
      valueCol: "Streak",
      methodology: "Consecutive race-by-race streak in chronological order; any race breaking the run resets it.",
      rows,
    });
  }

  // ---- manifest for the records hub ----
  await writeFile(
    path.join(OUT_DIR, "index.json"),
    JSON.stringify({ count: manifest.length, boards: manifest, updated: new Date().toISOString() })
  );

  console.log(`Derived ${manifest.length} record boards from F1DB -> ${OUT_DIR}`);
}

main();
