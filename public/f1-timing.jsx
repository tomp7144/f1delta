/* ============================================================
   F1 DELTA — live timing tower (the hero)
   ============================================================ */

function fmtGap(g) {
  return "+" + g.toFixed(1);
}

function TimingTower({ speed = 1, paused = false }) {
  // each driver carries a pseudo race-time delta `t`; display sorts by t
  const [drivers, setDrivers] = useState(() =>
    TOWER_INIT.map((d) => ({ ...d, t: d.gap }))
  );
  const [lap, setLap] = useState(48);
  const total = 70;
  const [flash, setFlash] = useState({}); // code -> true
  const rowRefs = useRef({});
  const prevTops = useRef({});

  // ---- FLIP: animate reorder (offsetTop is scroll-independent) ----
  React.useLayoutEffect(() => {
    const tops = {};
    Object.entries(rowRefs.current).forEach(([code, el]) => {
      if (el) tops[code] = el.offsetTop;
    });
    Object.entries(tops).forEach(([code, top]) => {
      const prev = prevTops.current[code];
      const el = rowRefs.current[code];
      if (el && prev != null && Math.abs(prev - top) > 1) {
        el.style.transition = "none";
        el.style.transform = `translateY(${prev - top}px)`;
        el.classList.add("swapping");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = "";
            el.style.transform = "";
            setTimeout(() => el.classList.remove("swapping"), 600);
          });
        });
      }
    });
    prevTops.current = tops;
  });

  // ---- gap ticking + occasional swaps ----
  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      setDrivers((prev) => {
        const next = prev.map((d) => ({ ...d }));
        const sorted = [...next].sort((a, b) => a.t - b.t);
        sorted.forEach((d, i) => {
          if (i === 0) {
            // leader edges forward slightly
            d.t += (Math.random() - 0.55) * 0.25 * speed;
          } else {
            // random walk with mild pull toward field spread
            const target = i * 4.2;
            const pull = (target - (d.t - sorted[0].t)) * 0.04;
            d.t += (Math.random() - 0.5) * 1.1 * speed + pull * speed;
          }
        });
        // occasional bigger lunge to force an overtake
        if (Math.random() < 0.32 && sorted.length > 2) {
          const i = 1 + Math.floor(Math.random() * (sorted.length - 1));
          sorted[i].t -= (3 + Math.random() * 4) * speed;
        }
        return next;
      });
      // flash a couple of random rows
      setFlash(() => {
        const codes = TOWER_INIT.map((d) => d.code);
        const pick = {};
        codes.forEach((c) => { if (Math.random() < 0.5) pick[c] = true; });
        return pick;
      });
      setTimeout(() => setFlash({}), 480);
    }, Math.max(700, 1500 / speed));
    return () => clearInterval(iv);
  }, [speed, paused]);

  // ---- lap advance ----
  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      setLap((l) => {
        if (l >= total) {
          // new race start — re-spread the field
          setDrivers(TOWER_INIT.map((d) => ({ ...d, t: d.gap })));
          return 1;
        }
        return l + 1;
      });
    }, Math.max(1600, 4600 / speed));
    return () => clearInterval(iv);
  }, [speed, paused]);

  const sorted = [...drivers].sort((a, b) => a.t - b.t);
  const minT = sorted[0].t;

  return (
    <div className="tower">
      <div className="tower-head">
        <div className="sess">
          Canadian GP <span className="mono">·</span>{" "}
          <span className="lap num">LAP {String(lap).padStart(2, "0")} / {total}</span>
        </div>
        <div className="status">
          <span className="dot"></span>
          {lap >= total ? "FINISH" : "RACE"}
        </div>
      </div>
      <div className="tower-rows">
        {sorted.map((d, i) => {
          const team = TEAMS[d.team];
          const isLeader = i === 0;
          const gap = d.t - minT;
          return (
            <div
              key={d.code}
              ref={(el) => (rowRefs.current[d.code] = el)}
              className={"trow" + (isLeader ? " is-leader" : "")}
              style={{ "--tc": team.color }}
            >
              <div className="teambar"></div>
              <div className="pos num">{i + 1}</div>
              <div className="ident">
                <span className="code">{d.code}</span>
                <span className="team">{team.name}</span>
              </div>
              <div className={"gap" + (isLeader ? " leader" : "") + (flash[d.code] ? " tickflash" : "")}>
                {isLeader ? (
                  "LEADER"
                ) : (
                  <>
                    <DeltaMark size={9} color="var(--text-faint)" stroke />
                    <span>{fmtGap(gap)}</span>
                  </>
                )}
              </div>
              <div className="compound" style={{ "--tc": team.color }}>
                {d.compound}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { TimingTower });
