/* ============================================================
   F1 DELTA — driver archive (light reference-desk theme)
   Self-contained. Fetches /api/driver?list=1.
   ============================================================ */
const { useState, useEffect, useMemo } = React;

function IndexStyles() {
  return (
    <style>{`
      .ix *{box-sizing:border-box}
      .ix{background:#f4f4f1;color:#16161a;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;line-height:1.4}
      .ix a{color:inherit;text-decoration:none}

      .ix .top{border-bottom:1px solid #e4e4df;background:#fff}
      .ix .top .wrap{display:flex;align-items:center;justify-content:space-between;height:48px;max-width:760px;margin:0 auto;padding:0 20px}
      .ix .brand{font-weight:700;color:#e10600;font-size:15px}
      .ix .topnav{display:flex;gap:20px;font-size:13px}
      .ix .topnav a{color:#6b6b70}
      .ix .topnav a:hover{color:#16161a}
      .ix .topnav a.on{color:#16161a;font-weight:600}

      .ix .page{max-width:760px;margin:0 auto;padding:28px 20px}
      .ix h1{font-size:clamp(24px,4vw,34px);font-weight:700;margin:0 0 4px;letter-spacing:-.01em;line-height:1.05}
      .ix h1 .accent{color:#e10600}
      .ix .lede{color:#6b6b70;font-size:15px;margin:0 0 18px}

      .ix .controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;position:sticky;top:0;background:#f4f4f1;padding:10px 0;z-index:5;border-bottom:1px solid #e4e4df;margin-bottom:8px}
      .ix-search{flex:1 1 200px;font-family:inherit;font-size:15px;color:#16161a;background:#fff;border:1px solid #e4e4df;border-radius:6px;padding:10px 14px;outline:none;transition:border-color .14s}
      .ix-search:focus{border-color:#16161a}
      .ix-search::placeholder{color:#9a9a9e}
      .ix-sorts{display:flex;gap:4px}
      .ix-sort{font-family:inherit;font-size:12px;color:#6b6b70;background:#fff;border:1px solid #e4e4df;border-radius:4px;padding:8px 12px;cursor:pointer;transition:.12s}
      .ix-sort:hover{color:#16161a}
      .ix-sort.on{color:#16161a;font-weight:600;border-color:#16161a}

      .ix-count{font-size:12px;color:#6b6b70;margin:6px 0;font-variant-numeric:tabular-nums}

      .ix-list{display:grid;grid-template-columns:1fr;gap:1px;background:#e4e4df;border:1px solid #e4e4df;border-radius:8px;overflow:hidden}
      .ix-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:#fff;text-decoration:none;color:#16161a}
      .ix-row:hover{background:#faf9f6}
      .ix-row .code{font-weight:700;font-size:13px;color:#e10600;flex:0 0 40px;letter-spacing:.02em}
      .ix-row .meta{flex:1;min-width:0}
      .ix-row .nm{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ix-row .sub{font-size:11px;color:#6b6b70;margin-top:2px;font-variant-numeric:tabular-nums}
      .ix-row .wins{font-size:14px;font-weight:600;color:#b4b4b9;flex:0 0 auto;text-align:right;font-variant-numeric:tabular-nums}
      .ix-row .wins.has{color:#c9a227}
      .ix-row .wins .wl{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#c4c4c9;display:block}
      .ix-row .arr{color:#c4c4c9;font-size:13px;flex:0 0 auto}

      .ix-empty{padding:48px;text-align:center;font-size:13px;color:#9a9a9e}
      .ix-load{padding:80px;text-align:center;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#9a9a9e}
      .ix-foot{font-size:12px;color:#9a9a9e;text-align:center;padding:20px 0 28px}

      .ix-callout{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff;border:1px solid #e4e4df;border-left:3px solid #e10600;border-radius:6px;padding:12px 16px;margin-bottom:18px;text-decoration:none;color:#16161a}
      .ix-callout:hover{border-color:#c4c4c9;border-left-color:#e10600}
      .ix-callout .cl-title{font-weight:600;font-size:14px}
      .ix-callout .cl-sub{font-size:12px;color:#6b6b70;margin-top:2px}
      .ix-callout .cl-arr{color:#e10600;font-size:14px;flex:0 0 auto}
    `}</style>
  );
}

