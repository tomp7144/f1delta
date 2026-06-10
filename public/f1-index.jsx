/* ============================================================
   F1 DELTA — driver index (public)
   Renders into #root. Fetches the public index from
   /api/driver?list=1 and links each driver to /driver?d=<id>
   (those pages are Pro-gated). Requires f1-shared.jsx first.
   ============================================================ */

function IndexStyles() {
  return (
    <style>{`
      .ix-wrap { padding-top:clamp(24px,4vw,46px); }
      .ix-head h1 { font-family:var(--disp); font-weight:700; font-size:clamp(38px,6vw,76px); line-height:.9; letter-spacing:-.01em; color:var(--text); }
      .ix-head h1 .accent { color:var(--ferrari); }
      .ix-head p { font-family:var(--body); font-size:clamp(14px,1.1vw,16px); color:var(--text-dim); margin-top:14px; max-width:54ch; }

      .ix-controls { display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin-top:clamp(22px,3vw,32px); position:sticky; top:0; background:var(--bg); padding:14px 0; z-index:5; border-bottom:1px solid var(--line); }
      .ix-search { flex:1 1 260px; font-family:var(--mono); font-size:14px; color:var(--text); background:var(--surface-2); border:1px solid var(--line-2); border-radius:2px; padding:12px 14px; outline:none; transition:border-color .16s; }
      .ix-search:focus { border-color:var(--text-dim); }
      .ix-search::placeholder { color:var(--text-faint); letter-spacing:.04em; }
      .ix-sorts { display:flex; gap:6px; }
      .ix-sort { font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-dim); background:var(--surface-2); border:1px solid var(--line-2); border-radius:2px; padding:10px 13px; cursor:pointer; transition:.14s; }
      .ix-sort:hover { color:var(--text); }
      .ix-sort.on { color:var(--text); border-color:var(--text-dim); background:rgba(255,255,255,.04); }
      .ix-count { font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-faint); margin:14px 0 4px; }

      .ix-list { display:grid; grid-template-columns:repeat(2,1fr); gap:1px; background:var(--line); border:1px solid var(--line); border-radius:4px; overflow:hidden; }
      @media (max-width:720px){ .ix-list { grid-template-columns:1fr; } }
      .ix-row { display:flex; align-items:center; gap:14px; padding:13px 16px; background:var(--surface); text-decoration:none; transition:background .12s; }
      .ix-row:hover { background:rgba(255,255,255,.03); }
      .ix-row .code { font-family:var(--disp); font-weight:700; font-size:15px; letter-spacing:.04em; color:var(--ferrari); flex:0 0 46px; }
      .ix-row .meta { flex:1 1 auto; min-width:0; }
      .ix-row .nm { font-family:var(--body); font-weight:600; font-size:15px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .ix-row .sub { font-family:var(--mono); font-size:10.5px; letter-spacing:.06em; color:var(--text-faint); margin-top:3px; }
      .ix-row .wins { font-family:var(--disp); font-weight:700; font-size:15px; color:var(--text-dim); flex:0 0 auto; text-align:right; }
      .ix-row .wins.has { color:var(--gold); }
      .ix-row .wins .wl { font-family:var(--mono); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--text-ghost); display:block; }
      .ix-row .arr { color:var(--text-ghost); font-family:var(--mono); flex:0 0 auto; }

      .ix-empty { padding:60px 0; text-align:center; font-family:var(--mono); font-size:12px; letter-spacing:.1em; color:var(--text-faint); }
      .ix-load { padding:clamp(80px,16vh,180px) 0; text-align:center; font-family:var(--mono); font-size:12px; letter-spacing:.26em; text-transform:uppercase; color:var(--text-faint); }
    `}</style>
  );
}

function IndexHeader() {
  return (
    <header className="site-head" id="top">
      <div className="wrap">
        <Logo />
        <nav className="nav">
          <a href="/#history">History</a>
          <a href="/drivers" className="active">Drivers</a>
          <a href="/pro" className="pro-pill">Pro</a>
        </nav>
      </div>
    </header>
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

  const shown = React.useMemo(() => {
    if (!drivers) return [];
    const needle = q.trim().toLowerCase();
    let out = drivers;
    if (needle) {
      out = drivers.filter((d) =>
        d.name.toLowerCase().includes(needle) ||
        (d.code && d.code.toLowerCase().includes(needle))
      );
    }
    return [...out].sort(SORTS[sort].fn);
  }, [drivers, q, sort]);

  return (
    <>
      <IndexStyles />
      <IndexHeader />
      <main>
        <section className="block">
          <div className="wrap ix-wrap">
            <Eyebrow>Driver Archive</Eyebrow>
            <div className="ix-head" style={{ marginTop: "12px" }}>
              <h1>Every driver. <span className="accent">Every era.</span></h1>
              <p>Career records and teammate head-to-heads for {drivers ? drivers.length : "792"} drivers, 1950 to today. Pick one to open the full breakdown.</p>
            </div>

            {err && <div className="ix-empty">Couldn't load the archive. Refresh to try again.</div>}
            {!drivers && !err && <div className="ix-load">Loading the grid…</div>}

            {drivers && !err && (
              <>
                <div className="ix-controls">
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
                      <button
                        key={k}
                        className={"ix-sort" + (sort === k ? " on" : "")}
                        onClick={() => setSort(k)}
                      >{SORTS[k].label}</button>
                    ))}
                  </div>
                </div>

                <div className="ix-count">{shown.length} of {drivers.length}</div>

                {shown.length === 0
                  ? <div className="ix-empty">No driver matches “{q}”.</div>
                  : <div className="ix-list">{shown.map((d) => <DriverRow key={d.driverId} d={d} />)}</div>
                }
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<IndexPage />);
