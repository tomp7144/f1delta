#!/usr/bin/env node
/**
 * scripts/bake-salaries.mjs
 *
 * Maps salaries.source.json slugs → F1DB driver ids.
 * Writes public/salaries.json (keyed by F1DB driverId, verbatim strings).
 * Updates public/driver.html with:
 *   - window.F1_SALARIES inline script (for the React SalarySection component)
 *   - <noscript> salary index (for crawlers — all 22 drivers, plain text)
 *
 * Run once whenever salaries.source.json is updated:
 *   node scripts/bake-salaries.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(".");

async function rj(file) {
  return JSON.parse(await readFile(path.resolve(ROOT, file), "utf8"));
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function main() {
  const [source, f1dbDrivers, f1dbRaces, f1dbResults] = await Promise.all([
    rj("salaries.source.json"),
    rj("data/f1db/f1db-drivers.json"),
    rj("data/f1db/f1db-races.json"),
    rj("data/f1db/f1db-races-race-results.json"),
  ]);

  const OVERRIDES = {
    "carlos sainz":    "carlos-sainz-jr",
    "sergio perez":    "sergio-perez",
    "nico hulkenberg": "nico-hulkenberg",
    "kimi antonelli":  "kimi-antonelli",
    "alex albon":      "alexander-albon",
  };
  const nameMap = new Map();
  for (const d of f1dbDrivers) {
    const key = d.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    nameMap.set(key, d.id);
  }

  const races2026 = new Set(f1dbRaces.filter(r => r.year === 2026).map(r => r.id));
  const latestTeam = new Map();
  for (const r of f1dbResults) {
    if (!races2026.has(r.raceId)) continue;
    const prev = latestTeam.get(r.driverId);
    if (!prev || r.raceId > prev.raceId) latestTeam.set(r.driverId, r.constructorId);
  }

  const out = {};
  const nameForId = {};
  const unmatched = [];

  for (const s of source) {
    const normalized = s.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const f1dbId = OVERRIDES[normalized] ?? nameMap.get(normalized) ?? null;
    if (!f1dbId) {
      console.warn(`UNMATCHED: ${s.slug} ("${s.name}") — no salary block will render`);
      unmatched.push(s.slug);
      continue;
    }
    console.log(`✓ ${s.slug} → ${f1dbId}`);
    out[f1dbId] = {
      salary:  s.estSalary,
      through: String(s.contractThrough),
      split:   s.baseBonus,
      source:  s.source,
    };
    nameForId[f1dbId] = s.name;
  }

  if (unmatched.length) {
    console.warn(`\n${unmatched.length} unmatched slug(s): ${unmatched.join(", ")}`);
  } else {
    console.log(`\nAll ${source.length} slugs matched.`);
  }

  // ── Write public/salaries.json ──────────────────────────────────────────────
  const salPath = path.resolve(ROOT, "public/salaries.json");
  await writeFile(salPath, JSON.stringify(out, null, 2));
  console.log(`Written: ${salPath} (${Object.keys(out).length} entries)`);

  // ── Build injection blocks ──────────────────────────────────────────────────
  const jsBlob = `<script>window.F1_SALARIES=${JSON.stringify(out)};</script>`;

  const noscriptItems = Object.entries(out).map(([id, s]) => {
    const name = nameForId[id] || id;
    const splitText = s.split === "UNKNOWN"
      ? "base/bonus not reported"
      : `Base/bonus: ${esc(s.split)}`;
    return `  <li><strong>${esc(name)}</strong> — Est. ${esc(s.salary)} · Through ${esc(s.through)} · ${splitText}. Source: ${esc(s.source)}</li>`;
  }).join("\n");

  const noscriptBlock = `<noscript>
<section id="sal-noscript">
<h2>2026 F1 Driver Salary Estimates</h2>
<p><em>Estimated figures — not officially disclosed by teams or drivers.</em></p>
<ul>
${noscriptItems}
</ul>
</section>
</noscript>`;

  // ── Patch public/driver.html ────────────────────────────────────────────────
  const driverHtmlPath = path.resolve(ROOT, "public/driver.html");
  let html = await readFile(driverHtmlPath, "utf8");

  const START = "  <!-- 2026-grid salary estimates (verbatim strings, keyed by F1DB driver id) -->";
  const END   = "\n\n  <!-- paywall client helper";

  const si = html.indexOf(START);
  const ei = html.indexOf(END);
  if (si === -1 || ei === -1) {
    throw new Error("Could not find salary injection zone in public/driver.html — check markers");
  }

  const replacement = `${START}\n  ${jsBlob}\n  ${noscriptBlock}`;
  html = html.slice(0, si) + replacement + html.slice(ei);

  await writeFile(driverHtmlPath, html);
  console.log(`Updated: ${driverHtmlPath}`);
}

main().catch(err => {
  console.error("bake-salaries:", err.message);
  process.exit(1);
});
