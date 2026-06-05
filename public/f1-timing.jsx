/* ============================================================
   F1 DELTA — live timing tower (Static Finishing Order with Toggle)
   ============================================================ */

function TimingTower() {
  const [drivers, setDrivers] = useState(() => TOWER_INIT);
  const [expanded, setExpanded] = useState(false); // The toggle state

  // Listen for the real data and set it directly
  useEffect(() => {
    const handler = (e) => {
      const data = e.detail.tower;
      if (data && data.length >= 4) {
        setDrivers(data);
      }
    };
    window.addEventListener("f1data:updated", handler);
    return () => window.removeEventListener("f1data:updated", handler);
  }, []);

  // Control what is actually rendered
  const displayedDrivers = expanded ? drivers : drivers.slice(0, 6);

  return (
    <div className="tower">
      <div className="tower-head">
        <div className="sess">
          Canadian GP <span className="mono">·</span>{" "}
          <span className="lap num">FINAL RESULTS</span>
        </div>
        <div className="status">
          <span className="dot" style={{ background: "var(--text-faint)" }}></span>
          FINISHED
        </div>
      </div>
      <div className="tower-rows">
        {displayedDrivers.map((d, i) => {
          const team = TEAMS[d.team];
          const isLeader = i === 0;
          const TIRE_COLORS = {
            S: "#FF3333", // Soft (Red)
            M: "#FFD12E", // Medium (Yellow)
            H: "#FFFFFF", // Hard (White)
            I: "#43A047", // Inter (Green)
            W: "#0072CE"  // Wet (Blue)
          };
          
          let gapDisplay = "LEADER";
          let showDelta = true;
          
          if (!isLeader) {
            gapDisplay = typeof d.gap === "number" ? `+${d.gap.toFixed(3)}` : String(d.gap);
            
            // If the gap contains any letters (Lap, Retired, DNS), it's a classification string
            if (/[a-zA-Z]/.test(gapDisplay)) {
              showDelta = false; // Hide the triangle icon for clean text
              gapDisplay = gapDisplay.toUpperCase();
              
              // Force a '+' sign if it says "LAP" but the API forgot it
              if (gapDisplay.includes("LAP") && !gapDisplay.startsWith("+")) {
                gapDisplay = "+" + gapDisplay;
              }
            }
          }

          return (
            <div
              key={d.code}
              className={"trow" + (isLeader ? " is-leader" : "")}
              style={{ "--tc": team?.color || "var(--text-faint)" }}
            >
              <div className="teambar"></div>
              <div className="pos num">{i + 1}</div>
              <div className="ident">
                <span className="code">{d.code}</span>
                <span className="team">{team?.name || "Independent"}</span>
              </div>
              <div className={"gap" + (isLeader ? " leader" : "")}>
                {isLeader ? (
                  gapDisplay
                ) : (
                  <>
                    {showDelta && <DeltaMark size={9} color="var(--text-faint)" stroke />}
                    <span style={{ 
                      fontWeight: showDelta ? "normal" : "600",
                      letterSpacing: showDelta ? "normal" : "0.05em" 
                    }}>
                      {gapDisplay}
                    </span>
                  </>
                )}
              </div>
              <div className="points num" style={{ color: d.points > 0 ? "var(--green)" : "var(--text-faint)" }}>
                {d.points > 0 ? `+${d.points}` : "0"}
              </div>
              <div className="compound" style={{ "--tc": TIRE_COLORS[d.compound || "M"] }}>
               {d.compound || "M"}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* The Expand/Collapse Button */}
      {drivers.length > 6 && (
        <button 
          className="tower-expand-btn"
          onClick={() => setExpanded(!expanded)}
          style={{
            width: "100%", padding: "10px", background: "rgba(255,255,255,0.03)",
            border: "none", borderTop: "1px solid rgba(255,255,255,0.05)",
            color: "var(--text-faint)", cursor: "pointer", 
            fontSize: "10px", fontWeight: "600", letterSpacing: "0.1em",
            textTransform: "uppercase", transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.08)"}
          onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.03)"}
        >
          {expanded ? "COLLAPSE TOWER" : `VIEW FULL GRID (${drivers.length})`}
        </button>
      )}
    </div>
  );
}

function StandingsTower() {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    const handler = (e) => setStandings(e.detail);
    window.addEventListener("f1standings:updated", handler);
    return () => window.removeEventListener("f1standings:updated", handler);
  }, []);

  if (standings.length === 0) return null;

  return (
    <div className="tower" style={{ marginTop: "20px" }}>
      <div className="tower-head">
        <div className="sess">
          2026 WDC <span className="mono">·</span> <span className="lap num">LIVE STANDINGS</span>
        </div>
      </div>
      <div className="tower-rows">
        {standings.slice(0, 10).map((s) => {
          const teamColor = TEAMS[s.team]?.color || "var(--text-faint)";
          return (
            <div key={s.code} className="trow" style={{ "--tc": teamColor }}>
              <div className="teambar"></div>
              <div className="pos num">{s.pos}</div>
              <div className="ident">
                <span className="code">{s.code}</span>
              </div>
              <div className="gap num" style={{ color: "var(--text-bright)" }}>
                {s.points} PTS
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function UpgradesModule() {
  const upgrades = window.WEEKEND_UPGRADES || [];

  if (upgrades.length === 0) return null;

  return (
    <div className="tower" style={{ marginTop: "20px", border: "1px solid var(--redbull)", background: "rgba(255,0,0,0.05)" }}>
      <div className="tower-head" style={{ borderBottom: "1px solid rgba(255,0,0,0.2)" }}>
        <div className="sess" style={{ color: "var(--ferrari)" }}>
          PRO <span className="mono">·</span> <span className="lap">WEEKEND UPGRADES</span>
        </div>
      </div>
      <div style={{ padding: "10px" }}>
        {upgrades.map((u, i) => {
          const teamColor = TEAMS[u.team]?.color || "var(--text-faint)";
          return (
            <div key={i} style={{ marginBottom: "12px", borderLeft: `3px solid ${teamColor}`, paddingLeft: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-bright)" }}>
                {TEAMS[u.team]?.name || u.team}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "4px" }}>
                <span style={{ color: "var(--text-base)" }}>Parts:</span> {u.parts.join(", ")} <br/>
                <span style={{ color: "var(--text-base)" }}>Focus:</span> {u.focus} <br/>
                <span style={{ color: u.impact === "High" ? "var(--green)" : "var(--text-faint)" }}>
                  Impact: {u.impact}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
Object.assign(window, { TimingTower, StandingsTower, UpgradesModule });