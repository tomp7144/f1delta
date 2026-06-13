/* ============================================================
   F1 DELTA — bake WDC standings
   Pulls 2026 driver standings from Jolpica ONCE at build time and
   writes public/standings.json. The site then reads the static file
   — no live third-party call from a visitor's browser. Run by the
   same GitHub Action as bake-latest.mjs.

   Run locally:  node bake-standings.mjs
   ============================================================ */
import { writeFile, mkdir } from "node:fs/promises";

const SEASON = "2026";
const URL = `https://api.jolpi.ca/ergast/f1/${SEASON}/driverStandings.json`;

try {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Jolpica ${res.status}`);
  const data = await res.json();
  const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

  const standings = list.map((s) => ({
    pos: Number(s.position),
    code: s.Driver?.code || "",
    points: Number(s.points),
    team: s.Constructors?.[0]?.name || "",
  }));

  await mkdir("public", { recursive: true });
  await writeFile(
    "public/standings.json",
    JSON.stringify({ season: SEASON, standings, baked: new Date().toISOString() }, null, 2)
  );
  console.log(`[F1Delta] baked ${standings.length} standings -> public/standings.json`);
} catch (err) {
  console.error("[F1Delta] standings bake failed:", err.message);
  process.exit(1);
}
