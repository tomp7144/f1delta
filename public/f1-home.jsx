/* ============================================================
   F1 DELTA — home (light reference front door)
   Standalone light template (matches the driver page). Its job:
   get people INTO the data fast — search, latest result, standings,
   full-list link. Pro selling happens inline on the driver pages,
   not here. No dark site CSS, self-contained.

   Reads:
     /api/driver?list=1  → search + code→slug map (active drivers)
     /latest-race.json   → baked latest result
     /standings.json     → baked WDC standings (no live 3rd-party call)
   ============================================================ */
const { useState, useEffect } = React;
const fmt = (n) => { const x = Number(n); return Number.isFinite(x) ? (x % 1 === 0 ? String(x) : x.toFixed(1)) : n; };

async function loadIndex() {
  try { const r = await fetch("/api/driver?list=1"); if (!r.ok) return []; return (await r.json()).drivers || []; }
  catch (e) { return []; }
}
async function loadLatest() {
  try { const r = await fetch("/latest-race.json"); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; }
}
async function loadStandings() {
  try { const r = await fetch("/standings.json"); if (!r.ok) return null; const d = await r.json(); return Array.isArray(d) ? d : (d.standings || null); }
  catch (e) { return null; }
}

function Styles() {
  return (
    <style>{`
      :root{--bg:#f4f4f1;--surface:#fff;--ink:#15171c;--dim:#5b606b;--faint:#9398a3;--line:#e4e4de;--line2:#eeeee9;--red:#e10600;--gold:#c9a227;--disp:"Barlow Condensed",system-ui,sans-serif;--body:"Inter",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,monospace;}
      .hm *{box-sizing:border-box}
      .hm{background:var(--bg);color:var(--ink);font-family:var(--body);-webkit-font-smoothing:antialiased;line-height:1.4;min-height:100vh}
      .hm a{color:inherit;text-decoration:none}
      .hm .wrap{max-width:760px;margin:0 auto;padding:0 12px}
      .hm table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}

      .hm .top{border-bottom:1px solid var(--line);background:var(--surface)}
      .hm .top .wrap{display:flex;align-items:center;justify-content:space-between;height:48px}
      .hm .brand{display:flex;align-items:center;gap:6px;font-family:var(--disp);font-weight:700;font-size:18px;letter-spacing:.02em}
      .hm .brand .d{color:var(--red)}
      .hm .topnav{display:flex;gap:15px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
      .hm .topnav a:hover{color:var(--ink)}
      .hm .topnav a.on{color:var(--ink);font-weight:700}

      .hm .hero{background:var(--surface);border-bottom:1px solid var(--line)}
      .hm .hero .wrap{padding:clamp(26px,5vw,46px) 12px clamp(22px,4vw,34px)}
      .hm .hero h1{font-family:var(--disp);font-weight:700;font-size:clamp(30px,5vw,52px);line-height:.98;letter-spacing:-.01em}
      .hm .hero h1 .d{color:var(--red)}
      .hm .hero p{font-family:var(--body);font-size:14px;color:var(--dim);margin-top:9px;max-width:50ch}

      .hm .search{position:relative;margin-top:18px}
      .hm .search input{width:100%;font-family:var(--body);font-size:16px;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:14px 15px;outline:none;transition:border-color .15s}
      .hm .search input:focus{border-color:var(--ink)}
      .hm .search input::placeholder{color:var(--faint)}
      .hm .results{position:absolute;left:0;right:0;top:calc(100% + 6px);background:var(--surface);border:1px solid var(--line);border-radius:7px;box-shadow:0 18px 40px -18px rgba(0,0,0,.28);overflow:hidden;z-index:20}
      .hm .results a{display:flex;align-items:center;gap:11px;padding:11px 14px;border-bottom:1px solid var(--line2)}
      .hm .results a:last-child{border-bottom:0}
      .hm .results a:hover{background:#faf9f6}
      .hm .results .rc{font-family:var(--disp);font-weight:700;font-size:13px;color:var(--red);flex:0 0 38px;letter-spacing:.03em}
      .hm .results .rn{font-size:14px;font-weight:500}
      .hm .results .rs{margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--faint)}

      .hm section{margin-top:20px}
      .hm .sec-h{display:flex;align-items:baseline;justify-content:space-between;padding:0 2px 7px}
      .hm .sec-h h2{font-family:var(--disp);font-weight:700;font-size:15px;letter-spacing:.06em;text-transform:uppercase}
      .hm .sec-h a,.hm .sec-h span{font-family:var(--mono);font-size:10px;letter-spacing:.06em;color:var(--faint)}
      .hm .sec-h a:hover{color:var(--red)}
      .hm .card{background:var(--surface);border:1px solid var(--line);border-radius:6px;overflow:hidden}

      .hm thead th{font-family:var(--mono);font-size:9.5px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);text-align:right;padding:9px 10px;border-bottom:1px solid var(--line);white-space:nowrap}
      .hm thead th.l{text-align:left}
      .hm tbody td{font-family:var(--mono);font-size:12.5px;padding:10px;border-bottom:1px solid var(--line2);text-align:right;color:var(--dim);white-space:nowrap}
      .hm tbody tr:last-child td{border-bottom:0}
      .hm tbody tr.clik{cursor:pointer}
      .hm tbody tr.clik:hover td{background:#faf9f6}
      .hm td.pos{text-align:left;color:var(--ink);font-weight:600;width:34px}
      .hm td.pos.dnf{color:var(--faint)}
      .hm td.drv{text-align:left;font-family:var(--body)}
      .hm td.drv .dot{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:8px;vertical-align:middle}
      .hm td.drv .cc{font-family:var(--disp);font-weight:700;font-size:13px;letter-spacing:.03em;color:var(--ink)}
      .hm td.drv .tn{color:var(--faint);font-size:11px;margin-left:7px}
      .hm td.drv .go{color:var(--faint);font-family:var(--mono);font-size:11px;margin-left:6px;opacity:0}
      .hm tr.clik:hover td.drv .go{opacity:1;color:var(--red)}
      .hm td.gap{color:var(--dim)}
      .hm td.gap.lead{color:var(--ink);font-weight:600}
      .hm td.pts{color:var(--ink);font-weight:600;width:54px}
      .hm td.pts.zero{color:var(--faint);font-weight:400}

      .hm .links{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}
      @media (max-width:560px){.hm .links{grid-template-columns:1fr}}
      .hm .lk{display:flex;align-items:center;justify-content:space-between;background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:16px 16px}
      .hm .lk:hover{border-color:var(--ink)}
      .hm .lk .lt{font-family:var(--disp);font-weight:700;font-size:17px}
      .hm .lk .ls{font-family:var(--mono);font-size:10px;color:var(--faint);margin-top:3px;letter-spacing:.04em}
      .hm .lk .arr{font-family:var(--mono);color:var(--faint)}
      .hm .lk.soon{opacity:.72}
      .hm .lk.soon .tag{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);border:1px solid var(--gold);border-radius:3px;padding:2px 6px}

      .hm .state{padding:24px 0;text-align:center;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
      .hm .foot{font-family:var(--mono);font-size:10px;color:var(--faint);text-align:center;padding:26px 0 34px}
      .hm .foot b{color:var(--dim)}
      @media (min-width:560px){.hm tbody td{padding:11px 12px}}
    `}</style>
  );
}

