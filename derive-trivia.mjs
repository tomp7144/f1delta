#!/usr/bin/env node
/**
 * derive-trivia.mjs
 * Builds public/trivia.json for the career team-chain trivia game.
 * Source: data/drivers/*.json (career[].teams[])
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const r = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

const idx = r("data/drivers/index.json").drivers;

/**
 * Build the ordered, deduped team chain from career[].teams[].
 * Rules:
 *   - Seasons are processed chronologically.
 *   - Primary team (most races) is added if different from the last chain entry.
 *   - Secondary teams (mid-season) are added only if the constructor has never
 *     appeared in the chain before (avoids creating false "returns" for the
 *     secondary slot of a split season where the driver was promoted away mid-year).
 *   - Genuine returns across seasons ARE kept (primary dedup is consecutive only).
 */
function buildChain(career) {
  const chain = []; // [{id, name}]
  const seen = new Set(); // all constructor IDs ever added

  for (const season of career) {
    const primary = season.teams?.[0];
    if (!primary) continue;

    // Add primary if different from last (consecutive dedup allows genuine returns)
    if (chain.length === 0 || chain[chain.length - 1].id !== primary.constructorId) {
      chain.push({ id: primary.constructorId, name: primary.constructor });
      seen.add(primary.constructorId);
    }

    // Secondary mid-season teams: only add if brand new to the chain
    for (let i = 1; i < (season.teams?.length ?? 0); i++) {
      const t = season.teams[i];
      if (!seen.has(t.constructorId)) {
        chain.push({ id: t.constructorId, name: t.constructor });
        seen.add(t.constructorId);
      }
    }
  }

  return chain;
}

const drivers = [];

for (const entry of idx) {
  const d = r(`data/drivers/${entry.driverId}.json`);
  const career = (d.career ?? []).filter((s) => s.races > 0);
  if (!career.length) continue;

  const chain = buildChain(career);
  if (chain.length < 2) continue; // single-team careers skipped for both tiers

  const wins = d.totals?.wins ?? 0;
  const races = entry.races ?? 0; // total career race starts (from index)
  const fy = career[0].season;
  const ly = career[career.length - 1].season;

  drivers.push({
    id: entry.driverId,
    name: entry.name,
    chain: chain.map((t) => t.name),
    chainIds: chain.map((t) => t.id),
    fy,
    ly,
    wins,
    races,
  });
}

// ── Spot-check report ──────────────────────────────────────────────────────────
const checks = [
  "max-verstappen",
  "lewis-hamilton",
  "fernando-alonso",
  "charles-leclerc",
  "giancarlo-fisichella",
];
console.log("\n── Chain spot-checks ──");
for (const id of checks) {
  const d = drivers.find((x) => x.id === id);
  if (d) console.log(`  ${d.name}: ${d.chain.join(" → ")}`);
  else console.log(`  ${id}: not found`);
}

// ── Tier counts ────────────────────────────────────────────────────────────────
const easy   = drivers.filter((d) => d.races >= 100);
const medium = drivers.filter((d) => d.wins >= 1);
console.log(`\n── Tiers ──`);
console.log(`  Easy   (100+ races): ${easy.length}`);
console.log(`  Medium (≥1 win):     ${medium.length}`);
console.log(`  Hard   (all):        ${drivers.length}`);

// ── Distractor sample: Verstappen ─────────────────────────────────────────────
const vmax = drivers.find((d) => d.id === "max-verstappen");
if (vmax) {
  const answerKey = vmax.chainIds.join(",");
  const pool = medium.filter((d) => d.id !== vmax.id && d.chainIds.join(",") !== answerKey);
  const scored = pool.map((d) => {
    const shared = d.chainIds.filter((id) => vmax.chainIds.includes(id)).length;
    const eraOverlap = Math.max(0, Math.min(d.ly, vmax.ly) - Math.max(d.fy, vmax.fy) + 1);
    const lenSim = Math.max(0, 5 - Math.abs(d.chain.length - vmax.chain.length));
    return { d, score: shared * 100 + eraOverlap * 5 + lenSim };
  });
  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3);
  console.log(`\n── Verstappen distractors ──`);
  console.log(`  Answer: ${vmax.name} [${vmax.chain.join(" → ")}]`);
  for (const { d, score } of top3) {
    const shared = d.chainIds.filter((id) => vmax.chainIds.includes(id)).length;
    const eraOverlap = Math.max(0, Math.min(d.ly, vmax.ly) - Math.max(d.fy, vmax.fy) + 1);
    console.log(
      `  Decoy: ${d.name} [${d.chain.join(" → ")}]  — shared:${shared} era:${eraOverlap}yr score:${score}`
    );
  }
}

// ── Write output ───────────────────────────────────────────────────────────────
const out = JSON.stringify({ drivers });
fs.writeFileSync(path.join(root, "public/trivia.json"), out);
console.log(
  `\ntrivia.json: ${drivers.length} drivers, ${Math.round(out.length / 1024)}KB raw`
);
