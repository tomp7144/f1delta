/* ============================================================
   F1 DELTA — data
   ============================================================ */

const TEAMS = {
  ferrari:    { name: "Ferrari",      color: "var(--ferrari)",   dark: false },
  mercedes:   { name: "Mercedes",     color: "var(--mercedes)",  dark: false },
  redbull:    { name: "Red Bull",     color: "var(--redbull)",   dark: true  },
  mclaren:    { name: "McLaren",      color: "var(--mclaren)",   dark: false },
  aston:      { name: "Aston Martin", color: "var(--aston)",     dark: false },
  williams:   { name: "Williams",     color: "var(--williams)",  dark: false },
  alpine:     { name: "Alpine",       color: "var(--alpine)",    dark: false },
  haas:       { name: "Haas",         color: "var(--haas)",      dark: false },
  kick:       { name: "Kick Sauber",  color: "var(--kick)",      dark: false },
  rb:         { name: "RB",           color: "var(--rb)",        dark: false },
};

// Driver code → team mapping
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

// Fallback static data (Canadian GP)
const TOWER_FALLBACK = [
  { code: "NOR", team: "mclaren",  compound: "S", gap: 0,    leader: true  },
  { code: "LEC", team: "ferrari",  compound: "M", gap: 3.2,  leader: false },
  { code: "VER", team: "redbull",  compound: "M", gap: 7.8,  leader: false },
  { code: "ANT", team: "mercedes", compound: "H", gap: 12.1, leader: false },
  { code: "HAM", team: "ferrari",  compound: "S", gap: 15.4, leader: false },
  { code: "PIA", team: "mclaren",  compound: "M", gap: 19.0, leader: false },
];

// Compound abbreviation map
const COMPOUND_MAP = {
  SOFT: "S", MEDIUM: "M", HARD: "H",
  INTERMEDIATE: "I", WET: "W",
};

// ---- Fetch latest race data from OpenF1 ----
async function fetchLatestRaceData() {
  try {
    // 1. Get latest race session
    const sessRes = await fetch(
      "https://api.openf1.org/v1/sessions?session_type=Race&order_by=-date_start&limit=1"
    );
    if (!sessRes.ok) throw new Error("session fetch failed");
    const sessions = await sessRes.json();
    if (!sessions.length) throw new Error("no sessions");
    const session = sessions[0];
    const key = session.session_key;

    // 2. Get final positions
    const posRes = await fetch(
      `https://api.openf1.org/v1/position?session_key=${key}&order_by=position`
    );
    if (!posRes.ok) throw new Error("position fetch failed");
    const positions = await posRes.json();

    // Deduplicate — keep only the last position entry per driver
    const latestPos = {};
    positions.forEach(p => {
      latestPos[p.driver_number] = p;
    });
    const sorted = Object.values(latestPos).sort((a, b) => a.position - b.position);

    // 3. Get driver info (for 3-letter codes)
    const drvRes = await fetch(
      `https://api.openf1.org/v1/drivers?session_key=${key}`
    );
    if (!drvRes.ok) throw new Error("drivers fetch failed");
    const drivers = await drvRes.json();
    const driverMap = {};
    drivers.forEach(d => { driverMap[d.driver_number] = d; });

    // 4. Get stints for tyre compounds
    const stintRes = await fetch(
      `https://api.openf1.org/v1/stints?session_key=${key}`
    );
    if (!stintRes.ok) throw new Error("stints fetch failed");
    const stints = await stintRes.json();

    // Get the last stint per driver (current compound)
    const lastStint = {};
    stints.forEach(s => {
      if (!lastStint[s.driver_number] || s.stint_number > lastStint[s.driver_number].stint_number) {
        lastStint[s.driver_number] = s;
      }
    });

    // 5. Build TOWER_INIT from real data (top 6)
    const top6 = sorted.slice(0, 6);
    const towerData = top6.map((p, i) => {
      const drv = driverMap[p.driver_number] || {};
      const code = drv.name_acronym || String(p.driver_number);
      const teamName = (drv.team_name || "").toLowerCase().replace(/\s+/g, "");
      const team = DRIVER_TEAMS[code] || guessTeam(teamName);
      const stint = lastStint[p.driver_number];
      const compound = stint ? (COMPOUND_MAP[stint.compound] || "M") : "M";
      // Spread gaps roughly — OpenF1 doesn't always have gap data in position endpoint
      const gap = i === 0 ? 0 : i * (3 + Math.random() * 2);
      return { code, team, compound, gap, leader: i === 0 };
    });

    // Update session label
    window.CURRENT_SESSION = {
      name: session.circuit_short_name || session.location || "Latest Race",
      round: session.round_number || "—",
    };

    return towerData;
  } catch (err) {
    console.warn("OpenF1 fetch failed, using fallback data:", err.message);
    return null;
  }
}

