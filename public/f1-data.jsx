/* ============================================================
   F1 DELTA — data (Full Grid & Standings Processing)
   ============================================================ */

const TEAMS = {
  ferrari:    { name: "Ferrari",      color: "#E8002D", dark: false },
  mercedes:   { name: "Mercedes",     color: "#27F4D2", dark: false },
  redbull:    { name: "Red Bull",     color: "#3671C6", dark: true  },
  mclaren:    { name: "McLaren",      color: "#FF8000", dark: false },
  aston:      { name: "Aston Martin", color: "#229971", dark: false },
  williams:   { name: "Williams",     color: "#64C4FF", dark: false },
  alpine:     { name: "Alpine",       color: "#FF87BC", dark: false }, 
  haas:       { name: "Haas",         color: "#FFFFFF", dark: false },
  kick:       { name: "Kick Sauber",  color: "#52E252", dark: false },
  rb:         { name: "RB",           color: "#6692FF", dark: false },
};

// NOTE: DRIVER_TEAMS is no longer used by the tower (team now comes live from the
// baked race file). Kept only so nothing else that might reference it breaks; safe
// to delete once you've confirmed it's unused elsewhere.
const DRIVER_TEAMS = {
  NOR: "mclaren",  PIA: "mclaren",
  LEC: "ferrari",  HAM: "ferrari",
  VER: "redbull",  LAW: "redbull",
  RUS: "mercedes", ANT: "mercedes",
  ALO: "aston",    STR: "aston",
  GAS: "alpine",   COL: "alpine",
  ALB: "williams", SAI: "williams",
  OCO: "haas",     BEA: "haas",
  HUL: "kick",     BOR: "kick",
  TSU: "rb",       HAD: "rb",
};

const COMPOUND_MAP = {
  SOFT: "S", MEDIUM: "M", HARD: "H",
  INTERMEDIATE: "I", WET: "W",
};

// Fallback: Canadian GP 2026 (offline safety net — matches CURRENT_SESSION default below)
const TOWER_FALLBACK = [
  { code: "ANT", team: "mercedes", compound: "H", gap: 0,    leader: true  },
  { code: "NOR", team: "mclaren",  compound: "S", gap: 2.0,  leader: false },
  { code: "LEC", team: "ferrari",  compound: "M", gap: 3.9,  leader: false },
  { code: "VER", team: "redbull",  compound: "M", gap: 9.6,  leader: false },
  { code: "PIA", team: "mclaren",  compound: "M", gap: 12.0, leader: false },
  { code: "HAM", team: "ferrari",  compound: "S", gap: 17.6, leader: false },
];

function guessTeam(name) {
  if (!name) return "rb";
  const n = name.toLowerCase();
  if (n.includes("mclaren"))              return "mclaren";
  if (n.includes("ferrari"))              return "ferrari";
  if (n.includes("red bull"))             return "redbull";
  if (n.includes("mercedes"))             return "mercedes";
  if (n.includes("aston"))                return "aston";
  if (n.includes("williams"))             return "williams";
  if (n.includes("alpine"))               return "alpine";
  if (n.includes("haas"))                 return "haas";
  if (n.includes("sauber") || n.includes("kick")) return "kick";
  return "rb";
}

// Map an OpenF1 team_name -> our internal slug. Known teams reuse existing slugs
// (so their established colours are kept); genuinely new 2026 teams get their own.
const NAME_TO_SLUG = [
  ["mercedes", "mercedes"], ["ferrari", "ferrari"], ["red bull", "redbull"],
  ["mclaren", "mclaren"],   ["aston", "aston"],     ["williams", "williams"],
  ["alpine", "alpine"],     ["haas", "haas"],
  ["racing bulls", "rb"],   ["rb", "rb"],
  ["audi", "audi"], ["sauber", "audi"], ["kick", "audi"], // Sauber/Kick -> Audi (2026)
  ["cadillac", "cadillac"],                               // new entry (2026)
];

function teamSlug(teamName) {
  const n = (teamName || "").toLowerCase();
  for (const [needle, slug] of NAME_TO_SLUG) if (n.includes(needle)) return slug;
  return n.replace(/[^a-z0-9]+/g, "") || "unknown"; // stable fallback slug
}

// Make sure TEAMS has an entry for this slug. Known teams are left exactly as they
// are (no colour shift); only brand-new teams get added, using the live colour.
function ensureTeam(slug, teamName, teamColour) {
  if (!TEAMS[slug]) {
    TEAMS[slug] = { name: teamName || slug, color: teamColour || "#888888", dark: false };
  }
}

// ---- FETCH LATEST RACE DATA (baked OpenF1 file, served from /public) ----
// Reads the static file produced by bake-latest.mjs. No third-party call at runtime.
// Returns the SAME row shape the tower already renders: {code, team, compound, gap, leader, points}.
async function fetchLatestRaceData() {
  try {
    const res = await fetch("/latest-race.json");
    if (!res.ok) throw new Error(`latest-race ${res.status}`);
    const { session, tower } = await res.json();

    const fullGrid = tower.map((r) => {
      const slug = teamSlug(r.teamName);
      ensureTeam(slug, r.teamName, r.teamColour);
      return {
        code: r.code,
        team: slug,
        compound: r.compound || "M", // real compound comes from OpenF1 stints (cosmetic; TODO)
        gap: r.leader ? 0 : r.gap,    // leader = numeric 0, like before
        leader: !!r.leader,
        points: r.points ?? 0,
      };
    });

    window.CURRENT_SESSION = { name: session.name, round: session.round };
    console.log(`[F1Delta] Loaded ${session.name} (round ${session.round}) from baked file.`);
    return fullGrid;

  } catch (err) {
    console.warn("[F1Delta] latest-race load failed, using fallback:", err.message);
    return null;
  }
}

