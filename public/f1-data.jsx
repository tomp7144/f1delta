/* ============================================================
   F1 DELTA — data layer
   OpenF1 API: https://openf1.org
   ============================================================
   Endpoints used:
     /v1/session    (singular) — session info
     /v1/position   (singular) — driver positions over time
     /v1/intervals  (singular) — gap_to_leader data
     /v1/stints     (singular) — tyre compound info
     /v1/drivers    (singular) — driver codes
   All support session_key=latest shortcut.
   ============================================================ */

const TEAMS = {
  ferrari:    { name: "Ferrari",      color: "var(--ferrari)"   },
  mercedes:   { name: "Mercedes",     color: "var(--mercedes)"  },
  redbull:    { name: "Red Bull",     color: "var(--redbull)"   },
  mclaren:    { name: "McLaren",      color: "var(--mclaren)"   },
  aston:      { name: "Aston Martin", color: "var(--aston)"     },
  williams:   { name: "Williams",     color: "var(--williams)"  },
  alpine:     { name: "Alpine",       color: "var(--alpine)"    },
  haas:       { name: "Haas",         color: "var(--haas)"      },
  kick:       { name: "Kick Sauber",  color: "var(--kick)"      },
  rb:         { name: "RB",           color: "var(--rb)"        },
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

// ---- helpers ----

// From an array of timestamped entries, keep the latest per driver
function latestPerDriver(entries) {
  const map = {};
  for (const e of entries) {
    const prev = map[e.driver_number];
    if (!prev || e.date > prev.date) map[e.driver_number] = e;
  }
  return map;
}

// ---- main fetch ----
async function fetchLatestRaceData() {
  try {
    // 1. Get latest race session info
    const sessRes = await fetch(
      "https://api.openf1.org/v1/sessions?session_type=Race&order_by=-date_start&limit=1"
    );
    if (!sessRes.ok) throw new Error(`sessions ${sessRes.status}`);
    const sessions = await sessRes.json();
    if (!sessions.length) throw new Error("no sessions returned");
    const session = sessions[0];
    const key = session.session_key;
    console.log(`[F1Delta] Session: ${session.session_name} ${session.year} (key ${key})`);

    // 2. Fetch position, intervals, stints, drivers in parallel
    const [posRes, intRes, stintRes, drvRes] = await Promise.all([
      fetch(`https://api.openf1.org/v1/position?session_key=${key}`),
      fetch(`https://api.openf1.org/v1/intervals?session_key=${key}`),
      fetch(`https://api.openf1.org/v1/stints?session_key=${key}`),
      fetch(`https://api.openf1.org/v1/drivers?session_key=${key}`),
    ]);

    if (!posRes.ok) throw new Error(`position ${posRes.status}`);
    const allPositions = await posRes.json();
    if (!allPositions.length) throw new Error("no position data");

    const allIntervals = intRes.ok ? await intRes.json() : [];
    const allStints    = stintRes.ok ? await stintRes.json() : [];
    const allDrivers   = drvRes.ok ? await drvRes.json() : [];

    // 3. Latest position per driver → sort by position rank
    const posMap   = latestPerDriver(allPositions);
    const intMap   = latestPerDriver(allIntervals);
    const stintMap = latestPerDriver(allStints);

    const sorted = Object.values(posMap).sort((a, b) => a.position - b.position);

    // 4. Driver number → 3-letter code
    const codeByNumber = {};
    for (const d of allDrivers) codeByNumber[d.driver_number] = d.name_acronym;

    // 5. Build tower rows
    const towerData = sorted.slice(0, 10).map((p, i) => {
      const code        = codeByNumber[p.driver_number] || `D${p.driver_number}`;
      const team        = DRIVER_TEAMS[code] || "rb";
      const rawCompound = stintMap[p.driver_number]?.compound || "MEDIUM";
      const compound    = COMPOUND_MAP[rawCompound.toUpperCase()] || "M";

      // gap_to_leader comes from intervals endpoint, not position
      const rawGap = intMap[p.driver_number]?.gap_to_leader ?? null;
      const gap = i === 0 ? 0
        : rawGap === null ? null
        : parseFloat(String(rawGap).replace("+", "")) || 0;

      return { code, team, compound, gap, leader: i === 0 };
    });

    const sessionLabel = `${session.session_name?.toUpperCase()} ${session.year}`;
    console.log("[F1Delta] Loaded:", towerData.map(d => d.code).join(" "));
    return { data: towerData, sessionName: sessionLabel };

  } catch (err) {
    console.warn("[F1Delta] API failed, using fallback:", err.message);
    return { data: TOWER_FALLBACK, sessionName: "CANADIAN GP 2026" };
  }
}

// Expose globally
window.F1Delta = window.F1Delta || {};
window.F1Delta.TEAMS                = TEAMS;
window.F1Delta.DRIVER_TEAMS         = DRIVER_TEAMS;
window.F1Delta.TOWER_FALLBACK       = TOWER_FALLBACK;
window.F1Delta.fetchLatestRaceData  = fetchLatestRaceData;