function TopBar() {
  return (
    <div className="top"><div className="wrap">
      <a className="brand" href="/">f1delta</a>
      <nav className="topnav">
        <a href="/drivers" className="on">Drivers</a>
        <a href="/#standings">Standings</a>
        <a href="/records">Records</a>
        <a href="/teams">Teams</a>
        <a href="/pro">Pro</a>
      </nav>
    </div></div>
  );
}

const SORTS = {
  name:   { label: "A–Z",    fn: (a, b) => a.name.localeCompare(b.name) },
  recent: { label: "Recent", fn: (a, b) => b.lastSeason - a.lastSeason || a.name.localeCompare(b.name) },
  races:  { label: "Races",  fn: (a, b) => b.races - a.races },
  wins:   { label: "Wins",   fn: (a, b) => b.wins - a.wins || b.races - a.races },
};

function DriverRow({ d }) {
  const span = d.firstSeason === d.lastSeason ? `${d.firstSeason}` : `${d.firstSeason}–${d.lastSeason}`;
  return (
    <a className="ix-row" href={`/driver?d=${encodeURIComponent(d.driverId)}`}>
      <span className="code">{d.code || "—"}</span>
      <span className="meta">
        <span className="nm">{d.name}</span>
        <span className="sub">{span} · {d.races} race{d.races === 1 ? "" : "s"}</span>
      </span>
      <span className={"wins" + (d.wins > 0 ? " has" : "")}>
        {d.wins}<span className="wl">wins</span>
      </span>
      <span className="arr">→</span>
    </a>
  );
}

function IndexPage() {
  const [drivers, setDrivers] = useState(null);
  const [err, setErr] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/driver?list=1");
        if (!res.ok) throw new Error("list_failed");
        const data = await res.json();
        if (alive) setDrivers(data.drivers || []);
      } catch {
        if (alive) setErr(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const shown = useMemo(() => {
    if (!drivers) return [];
    const needle = q.trim().toLowerCase();
    const out = needle
      ? drivers.filter((d) => d.name.toLowerCase().includes(needle) || (d.code && d.code.toLowerCase().includes(needle)))
      : drivers;
    return [...out].sort(SORTS[sort].fn);
  }, [drivers, q, sort]);

  return (
    <div className="ix">
      <IndexStyles />
      <TopBar />
      <div className="page">
        <h1>Every driver. <span className="accent">Every era.</span></h1>
        <p className="lede">Career records and teammate head-to-heads for {drivers ? drivers.length : "…"} drivers, 1950 to today. Pick one to open the full breakdown.</p>

        <a className="ix-callout" href="/drivers/never-started">
          <span>
            <span className="cl-title">Close But No Cigar</span>
            <span className="cl-sub">123 drivers entered a Grand Prix but never started one →</span>
          </span>
        </a>

        {err && <div className="ix-empty">Couldn't load the archive. Refresh to try again.</div>}
        {!drivers && !err && <div className="ix-load">Loading the grid…</div>}

        {drivers && !err && (
          <>
            <div className="controls">
              <input
                className="ix-search"
                type="text"
                placeholder="Search a driver…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
              />
              <div className="ix-sorts">
                {Object.keys(SORTS).map((k) => (
                  <button key={k} className={"ix-sort" + (sort === k ? " on" : "")} onClick={() => setSort(k)}>
                    {SORTS[k].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ix-count">{shown.length} of {drivers.length}</div>

            {shown.length === 0
              ? <div className="ix-empty">No driver matches "{q}".</div>
              : <div className="ix-list">{shown.map((d) => <DriverRow key={d.driverId} d={d} />)}</div>
            }
          </>
        )}
        <div className="ix-foot">F1 Δ DELTA · data via F1DB · unofficial</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<IndexPage />);
