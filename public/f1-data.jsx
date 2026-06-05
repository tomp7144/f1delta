/* ============================================================
   F1 DELTA — data (Full Grid Processing)
   ============================================================ */

const TEAMS = {
  ferrari:    { name: "Ferrari",      color: "#E8002D", dark: false },
  mercedes:   { name: "Mercedes",     color: "#27F4D2", dark: false },
  redbull:    { name: "Red Bull",     color: "#3671C6", dark: true  },
  mclaren:    { name: "McLaren",      color: "#FF8000", dark: false },
  aston:      { name: "Aston Martin", color: "#229971", dark: false },
  williams:   { name: "Williams",     color: "#64C4FF", dark: false },
  alpine:     { name: "Alpine",       color: "#FF87BC", dark: false }, // Pink Alpine 
  haas:       { name: "Haas",         color: "#FFFFFF", dark: false },
  kick:       { name: "Kick Sauber",  color: "#52E252", dark: false },
  rb:         { name: "RB",           color: "#6692FF", dark: false },
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

// ---- Fetch latest race results from Jolpi ----
// ---- Fetch Dual-Source Data (Jolpi for Order, OpenF1 for Timing) ----
async function fetchLatestRaceData() {
  try {
    // 1. Get the official finishing order from Jolpi
    const jolpiRes = await fetch("https://api.jolpi.ca/ergast/f1/2026/5/results/?format=json");
    if (!jolpiRes.ok) throw new Error(`jolpica ${jolpiRes.status}`);
    const data = await jolpiRes.json();
    const results = data.MRData.RaceTable.Races[0].Results;
    const raceName = data.MRData.RaceTable.Races[0].raceName;

    // 2. Fetch the real timing telemetry from OpenF1 via your Netlify proxy
    let timingMap = {};
    try {
      // session_key=latest pulls the most recent session data
      const openf1Res = await fetch("/api/intervals?session_key=latest");
      if (openf1Res.ok) {
        const intervals = await openf1Res.json();
        // OpenF1 returns a massive stream of every interval update. 
        // We loop through and overwrite so we only keep the absolute latest gap per driver.
        intervals.forEach(int => {
          timingMap[int.driver_number] = int.gap_to_leader;
        });
        console.log("[F1Delta] OpenF1 telemetry synced successfully.");
      }
    } catch (e) {
      console.warn("[F1Delta] OpenF1 timing failed, falling back to Jolpi gaps.");
    }

    // 3. Merge the pristine OpenF1 timing into the Jolpi grid order
    const fullGrid = results.map((r, i) => {
      const driverNum = parseInt(r.number);
      
      // Look for OpenF1 data first, fallback to Jolpi's messy strings if OpenF1 is down
      let realGap = i === 0 ? 0 : (timingMap[driverNum] || r.Time?.time || r.status || `+${i * 5.0}s`);

      // If OpenF1 gave us a raw number (e.g. 10.768), format it cleanly for the UI
      if (typeof realGap === "number" && i !== 0) {
        realGap = `+${realGap.toFixed(3)}`;
      }

      return {
        code: r.Driver.code || String(r.number),
        team: DRIVER_TEAMS[r.Driver.code] || guessTeam(r.Constructor.name),
        compound: "M",
        gap: realGap,
        leader: i === 0,
      };
    });

    window.CURRENT_SESSION = { name: raceName, round: data.MRData.RaceTable.round };
    return fullGrid;
    
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