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

// Fallback: Canadian GP 2026
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

// ---- Fetch latest race results from OpenF1 ----
async function fetchLatestRaceData() {
  try {
    // 1. Latest race session for 2026
    const sessRes = await fetch(
      "https://api.openf1.org/v1/sessions?session_type=Race&year=2026"
    );
    if (!sessRes.ok) throw new Error(`sessions ${sessRes.status}`);
    const sessions = await sessRes.json();
    if (!sessions.length) throw new Error("no 2026 race sessions yet");
    const session = sessions[sessions.length - 1]; // last = most recent
    const key = session.session_key;
    console.log(`[F1Delta] Session: ${session.location} (key ${key})`);

    // 2. session_result — has position + gap_to_leader in one shot
    //    Also fetch drivers for name_acronym + team_name
    const [resultRes, drvRes, stintRes] = await Promise.all([
      fetch(`https://api.openf1.org/v1/session_result?session_key=${key}`),
      fetch(`https://api.openf1.org/v1/drivers?session_key=${key}`),
      fetch(`https://api.openf1.org/v1/stints?session_key=${key}`),
    ]);

    if (!resultRes.ok) throw new Error(`session_result ${resultRes.status}`);
    const results = await resultRes.json();
    if (!results.length) throw new Error("no session_result data");

    // Sort by position
    const sorted = [...results].sort((a, b) => a.position - b.position);

    // Driver map: number → { name_acronym, team_name }
    const drivers = drvRes.ok ? await drvRes.json() : [];
    const driverMap = {};
    drivers.forEach(d => { driverMap[d.driver_number] = d; });

    // Last compound per driver
    const stints = stintRes.ok ? await stintRes.json() : [];
    const lastStint = {};
    stints.forEach(s => {
      if (!lastStint[s.driver_number] ||
          s.stint_number > lastStint[s.driver_number].stint_number) {
        lastStint[s.driver_number] = s;
      }
    });

    // 3. Build tower rows (top 6, skip DNFs if possible)
    const finishers = sorted.filter(r => !r.dnf && !r.dns && !r.dsq);
    const top6 = (finishers.length >= 4 ? finishers : sorted).slice(0, 6);

    const towerData = top6.map((r, i) => {
      const drv      = driverMap[r.driver_number] || {};
      const code     = drv.name_acronym || String(r.driver_number);
      const team     = DRIVER_TEAMS[code] || guessTeam(drv.team_name);
      const stint    = lastStint[r.driver_number];
      const compound = stint ? (COMPOUND_MAP[stint.compound] || "M") : "M";

      // gap_to_leader: numeric seconds, "+N LAP(S)" string, or 0 for leader
      let gap = 0;
      if (i > 0) {
        const raw = r.gap_to_leader;
        if (typeof raw === "number") {
          gap = raw;
        } else if (typeof raw === "string" && raw.includes("LAP")) {
          gap = raw; // keep "+1 LAP" as string — tower can display it
        } else {
          gap = parseFloat(raw) || i * 5;
        }
      }

      return { code, team, compound, gap, leader: i === 0 };
    });

    window.CURRENT_SESSION = {
      name: session.circuit_short_name || session.location || "Latest Race",
      round: session.round_number || "—",
    };

    console.log("[F1Delta] Loaded:", towerData.map(d => d.code).join(" "));
    return towerData;

  } catch (err) {
    console.warn("[F1Delta] fetch failed, using fallback:", err.message);
    return null;
  }
}

// Start with fallback immediately so the tower renders
let TOWER_INIT = [...TOWER_FALLBACK];
window.CURRENT_SESSION = { name: "Canadian GP", round: "9" };

// Fetch real data in background; fire event so tower can re-seed
fetchLatestRaceData().then(data => {
  if (data && data.length >= 4) {
    TOWER_INIT = data;
    window.TOWER_INIT = data;
    window.dispatchEvent(new CustomEvent("f1data:updated", { detail: { tower: data } }));
  }
});

// Fantasy picks
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

Object.assign(window, {
  TEAMS, TOWER_INIT, TOWER_FALLBACK, PICKS, FANTASY_BUDGET,
  DEFAULT_SELECTED, DEFAULT_CAPTAIN, HISTORY_CARDS,
});
