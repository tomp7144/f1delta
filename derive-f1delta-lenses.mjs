#!/usr/bin/env node
// derive-f1delta-lenses.mjs
// Computes Peak f1δ, season ranks, seasonal wins/podiums, dominant stretch.
// Reads: data/f1delta/index.json + data/drivers/<id>.json (f1delta.seasons from Brief 25)
// Writes: data/drivers/<id>.json (adds lens fields to f1delta object, adds rank to each season)
//         data/f1delta/index.json   (adds peak/stretch/wins/podiums fields)
//         data/f1delta/peak.json    (sorted by peak f1δ desc)
//         data/f1delta/dominant.json (sorted by dominant stretch desc)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const rj = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const wj = (rel, obj) =>
  fs.writeFileSync(path.join(root, rel), JSON.stringify(obj), "utf8");

// ── Pass 1: load all driver season f1δ values ──────────────────────────────
const { drivers: idxDrivers } = rj("data/f1delta/index.json");
const driverData = new Map();     // driverId → full driver JSON
const driverSeasons = new Map();  // driverId → [{year, f1delta, pts, max}]

for (const idxD of idxDrivers) {
  const d = rj(`data/drivers/${idxD.driverId}.json`);
  if (!d.f1delta?.seasons?.length) continue;
  driverData.set(idxD.driverId, d);
  driverSeasons.set(idxD.driverId, d.f1delta.seasons);
}

// ── Pass 2: season rankings across all drivers ─────────────────────────────
// yearMap: year → [{driverId, f1delta}]
const yearMap = new Map();
for (const [driverId, seasons] of driverSeasons) {
  for (const s of seasons) {
    if (!yearMap.has(s.year)) yearMap.set(s.year, []);
    yearMap.get(s.year).push({ driverId, f1delta: s.f1delta });
  }
}

// yearRanks: year → Map<driverId, rank (1-based, 1 = highest f1δ)>
const yearRanks = new Map();
for (const [year, list] of yearMap) {
  list.sort((a, b) => b.f1delta - a.f1delta);
  const rm = new Map();
  for (let i = 0; i < list.length; i++) rm.set(list[i].driverId, i + 1);
  yearRanks.set(year, rm);
}

// ── Pass 3: per-driver lens computation ────────────────────────────────────
const lensResults = [];

for (const [driverId, seasons] of driverSeasons) {
  const sorted = [...seasons].sort((a, b) => a.year - b.year);

  // Attach rank to each season
  const seasonsWithRank = sorted.map((s) => ({
    ...s,
    rank: yearRanks.get(s.year)?.get(driverId) ?? 999,
  }));

  // Peak f1δ
  let peak = 0, peakYear = null;
  for (const s of seasonsWithRank) {
    if (s.f1delta > peak) { peak = s.f1delta; peakYear = s.year; }
  }

  // Seasonal wins (rank 1) + podiums (rank ≤ 3)
  let seasonalWins = 0, seasonalPodiums = 0;
  for (const s of seasonsWithRank) {
    if (s.rank === 1) seasonalWins++;
    if (s.rank <= 3) seasonalPodiums++;
  }

  // Dominant stretch: longest consecutive calendar-year run with rank ≤ 3
  // (a not-raced year breaks the run)
  let maxStretch = 0, maxStart = null, maxEnd = null;
  let curStretch = 0, curStart = null, prevYear = null;

  for (const s of seasonsWithRank) {
    const consecutive = prevYear === null || s.year === prevYear + 1;
    const top3 = s.rank <= 3;

    if (top3 && consecutive) {
      curStretch++;
      if (curStart === null) curStart = s.year;
    } else {
      if (curStretch > maxStretch) {
        maxStretch = curStretch;
        maxStart = curStart;
        maxEnd = prevYear;
      }
      if (top3) {
        curStretch = 1;
        curStart = s.year;
      } else {
        curStretch = 0;
        curStart = null;
      }
    }
    prevYear = s.year;
  }
  // Flush final run
  if (curStretch > maxStretch) {
    maxStretch = curStretch;
    maxStart = curStart;
    maxEnd = prevYear;
  }

  lensResults.push({
    driverId,
    peak: +peak.toFixed(1),
    peakYear,
    seasonalWins,
    seasonalPodiums,
    dominantStretch: maxStretch,
    stretchStart: maxStart,
    stretchEnd: maxEnd,
    seasonsWithRank,
  });
}

