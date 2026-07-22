#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const r = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

const entries = [];

// Drivers
for (const d of r("data/drivers/index.json").drivers) {
  entries.push({
    type: "driver", id: d.driverId, label: d.name,
    url: `/drivers/${d.driverId}`,
    code: d.code ?? null, fy: d.firstSeason, ly: d.lastSeason,
  });
}

// Teams
for (const t of r("data/teams/index.json").teams) {
  entries.push({
    type: "team", id: t.id, label: t.name,
    url: `/teams/${t.id}`,
    nat: t.nat?.code ?? null, natId: t.nat?.id ?? null,
    fy: t.first, ly: t.last,
  });
}

// People (index only — excludes driver-entities)
for (const p of r("data/people/index.json").people) {
  entries.push({
    type: "person", id: p.id, label: p.name,
    url: `/people/${p.id}`,
    roles: p.roleTypes ?? [],
  });
}

// Circuits
for (const c of r("data/circuits/index.json").circuits) {
  entries.push({
    type: "circuit", id: c.id, label: c.name,
    url: `/circuits/${c.id}`,
    country: c.country?.name ?? null,
    place: c.placeName ?? null,
  });
}

// Grands Prix
for (const g of r("data/grands-prix/index.json").grandsPrix) {
  entries.push({
    type: "gp", id: g.id, label: g.name,
    url: `/grands-prix/${g.id}`,
    short: g.shortName ?? null, country: g.country?.name ?? null,
  });
}

// Seasons (champion from standings index, which has wdcChampion per year)
for (const s of r("data/standings/index.json").seasons) {
  entries.push({
    type: "season", year: s.year, label: `${s.year} Season`,
    url: `/standings/${s.year}`,
    champion: s.wdcChampion?.name ?? null,
    ccode: s.wdcChampion?.code ?? null,
  });
}

// Races
for (const race of r("data/races/index.json").races) {
  entries.push({
    type: "race",
    label: `${race.year} ${race.gpName}`,
    url: `/races/${race.slug}`,
    year: race.year,
    country: race.gpCountry ?? null,
  });
}

// Records boards
const SCOPE_LABELS = {
  career: "All-Time", season: "Single Season",
  "grand-prix": "Grand Prix", circuit: "Circuit",
  rate: "Rate", streak: "Streak",
};
for (const b of r("data/records/index.json").boards) {
  const url = `/records/${b.entity}/${b.slug.replace("-by-", "/by-")}`;
  entries.push({
    type: "record", label: b.title, url,
    scope: SCOPE_LABELS[b.scope] ?? b.scope,
  });
}

// H2H pairings
{
  const { pairings } = r("data/h2h-pairings.json");
  const nameMap = new Map();
  for (const d of r("data/drivers/index.json").drivers) nameMap.set(d.driverId, d.name);
  for (const p of pairings) {
    const aName = nameMap.get(p.a) ?? p.a;
    const bName = nameMap.get(p.b) ?? p.b;
    const aSurname = aName.split(" ").at(-1);
    const bSurname = bName.split(" ").at(-1);
    entries.push({
      type: "h2h",
      label: `${aName} vs ${bName}`,
      url: `/h2h/${p.slug}`,
      terms: [aName, bName, aSurname, bSurname],
    });
  }
}

// Compare tool (one entry — pairs go to sitemap only)
entries.push({
  type: "tool",
  label: "Driver Comparison",
  url: "/compare",
  terms: ["compare", "comparison", "versus", "vs"],
});

// Static pages
entries.push({
  type: "tool",
  label: "Methodology — how F1 Delta calculates everything",
  url: "/methodology",
  terms: ["methodology", "how it works", "f1delta", "f1δ", "score", "formula", "calculation", "explained", "era", "fair", "dnf", "rates", "h2h", "head-to-head"],
});
entries.push({
  type: "tool",
  label: "About F1 Delta",
  url: "/about",
  terms: ["about", "tom", "payment", "author", "who"],
});
entries.push({
  type: "tool",
  label: "f1δ Score — Career Leaderboard",
  url: "/f1delta",
  terms: ["f1delta", "f1δ", "score", "leaderboard", "era", "fair", "ranking", "career"],
});
entries.push({
  type: "tool",
  label: "f1δ Score — Peak Season",
  url: "/f1delta/peak",
  terms: ["f1delta", "f1δ", "peak", "season", "best", "dominant", "single"],
});
entries.push({
  type: "tool",
  label: "f1δ Score — Dominant Stretch",
  url: "/f1delta/dominant",
  terms: ["f1delta", "f1δ", "dominant", "stretch", "streak", "consecutive", "podiums"],
});

const out = JSON.stringify(entries);
fs.writeFileSync(path.join(root, "public/search-index.json"), out);
console.log(`search-index.json: ${entries.length} entries, ${Math.round(out.length / 1024)}KB raw`);
