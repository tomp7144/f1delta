#!/usr/bin/env node
/**
 * bake-latest.mjs — bakes the most recent COMPLETED race into a static file.
 *
 * Source:  OpenF1 free tier (no auth; completed sessions are free).
 * Writes:  ./public/latest-race.json   (PUBLIC — the home-page tower is a free
 *          feature, so this lives in public/, not the gated data/ archive.)
 *
 * Build-time only. Run once per weekend after a race, commit the result, deploy.
 * Nothing hits OpenF1 at runtime — visitors read your own static file.
 *   node bake-latest.mjs            # current year
 *   node bake-latest.mjs 2026       # force a year
 *
 * Why OpenF1 and not Jolpica: completed results land within a day (Jolpica lags
 * days), it's free, and `drivers` gives live team + colour so the tower never
 * shows a stale team mapping.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://api.openf1.org/v1";
const OUT = path.resolve("./public/latest-race.json");

const COMPOUND_MAP = { SOFT: "S", MEDIUM: "M", HARD: "H", INTERMEDIATE: "I", WET: "W" };

// ---------- pure transforms (exported for tests) ----------

/** Pick the most recent non-cancelled Race whose end time is in the past. */
export function pickLatestRace(sessions, now = new Date()) {
  return sessions
    .filter((s) => s.session_name === "Race" && s.is_cancelled !== true && s.date_end && new Date(s.date_end) <= now)
    .sort((a, b) => new Date(b.date_end) - new Date(a.date_end))[0] ?? null;
}

/** Round number = how many non-cancelled races have started up to and incl. this one. */
export function roundFor(sessions, race) {
  const start = new Date(race.date_start);
  return sessions.filter(
    (s) => s.session_name === "Race" && s.is_cancelled !== true && new Date(s.date_start) <= start
  ).length;
}

function formatGap(r, winnerLaps) {
  if (r.position === 1) return "0";        // leader — frontend renders "LEADER" off the flag
  if (r.dnf) return "DNF";
  if (r.dns) return "DNS";
  if (r.dsq) return "DSQ";
  const laps = r.number_of_laps ?? winnerLaps;
  const down = (winnerLaps ?? laps) - laps;
  if (down > 0) return `+${down} LAP${down > 1 ? "S" : ""}`;
  if (r.gap_to_leader == null) return "";
  return typeof r.gap_to_leader === "number" ? `+${r.gap_to_leader.toFixed(3)}` : String(r.gap_to_leader);
}

/** Build the tower rows from OpenF1 session_result + drivers (+ optional stints). */
export function buildTower(results, drivers, stints = []) {
  const drv = new Map(drivers.map((d) => [d.driver_number, d]));

  // final compound = compound of each driver's last stint
  const lastCompound = new Map();
  for (const st of stints) {
    const prev = lastCompound.get(st.driver_number);
    if (!prev || (st.lap_end ?? st.stint_number ?? 0) >= (prev.lap_end ?? prev.stint_number ?? 0)) {
      lastCompound.set(st.driver_number, st);
    }
  }

  const winnerLaps = Math.max(...results.map((r) => r.number_of_laps ?? 0), 0);

  return results
    .map((r) => {
      const d = drv.get(r.driver_number) ?? {};
      const comp = lastCompound.get(r.driver_number)?.compound;
      return {
        position: r.position ?? null,
        code: d.name_acronym ?? String(r.driver_number),
        driverNumber: r.driver_number,
        teamName: d.team_name ?? null,
        teamColour: d.team_colour ? `#${d.team_colour}` : null,
        compound: comp ? (COMPOUND_MAP[comp] ?? comp[0]) : null,
        points: r.points ?? 0,
        gap: formatGap(r, winnerLaps),
        leader: r.position === 1,
        dnf: !!r.dnf,
      };
    })
    .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
}

// ---------- network (only runs when invoked directly) ----------

async function getJSON(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function main() {
  const year = Number(process.argv[2]) || new Date().getFullYear();

  // try this year, then fall back one year (handles the pre-season gap)
  let sessions = await getJSON(`${BASE}/sessions?year=${year}&session_name=Race`);
  let race = pickLatestRace(sessions);
  if (!race) {
    console.warn(`No completed race in ${year}; trying ${year - 1}.`);
    sessions = await getJSON(`${BASE}/sessions?year=${year - 1}&session_name=Race`);
    race = pickLatestRace(sessions);
  }
  if (!race) {
    console.warn("No completed race found. Nothing written.");
    process.exit(0); // graceful — let the rest of the cron continue
  }

  const sk = race.session_key;
  const [results, drivers, stints, meetings] = await Promise.all([
    getJSON(`${BASE}/session_result?session_key=${sk}`),
    getJSON(`${BASE}/drivers?session_key=${sk}`),
    getJSON(`${BASE}/stints?session_key=${sk}`).catch(() => []), // compound is a nice-to-have
    getJSON(`${BASE}/meetings?meeting_key=${race.meeting_key}`).catch(() => []),
  ]);

  if (!Array.isArray(results) || results.length === 0) {
    console.warn(`session_result for ${sk} is empty — race may not be classified yet. Nothing written.`);
    process.exit(0); // graceful — let the rest of the cron continue
  }

  const out = {
    session: {
      name: meetings[0]?.meeting_name ?? `${race.country_name} GP`,
      country: race.country_name,
      round: roundFor(sessions, race),
      date: race.date_start?.slice(0, 10) ?? null,
      sessionKey: sk,
      meetingKey: race.meeting_key,
      status: "FINISHED",
    },
    tower: buildTower(results, drivers, stints),
    baked: new Date().toISOString(),
  };

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2));
  console.log(`Baked ${out.session.name} (round ${out.session.round}, ${out.tower.length} drivers) -> ${OUT}`);
}

// run main only when executed directly, not when imported by a test
if (import.meta.url === `file://${process.argv[1]}`) main();
