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
          if (!isLeader) {
            gapDisplay = typeof d.gap === "number" ? `+${d.gap.toFixed(1)}` : d.gap;
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
                    <DeltaMark size={9} color="var(--text-faint)" stroke />
                    <span>{gapDisplay}</span>
                  </>
                )}
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

Object.assign(window, { TimingTower });