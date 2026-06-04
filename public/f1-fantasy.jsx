/* ============================================================
   F1 DELTA — interactive fantasy assistant
   ============================================================ */

const SQUAD_MAX = 5;

function FormCell({ p }) {
  const cls = p.dir === "up" ? "up" : p.dir === "down" ? "down" : "flat";
  const arr = p.dir === "up" ? "↑" : p.dir === "down" ? "↓" : "→";
  return (
    <span className={cls}>
      {arr} {p.form}
    </span>
  );
}

function Detail({ p }) {
  const team = TEAMS[p.team];
  return (
    <div className="fdetail" style={{ "--tc": team.color }}>
      <div className="dt-row"><span>FORM RATING</span><span className="v">{p.form} / 100</span></div>
      <div className="dt-row"><span>PROJ POINTS</span><span className="v">{p.proj}</span></div>
      <div className="dt-row"><span>VALUE / $1M</span><span className="v">{(p.proj / p.price).toFixed(2)}</span></div>
      <div className="dt-row"><span>6-RACE TREND</span><span className="v">{p.dir === "up" ? "Rising" : p.dir === "down" ? "Falling" : "Steady"}</span></div>
      <div className="dt-spark">
        {p.hist.map((h, i) => (
          <i key={i} style={{ height: (8 + h * 22) + "px", opacity: 0.35 + h * 0.5 }}></i>
        ))}
      </div>
    </div>
  );
}

function FantasySection() {
  const [selected, setSelected] = useState(() => new Set(DEFAULT_SELECTED));
  const [captain, setCaptain] = useState(DEFAULT_CAPTAIN);
  const [hover, setHover] = useState(null);
  const [flashFull, setFlashFull] = useState(false);

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (captain === id) setCaptain(next.size ? [...next][0] : null);
      } else {
        if (next.size >= SQUAD_MAX) {
          setFlashFull(true);
          setTimeout(() => setFlashFull(false), 1200);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  }, [captain]);

  const setCap = useCallback((id, e) => {
    e.stopPropagation();
    setSelected((prev) => {
      if (!prev.has(id)) {
        if (prev.size >= SQUAD_MAX) {
          setFlashFull(true);
          setTimeout(() => setFlashFull(false), 1200);
          return prev;
        }
        const next = new Set(prev);
        next.add(id);
        setCaptain(id);
        return next;
      }
      setCaptain(id);
      return prev;
    });
  }, []);

  const spent = PICKS.reduce((s, p) => (selected.has(p.id) ? s + p.price : s), 0);
  const remaining = FANTASY_BUDGET - spent;
  const over = remaining < 0;
  const projected = PICKS.reduce((s, p) => {
    if (!selected.has(p.id)) return s;
    return s + (captain === p.id ? p.proj * 2 : p.proj);
  }, 0);

  return (
    <section className="block" id="fantasy">
      <div className="wrap">
        <div className="sec-head">
          <div className="label">
            <DeltaMark size={20} color="var(--ferrari)" />
            Fantasy Assistant
          </div>
          <span className="tier-badge pro">Pro</span>
        </div>

        <div className="fan rise">
          <div className="fan-head">
            <div className="gp">Canadian GP · Race Weekend Picks</div>
            <div className="budget">
              <span>Budget <span className="val num">${FANTASY_BUDGET.toFixed(0)}M</span></span>
              <span className={"rem" + (over ? " over" : "")}>
                Remaining <span className="val num">${remaining.toFixed(1)}M</span>
              </span>
            </div>
          </div>

          <div className="fan-colhead">
            <span>#</span>
            <span>Driver</span>
            <span className="r">Price</span>
            <span className="r h-form">Form</span>
            <span className="r">Pick</span>
          </div>

          <div>
            {PICKS.map((p, i) => {
              const team = TEAMS[p.team];
              const isSel = selected.has(p.id);
              const isCap = captain === p.id;
              return (
                <div
                  key={p.id}
                  className={"frow" + (isSel ? " selected" : "") + (isCap ? " captain" : "")}
                  style={{ "--tc": team.color }}
                  onClick={() => toggle(p.id)}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover((h) => (h === p.id ? null : h))}
                >
                  <div className="fpos num">{i + 1}</div>
                  <div className="fdriver">
                    <span className="fname">
                      {p.name}
                      {p.value && <span className="value-tag">VALUE</span>}
                    </span>
                    <span className="fnote">
                      <span className="tname">{team.name}</span> · {p.note}
                    </span>
                  </div>
                  <div className="fprice num">
                    ${p.price.toFixed(1)}M
                    {hover === p.id && <Detail p={p} />}
                  </div>
                  <div className="fform num"><FormCell p={p} /></div>
                  <div className="fpick" onClick={(e) => e.stopPropagation()}>
                    <button
                      className={"pickbtn cstar" + (isCap ? " cap" : "")}
                      title="Set as captain (2× points)"
                      onClick={(e) => setCap(p.id, e)}
                      style={{ minWidth: 0, padding: "7px 10px" }}
                    >
                      C
                    </button>
                    <button
                      className={"pickbtn" + (isSel ? " on" : "") + (isCap ? " cap" : "") + (team.dark ? " dark-tc" : "")}
                      style={{ minWidth: 88, marginLeft: 6 }}
                      onClick={(e) => { e.stopPropagation(); toggle(p.id); }}
                    >
                      {isCap ? "Captain" : isSel ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fan-foot">
            <span className="hint">
              {flashFull
                ? "Squad full — deselect a driver to swap one in."
                : `${selected.size} / ${SQUAD_MAX} selected · tap a row to add · “C” sets your 2× captain`}
            </span>
            <span className="proj">
              Projected <b className="num">{projected}</b> pts
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { FantasySection });