// ── Pass 4: write updated driver JSONs ─────────────────────────────────────
for (const lr of lensResults) {
  const d = driverData.get(lr.driverId);
  if (!d) continue;
  d.f1delta = {
    career: d.f1delta.career,
    peak: lr.peak,
    peakYear: lr.peakYear,
    seasonalWins: lr.seasonalWins,
    seasonalPodiums: lr.seasonalPodiums,
    dominantStretch: lr.dominantStretch,
    stretchStart: lr.stretchStart,
    stretchEnd: lr.stretchEnd,
    seasons: lr.seasonsWithRank,
  };
  wj(`data/drivers/${lr.driverId}.json`, d);
}

// ── Pass 5: build updated index + peak.json + dominant.json ───────────────
const updatedDrivers = idxDrivers.map((d) => {
  const lr = lensResults.find((r) => r.driverId === d.driverId);
  if (!lr) return d;
  return {
    ...d,
    peak: lr.peak,
    peakYear: lr.peakYear,
    seasonalWins: lr.seasonalWins,
    seasonalPodiums: lr.seasonalPodiums,
    dominantStretch: lr.dominantStretch,
    stretchStart: lr.stretchStart,
    stretchEnd: lr.stretchEnd,
  };
});

wj("data/f1delta/index.json", { drivers: updatedDrivers });

const peakSorted = [...updatedDrivers]
  .filter((d) => d.peak != null)
  .sort((a, b) => (b.peak ?? 0) - (a.peak ?? 0));
wj("data/f1delta/peak.json", { drivers: peakSorted });

const dominantSorted = [...updatedDrivers]
  .filter((d) => (d.dominantStretch ?? 0) > 0)
  .sort((a, b) => {
    const ds = (b.dominantStretch ?? 0) - (a.dominantStretch ?? 0);
    if (ds !== 0) return ds;
    const ps = (b.seasonalPodiums ?? 0) - (a.seasonalPodiums ?? 0);
    if (ps !== 0) return ps;
    return (b.career ?? 0) - (a.career ?? 0);
  });
wj("data/f1delta/dominant.json", { drivers: dominantSorted });

// ── Sanity / console report ────────────────────────────────────────────────
const report = (id) => {
  const d = updatedDrivers.find((x) => x.driverId === id);
  if (!d) { console.log(`  ${id}: NOT FOUND`); return; }
  console.log(
    `  ${d.name}: career=${d.career.toFixed(1)}, peak=${d.peak} (${d.peakYear}),` +
    ` seasonalWins=${d.seasonalWins}, podiums=${d.seasonalPodiums},` +
    ` stretch=${d.dominantStretch} (${d.stretchStart}–${d.stretchEnd})`
  );
};

console.log("\nMarquee drivers:");
report("max_verstappen");
report("michael-schumacher");
report("lewis-hamilton");
report("juan-manuel-fangio");
report("ayrton-senna");
report("alain-prost");

console.log("\nTop 10 dominant stretch:");
dominantSorted.slice(0, 10).forEach((d, i) =>
  console.log(`  ${i + 1}. ${d.name}: ${d.dominantStretch} seasons (${d.stretchStart}–${d.stretchEnd}), podiums=${d.seasonalPodiums}`)
);

console.log("\nTop 10 peak f1δ:");
peakSorted.slice(0, 10).forEach((d, i) =>
  console.log(`  ${i + 1}. ${d.name}: ${d.peak} (${d.peakYear})`)
);

console.log(`\nWrote: data/f1delta/index.json, peak.json, dominant.json, + ${lensResults.length} driver JSONs`);