function TopBar() {
  return (
    <div className="top"><div className="wrap">
      <a className="brand" href="/">F1<svg className="d" width="11" height="10" viewBox="0 0 100 86"><path d="M50 4 L97 82 L3 82 Z" fill="currentColor"/></svg>DELTA</a>
      <nav className="topnav"><a href="/drivers">Drivers</a><a href="#standings">Standings</a><a href="/grands-prix">GPs</a><a href="/circuits">Circuits</a><a href="/records">Records</a><a href="/teams">Teams</a><a href="/pro">Pro</a></nav>
    </div></div>
  );
}

function Search() {
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(null); // lazy — only fetched when the user engages search
  // Pull the full driver list on first focus, so the homepage never
  // pays for it on load. Cached after the first fetch.
  function ensureIndex() { if (index === null) { setIndex([]); loadIndex().then((d) => setIndex(d)); } }
  const needle = q.trim().toLowerCase();
  let matches = [];
  if (needle.length >= 2 && index && index.length) {
    matches = index
      .filter((d) => d.name.toLowerCase().includes(needle) || (d.code && d.code.toLowerCase().includes(needle)))
      .sort((a, b) => (b.lastSeason - a.lastSeason) || a.name.localeCompare(b.name))
      .slice(0, 8);
  }
  function go(id) { window.location.href = `/driver?d=${encodeURIComponent(id)}`; }
  function onKey(e) { if (e.key === "Enter" && matches[0]) go(matches[0].driverId); }
  return (
    <div className="search">
      <input type="text" placeholder="Search 792 drivers — Verstappen, Senna, HAM…" value={q}
        onFocus={ensureIndex} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} autoFocus />
      {matches.length > 0 && (
        <div className="results">
          {matches.map((d) => (
            <a key={d.driverId} href={`/driver?d=${d.driverId}`}>
              <span className="rc">{d.code || "—"}</span>
              <span className="rn">{d.name}</span>
              <span className="rs">{d.firstSeason}–{d.lastSeason}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultRow({ r, slug }) {
  const isDnf = r.dnf || r.position == null;
  const pos = isDnf ? "—" : r.position;
  const gap = r.leader ? "LEADER" : String(r.gap || "");
  const clickable = !!slug;
  const onClick = clickable ? () => { window.location.href = `/driver?d=${slug}`; } : undefined;
  return (
    <tr className={clickable ? "clik" : ""} onClick={onClick}>
      <td className={"pos" + (isDnf ? " dnf" : "")}>{pos}</td>
      <td className="drv"><span className="dot" style={{ background: r.teamColour || "#9aa0ab" }} /><span className="cc">{r.code}</span><span className="tn">{r.teamName}</span>{clickable ? <span className="go">→</span> : null}</td>
      <td className={"gap" + (r.leader ? " lead" : "")}>{gap}</td>
      <td className={"pts" + (r.points > 0 ? "" : " zero")}>{r.points > 0 ? `+${r.points}` : "0"}</td>
    </tr>
  );
}

function LatestResult({ data, codeMap }) {
  if (!data || !data.tower) return null;
  return (
    <section>
      <div className="sec-h"><h2>{data.session?.name || "Latest result"}</h2><span>Round {data.session?.round} · final</span></div>
      <div className="card"><table>
        <thead><tr><th className="l">P</th><th className="l">Driver</th><th>Gap</th><th>Pts</th></tr></thead>
        <tbody>{data.tower.map((r) => <ResultRow key={r.code} r={r} slug={codeMap[(r.code || "").toUpperCase()]} />)}</tbody>
      </table></div>
    </section>
  );
}

function StandingsRow({ s, slug }) {
  const clickable = !!slug;
  const onClick = clickable ? () => { window.location.href = `/driver?d=${slug}`; } : undefined;
  return (
    <tr className={clickable ? "clik" : ""} onClick={onClick}>
      <td className="pos">{s.pos}</td>
      <td className="drv"><span className="cc">{s.code}</span>{s.team ? <span className="tn">{s.team}</span> : null}{clickable ? <span className="go">→</span> : null}</td>
      <td className="pts">{s.points}</td>
    </tr>
  );
}

function Standings({ rows, codeMap }) {
  if (!rows || rows.length === 0) return null;
  return (
    <section id="standings">
      <div className="sec-h"><h2>2026 Championship</h2><span>WDC standings</span></div>
      <div className="card"><table>
        <thead><tr><th className="l">P</th><th className="l">Driver</th><th>Pts</th></tr></thead>
        <tbody>{rows.map((s) => <StandingsRow key={s.code} s={s} slug={codeMap[(s.code || "").toUpperCase()]} />)}</tbody>
      </table></div>
    </section>
  );
}

function LinkCards() {
  return (
    <div className="links">
      <a className="lk" href="/drivers">
        <span><span className="lt">All drivers</span><span className="ls">Every driver, 1950–now</span></span>
        <span className="arr">→</span>
      </a>
      <a className="lk" href="/records">
        <span><span className="lt">Records</span><span className="ls">All-time leaderboards, 1950–now</span></span>
        <span className="arr">→</span>
      </a>
      <a className="lk" href="/teams">
        <span><span className="lt">Teams</span><span className="ls">Constructor history &amp; records</span></span>
        <span className="arr">→</span>
      </a>
      <a className="lk" href="/engineers">
        <span><span className="lt">Race Engineers</span><span className="ls">Pitwall pairings, 1950–now</span></span>
        <span className="arr">→</span>
      </a>
      <a className="lk" href="/technical-directors">
        <span><span className="lt">Technical Directors</span><span className="ls">The tech minds behind the cars</span></span>
        <span className="arr">→</span>
      </a>
      <a className="lk" href="/principals">
        <span><span className="lt">Team Principals</span><span className="ls">Team leadership history</span></span>
        <span className="arr">→</span>
      </a>
      <a className="lk soon" href="#">
        <span><span className="lt">History &amp; eras</span><span className="ls">Champions, dynasties, rule resets</span></span>
        <span className="tag">Soon</span>
      </a>
      <a className="lk soon" href="#">
        <span><span className="lt">Fantasy</span><span className="ls">Picks, projections, captain math</span></span>
        <span className="tag">Soon</span>
      </a>
    </div>
  );
}

function HomePage() {
  const [latest, setLatest] = useState(null);
  const [standings, setStandings] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [lat, std] = await Promise.all([loadLatest(), loadStandings()]);
      if (!alive) return;
      setLatest(lat); setStandings(std); setLoaded(true);
    })();
    return () => { alive = false; };
  }, []);

  // code → slug for the current grid, baked to grid-map.js (no fetch).
  const codeMap = window.F1_GRID || {};

  return (
    <div className="hm">
      <Styles />
      <TopBar />
      <div className="hero"><div className="wrap">
        <h1>The F1 reference <span className="d">desk.</span></h1>
        <p>Every driver, every season, every teammate battle — one fast, clean place to settle it.</p>
        <Search />
      </div></div>
      <div className="wrap">
        {!loaded && <div className="state">Loading…</div>}
        {loaded && <LatestResult data={latest} codeMap={codeMap} />}
        {loaded && <Standings rows={standings} codeMap={codeMap} />}
        <LinkCards />
        <div className="foot">F1 <b>Δ</b> DELTA · data via F1DB &amp; OpenF1 · unofficial</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<HomePage />);