function guessTeam(name) {
  if (name.includes("mclaren")) return "mclaren";
  if (name.includes("ferrari")) return "ferrari";
  if (name.includes("red") || name.includes("bull")) return "redbull";
  if (name.includes("mercedes")) return "mercedes";
  if (name.includes("aston")) return "aston";
  if (name.includes("williams")) return "williams";
  if (name.includes("alpine")) return "alpine";
  if (name.includes("haas")) return "haas";
  if (name.includes("sauber") || name.includes("kick")) return "kick";
  return "rb";
}

// Start with fallback, then replace with real data when it arrives
let TOWER_INIT = [...TOWER_FALLBACK];
window.CURRENT_SESSION = { name: "Canadian GP", round: "9" };

// Fetch in background — timing tower will pick up new data on next render cycle
fetchLatestRaceData().then(data => {
  if (data && data.length >= 4) {
    TOWER_INIT = data;
    window.TOWER_INIT = data;
    // Dispatch event so the tower can reinitialise if it wants
    window.dispatchEvent(new CustomEvent("f1data:updated", { detail: { tower: data } }));
  }
});

// Fantasy picks
const PICKS = [
  { id: "nor", name: "Lando Norris",     team: "mclaren",  note: "Circuit historian · 3 wins here", price: 32.5, form: 94,  dir: "up",   value: false, proj: 71, hist: [0.6,0.8,0.7,0.9,0.85,1] },
  { id: "lec", name: "Charles Leclerc",  team: "ferrari",  note: "Strong at street circuits",         price: 28.1, form: 88,  dir: "up",   value: false, proj: 64, hist: [0.5,0.7,0.6,0.75,0.9,0.88] },
  { id: "pia", name: "Oscar Piastri",    team: "mclaren",  note: "Qualifying pace leader",            price: 26.8, form: 85,  dir: "up",   value: false, proj: 61, hist: [0.55,0.6,0.72,0.78,0.8,0.85] },
  { id: "ver", name: "Max Verstappen",   team: "redbull",  note: "Historically strong here",          price: 30.0, form: 79,  dir: "flat", value: false, proj: 66, hist: [0.9,0.85,0.7,0.72,0.78,0.79] },
  { id: "rus", name: "George Russell",   team: "mercedes", note: "Consistent points finisher",        price: 21.4, form: 76,  dir: "up",   value: false, proj: 52, hist: [0.5,0.55,0.6,0.65,0.7,0.76] },
  { id: "ham", name: "Lewis Hamilton",   team: "ferrari",  note: "Seven-time champ · street craft",   price: 24.5, form: 68,  dir: "down", value: false, proj: 48, hist: [0.85,0.8,0.7,0.65,0.6,0.68] },
  { id: "ant", name: "Kimi Antonelli",   team: "mercedes", note: "Value pick this round",             price: 18.2, form: 71,  dir: "flat", value: true,  proj: 45, hist: [0.4,0.5,0.55,0.6,0.68,0.71] },
  { id: "alo", name: "Fernando Alonso",  team: "aston",    note: "Wildcard upside",                   price: 14.6, form: 62,  dir: "down", value: true,  proj: 38, hist: [0.7,0.62,0.55,0.5,0.58,0.62] },
];

const FANTASY_BUDGET = 100.0;
const DEFAULT_SELECTED = ["nor", "lec", "ant", "alo"];
const DEFAULT_CAPTAIN = "nor";

const HISTORY_CARDS = [
  {
    kicker: "Regulation Eras",
    title: "Every rule change & who won the chaos",
    body: "Eleven major resets since 1950. See who capitalized — and who got crushed — every single time the rulebook was rewritten.",
    stat: "1950 → 2026",
    accent: "var(--ferrari)",
  },
  {
    kicker: "Dynasty Tracker",
    title: "How boring does F1 actually get?",
    body: "Every champion colored by team. The dominant eras are more lopsided than memory tells you — the data is unforgiving.",
    stat: "75 seasons",
    accent: "var(--mercedes)",
  },
  {
    kicker: "Team Orders",
    title: "When Ferrari told Barrichello to move over",
    body: "Every documented team order on record — and whether any of it actually changed where a championship landed.",
    stat: "7 incidents",
    accent: "var(--gold)",
  },
];

Object.assign(window, {
  TEAMS, TOWER_INIT, TOWER_FALLBACK, PICKS, FANTASY_BUDGET,
  DEFAULT_SELECTED, DEFAULT_CAPTAIN, HISTORY_CARDS,
});
