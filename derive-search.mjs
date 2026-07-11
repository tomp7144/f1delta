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

const out = JSON.stringify(entries);
fs.writeFileSync(path.join(root, "public/search-index.json"), out);
console.log(`search-index.json: ${entries.length} entries, ${Math.round(out.length / 1024)}KB raw`);