// ---- FETCH CHAMPIONSHIP STANDINGS ----
// NOTE: still a live Jolpica call — so it inherits Jolpica's lag and is the last
// runtime third-party dependency on the homepage. Next candidate to bake.
async function fetchDriverStandings() {
  try {
    const res = await fetch("https://api.jolpi.ca/ergast/f1/2026/driverStandings.json");
    if (!res.ok) throw new Error("Standings fetch failed");
    const data = await res.json();
    
    const standingsList = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
    
    const formattedStandings = standingsList.map(s => ({
      pos: s.position,
      points: s.points,
      code: s.Driver.code,
      team: guessTeam(s.Constructors[0]?.name)
    }));
    
    window.dispatchEvent(new CustomEvent("f1standings:updated", { detail: formattedStandings }));
    return formattedStandings;
  } catch (err) {
    console.warn("[F1Delta] Standings fetch failed:", err.message);
    return null;
  }
}

// ---- WEEKEND UPGRADES (MANUAL THURSDAY UPDATE) ----
const WEEKEND_UPGRADES = [
  { team: "mclaren", parts: ["Front Wing", "Floor Body"], impact: "High", focus: "Downforce" },
  { team: "ferrari", parts: ["Sidepod Inlets"], impact: "Medium", focus: "Cooling" },
  { team: "redbull", parts: ["None"], impact: "None", focus: "N/A" }
];

// ---- FANTASY DATA ----
const PICKS = [
  { id: "nor", name: "Lando Norris",    team: "mclaren",  note: "Circuit historian · 3 wins here", price: 32.5, form: 94,  dir: "up",   value: false, proj: 71, hist: [0.6,0.8,0.7,0.9,0.85,1] },
  { id: "lec", name: "Charles Leclerc", team: "ferrari",  note: "Strong at street circuits",        price: 28.1, form: 88,  dir: "up",   value: false, proj: 64, hist: [0.5,0.7,0.6,0.75,0.9,0.88] },
  { id: "pia", name: "Oscar Piastri",   team: "mclaren",  note: "Qualifying pace leader",           price: 26.8, form: 85,  dir: "up",   value: false, proj: 61, hist: [0.55,0.6,0.72,0.78,0.8,0.85] },
  { id: "ver", name: "Max Verstappen",  team: "redbull",  note: "Historically strong here",         price: 30.0, form: 79,  dir: "flat", value: false, proj: 66, hist: [0.9,0.85,0.7,0.72,0.78,0.79] },
  { id: "rus", name: "George Russell",  team: "mercedes", note: "Consistent points finisher",       price: 21.4, form: 76,  dir: "up",   value: false, proj: 52, hist: [0.5,0.55,0.6,0.65,0.7,0.76] },
  { id: "ham", name: "Lewis Hamilton",  team: "ferrari",  note: "Seven-time champ · street craft",  price: 24.5, form: 68,  dir: "down", value: false, proj: 48, hist: [0.85,0.8,0.7,0.65,0.6,0.68] },
  { id: "ant", name: "Kimi Antonelli",  team: "mercedes", note: "Value pick this round",            price: 18.2, form: 71,  dir: "flat", value: true,  proj: 45, hist: [0.4,0.5,0.55,0.6,0.68,0.71] },
  { id: "alo", name: "Fernando Alonso", team: "aston",    note: "Wildcard upside",                  price: 14.6, form: 62,  dir: "down", value: true,  proj: 38, hist: [0.7,0.62,0.55,0.5,0.58,0.62] },
];

const FANTASY_BUDGET  = 100.0;
const DEFAULT_SELECTED = ["nor", "lec", "ant", "alo"];
const DEFAULT_CAPTAIN  = "nor";

// ---- HISTORY DATA ----
const HISTORY_CARDS = [
  {
    kicker: "Regulation Eras",
    title:  "Every rule change & who won the chaos",
    body:   "Eleven major resets since 1950. See who capitalized — and who got crushed — every single time the rulebook was rewritten.",
    stat:   "1950 → 2026",
    accent: "var(--ferrari)",
  },
  {
    kicker: "Dynasty Tracker",
    title:  "How boring does F1 actually get?",
    body:   "Every champion colored by team. The dominant eras are more lopsided than memory tells you — the data is unforgiving.",
    stat:   "75 seasons",
    accent: "var(--mercedes)",
  },
  {
    kicker: "Team Orders",
    title:  "When Ferrari told Barrichello to move over",
    body:   "Every documented team order on record — and whether any of it actually changed where a championship landed.",
    stat:   "7 incidents",
    accent: "var(--gold)",
  },
];

// ---- INITIALIZATION & EXECUTION ----
let TOWER_INIT = [...TOWER_FALLBACK];
window.CURRENT_SESSION = { name: "Canadian GP", round: "9" };

// Trigger background data fetches
fetchLatestRaceData().then(data => {
  if (data && data.length >= 4) {
    TOWER_INIT = data;
    window.TOWER_INIT = data;
    window.dispatchEvent(new CustomEvent("f1data:updated", { detail: { tower: data } }));
  }
});

fetchDriverStandings();

// Global Window Exports
Object.assign(window, {
  TEAMS, TOWER_INIT, TOWER_FALLBACK, PICKS, FANTASY_BUDGET,
  DEFAULT_SELECTED, DEFAULT_CAPTAIN, HISTORY_CARDS, WEEKEND_UPGRADES
});
