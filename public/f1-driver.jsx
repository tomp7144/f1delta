/* ============================================================
   F1 DELTA — driver page (split-tier, light reference template)
   Renders into #root. Public page: free facts for everyone,
   Pro teammate H2H behind a fade gate. Tier is decided by the
   server (/api/driver?d=) from the token; this file reacts to
   data.pro. Standalone light styling — does not use the dark
   site CSS. Self-contained (own hooks, own chrome).
   ============================================================ */
const { useState, useEffect } = React;

const TEAM = {
  red_bull:"#3671C6", toro_rosso:"#4562FF", rb:"#6692FF", ferrari:"#E8002D",
  mclaren:"#FF8000", mercedes:"#27F4D2", williams:"#64C4FF", aston_martin:"#229971",
  alpine:"#0093CC", haas:"#B6BABD", sauber:"#52E252", renault:"#FFF500",
  racing_point:"#F596C8", force_india:"#F596C8", lotus_f1:"#FFB800", brawn:"#B8FD6E",
};
const ac = (id) => TEAM[id] || "#9aa0ab";
const fmt = (n) => (n % 1 === 0 ? String(n) : n.toFixed(1));

const TOKEN_KEY = "f1delta_token"; // matches f1-access.js
function readToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }

async function fetchDriver(slug) {
  const token = readToken();
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  const res = await fetch(`/api/driver?d=${encodeURIComponent(slug)}`, { headers });
  if (res.status === 404) { const e = new Error("nf"); e.code = 404; throw e; }
  if (res.status === 400) { const e = new Error("bad"); e.code = 400; throw e; }
  if (!res.ok) throw new Error("fail");
  return res.json();
}

function Styles() {
  return (
    <style>{`
      :root{--bg:#f4f4f1;--surface:#fff;--ink:#15171c;--dim:#5b606b;--faint:#9398a3;--line:#e4e4de;--line2:#eeeee9;--red:#e10600;--champ:#fbf5e3;--champ-edge:#c9a227;--disp:"Barlow Condensed",system-ui,sans-serif;--body:"Inter",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,monospace;}
      .dp *{box-sizing:border-box}
      .dp{background:var(--bg);color:var(--ink);font-family:var(--body);-webkit-font-smoothing:antialiased;line-height:1.4;min-height:100vh}
      .dp a{color:inherit;text-decoration:none}
      .dp .wrap{max-width:760px;margin:0 auto;padding:0 12px}
      .dp table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}

      .dp .top{border-bottom:1px solid var(--line);background:var(--surface)}
      .dp .top .wrap{display:flex;align-items:center;justify-content:space-between;height:48px}
      .dp .brand{display:flex;align-items:center;gap:6px;font-family:var(--disp);font-weight:700;font-size:18px;letter-spacing:.02em}
      .dp .brand .d{color:var(--red)}
      .dp .topnav{display:flex;gap:16px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
      .dp .topnav a.on{color:var(--ink);font-weight:700}

      .dp .id{background:var(--surface);border-bottom:1px solid var(--line)}
      .dp .id .wrap{padding:16px 12px 14px}
      .dp .id-row{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
      .dp .id .code{font-family:var(--disp);font-weight:700;font-size:34px;line-height:1;color:var(--red)}
      .dp .id h1{font-family:var(--disp);font-weight:700;font-size:34px;line-height:1;letter-spacing:-.01em}
      .dp .id .meta{font-family:var(--mono);font-size:11px;color:var(--dim);margin-top:8px}
      .dp .id .meta b{color:var(--ink)}
      .dp .totals{display:flex;flex-wrap:wrap;margin-top:14px;border:1px solid var(--line);border-radius:5px;overflow:hidden;background:var(--surface)}
      .dp .totals .t{flex:1 1 0;min-width:62px;padding:9px 10px;border-right:1px solid var(--line2)}
      .dp .totals .t:last-child{border-right:0}
      .dp .totals .v{font-family:var(--disp);font-weight:700;font-size:22px;line-height:1}
      .dp .totals .v.g{color:var(--champ-edge)}
      .dp .totals .k{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-top:4px}

      .dp section{margin-top:18px}
      .dp .sec-h{display:flex;align-items:baseline;justify-content:space-between;padding:0 2px 7px}
      .dp .sec-h h2{font-family:var(--disp);font-weight:700;font-size:15px;letter-spacing:.06em;text-transform:uppercase}
      .dp .sec-h .hint{font-family:var(--mono);font-size:10px;color:var(--faint)}
      .dp .sec-h .protag{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--red);border:1px solid var(--red);border-radius:3px;padding:2px 6px}
      .dp .card{background:var(--surface);border:1px solid var(--line);border-radius:6px;overflow:hidden}

      .dp thead th{font-family:var(--mono);font-size:9.5px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);text-align:right;padding:9px 8px;border-bottom:1px solid var(--line);white-space:nowrap;cursor:pointer;user-select:none}
      .dp thead th.l{text-align:left}
      .dp thead th:hover{color:var(--dim)}
      .dp thead th.s{color:var(--ink)}
      .dp tbody td{font-family:var(--mono);font-size:12.5px;padding:9px 8px;border-bottom:1px solid var(--line2);text-align:right;color:var(--dim);white-space:nowrap}
      .dp tbody tr:last-child td{border-bottom:0}
      .dp tbody tr:hover td{background:#faf9f6}
      .dp td.yr{text-align:left;color:var(--ink);font-weight:500}
      .dp td.yr a{color:inherit;text-decoration:none}
      .dp td.yr a:hover{color:var(--red)}
      .dp td.tm{text-align:left;font-family:var(--body);font-size:13px;color:var(--ink);max-width:0;overflow:hidden;text-overflow:ellipsis}
      .dp td.tm a:hover{color:var(--red)}
      .dp td.tm .dot{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:7px;vertical-align:middle}
      .dp td.tm .alt{color:var(--faint);font-size:11px}
      .dp td.n.strong,.dp td.n.hot{color:var(--ink);font-weight:600}
      .dp td.wdc{color:var(--ink)}
      .dp td.wdc.t{color:var(--champ-edge);font-weight:700}
      .dp tr.champ td{background:var(--champ)}
      .dp tr.champ td.yr{box-shadow:inset 3px 0 0 var(--champ-edge)}

      .dp td.who{text-align:left;font-family:var(--body);font-size:13px;color:var(--ink);line-height:1.25;max-width:0;overflow:hidden}
      .dp td.who a{font-weight:600}
      .dp td.who a:hover{color:var(--red)}
      .dp td.who .ys{display:block;font-family:var(--mono);font-size:10px;color:var(--faint);margin-top:2px}
      .dp td.h2{text-align:left;min-width:74px}
      .dp td.h2 .sc{font-size:12.5px;color:var(--dim)}
      .dp td.h2 .sc b{color:var(--ink);font-weight:700}
      .dp td.h2 .bar{display:block;height:4px;border-radius:2px;background:var(--line);margin-top:5px;overflow:hidden;max-width:70px}
      .dp td.h2 .bar i{display:block;height:100%;background:var(--red);opacity:.78}
      .dp td.pts{min-width:64px}
      .dp td.pts b{color:var(--ink);font-weight:700;font-size:12.5px}
      .dp td.pts .vs{display:block;color:var(--faint);font-size:11px;margin-top:2px}
      .dp td.pts .vs::before{content:"vs "}

      .dp .adslot{margin-top:18px;height:96px;border:1px dashed var(--line);border-radius:6px;background:repeating-linear-gradient(45deg,#fff,#fff 10px,#fbfbf9 10px,#fbfbf9 20px);display:flex;align-items:center;justify-content:center}
      .dp .adslot span{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--faint)}

      .dp .gatewrap{position:relative}
      .dp .gatecard{max-height:240px;overflow:hidden}
      .dp .gate{position:absolute;left:0;right:0;bottom:0;top:84px;background:linear-gradient(180deg,rgba(244,244,241,0) 0%,rgba(244,244,241,.82) 42%,var(--bg) 70%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:0 14px 18px}
      .dp .gpanel{background:var(--surface);border:1px solid var(--line);border-radius:9px;box-shadow:0 16px 38px -16px rgba(0,0,0,.30);padding:15px 22px 17px;max-width:340px;width:100%;display:flex;flex-direction:column;align-items:center}
      .dp .gate .lock{font-family:var(--mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--red);margin-bottom:7px}
      .dp .gate h3{font-family:var(--disp);font-weight:700;font-size:21px;letter-spacing:.01em;line-height:1}
      .dp .gate p{font-family:var(--body);font-size:12px;color:var(--dim);margin-top:6px;max-width:34ch}
      .dp .gate .go{margin-top:12px;display:inline-flex;align-items:center;gap:8px;font-family:var(--disp);font-weight:700;font-size:15px;letter-spacing:.02em;color:#fff;background:var(--red);border:0;border-radius:4px;padding:11px 20px;cursor:pointer}
      .dp .gate .fine{font-family:var(--mono);font-size:10px;color:var(--faint);margin-top:9px}
      .dp .sk{display:inline-block;height:10px;border-radius:3px;background:var(--line2)}

      .dp .state{padding:clamp(70px,16vh,170px) 0;text-align:center;font-family:var(--mono);font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint)}
      .dp .foot{font-family:var(--mono);font-size:10px;color:var(--faint);text-align:center;padding:24px 0 32px}
      .dp .foot b{color:var(--dim)}
      @media (min-width:560px){.dp .id .code,.dp .id h1{font-size:42px}.dp tbody td{font-size:13px;padding:10px 11px}.dp thead th{padding:10px 11px}}
      .dp .eng-card{padding:12px 14px}
      .dp .eng-cur{border-left:3px solid var(--red);padding-left:10px;margin-bottom:2px}
      .dp .eng-name{font-family:var(--body);font-size:13px;color:var(--ink);font-weight:600}
      .dp .eng-name:hover{color:var(--red)}
      .dp .eng-meta{font-family:var(--mono);font-size:11px;color:var(--dim);display:block;margin-top:2px}
      .dp .eng-meta a{color:var(--dim)}
      .dp .eng-meta a:hover{color:var(--ink)}
      .dp .eng-note{font-family:var(--body);font-size:12px;color:var(--faint);font-style:italic;display:block;margin-top:5px}
      .dp .eng-past{margin-top:10px;border-top:1px solid var(--line);padding-top:8px}
      .dp .eng-past-row{padding:5px 0;border-bottom:1px solid var(--line2)}
      .dp .eng-past-row:last-child{border-bottom:none}
    `}</style>
  );
}

function TopBar() {
  return (
    <div className="top"><div className="wrap">
      <a className="brand" href="/">F1<svg className="d" width="11" height="10" viewBox="0 0 100 86"><path d="M50 4 L97 82 L3 82 Z" fill="currentColor"/></svg>DELTA</a>
      <nav className="topnav"><a href="/drivers" className="on">Drivers</a><a href="/#standings">Standings</a><a href="/records">Records</a><a href="/teams">Teams</a><a href="/engineers">Engineers</a><a href="/pro">Pro</a></nav>
    </div></div>
  );
}

function Identity({ d }) {
  const titles = d.career.filter((s) => s.wdcFinish === 1).length;
  const active = d.lastSeason >= 2026;
  const stats = [
    ["Starts", d.totals.races, false], ["Wins", d.totals.wins, false], ["Podiums", d.totals.podiums, false],
    ["Poles", d.totals.poles, false], ["Titles", titles, titles > 0], ["Points", fmt(d.totals.points), false],
  ];
  return (
    <div className="id"><div className="wrap">
      <div className="id-row"><span className="code">{d.code || "—"}</span><h1>{d.name}</h1></div>
      <div className="meta">{d.firstSeason}{active ? "–present" : `–${d.lastSeason}`}</div>
      <div className="totals">
        {stats.map(([k, v, g]) => (
          <div className="t" key={k}><div className={"v" + (g ? " g" : "")}>{v}</div><div className="k">{k}</div></div>
        ))}
      </div>
    </div></div>
  );
}

const CAREER_COLS = [
  { k: "season", label: "Season", cls: "l" }, { k: "team", label: "Team", cls: "l" },
  { k: "races", label: "R" }, { k: "wins", label: "Win" }, { k: "podiums", label: "Pod" },
  { k: "poles", label: "Pole" }, { k: "points", label: "Pts" }, { k: "wdc", label: "WDC" },
];

function CareerTable({ d }) {
  const [sort, setSort] = useState({ k: "season", asc: true });
  function click(k) {
    const numeric = k !== "season" && k !== "team";
    setSort((s) => (s.k === k ? { k, asc: !s.asc } : { k, asc: !numeric }));
  }
  const rows = [...d.career].sort((a, b) => {
    const { k, asc } = sort;
    if (k === "team") { const r = a.primaryTeam.localeCompare(b.primaryTeam); return asc ? r : -r; }
    const map = { season: "season", races: "races", wins: "wins", podiums: "podiums", poles: "poles", points: "points", wdc: "wdcFinish" };
    return asc ? a[map[k]] - b[map[k]] : b[map[k]] - a[map[k]];
  });
  return (
    <section>
      <div className="sec-h"><h2>Season by season</h2><span className="hint">tap a header to sort</span></div>
      <div className="card"><table>
        <thead><tr>
          {CAREER_COLS.map((c) => (
            <th key={c.k} className={(c.cls || "") + (sort.k === c.k ? " s" : "")} onClick={() => click(c.k)}>{c.label}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((s) => {
            const champ = s.wdcFinish === 1;
            const others = s.teams.filter((t) => t.constructorId !== s.primaryTeamId);
            return (
              <tr key={s.season} className={champ ? "champ" : ""}>
                <td className="yr"><a href={`/standings/${s.season}`}>{s.season}</a></td>
                <td className="tm"><span className="dot" style={{ background: ac(s.primaryTeamId) }} /><a href={"/teams/" + s.primaryTeamId}>{s.primaryTeam}</a>{others.length ? <span className="alt"> +{others.map((t, i) => <span key={t.constructorId}>{i > 0 ? ", " : ""}<a href={"/teams/" + t.constructorId}>{t.constructor}</a></span>)}</span> : null}</td>
                <td className="n">{s.races}</td>
                <td className={"n" + (s.wins ? " hot" : "")}>{s.wins}</td>
                <td className="n">{s.podiums}</td>
                <td className="n">{s.poles}</td>
                <td className="n strong">{fmt(s.points)}</td>
                <td className={"wdc" + (champ ? " t" : "")}>P{s.wdcFinish}</td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </section>
  );
}

function yrRange(ys) {
  if (!ys || !ys.length) return "";
  return ys.length === 1 ? `'${String(ys[0]).slice(2)}` : `'${String(Math.min(...ys)).slice(2)}–'${String(Math.max(...ys)).slice(2)}`;
}
function H2HRow({ code, t }) {
  const a = t.aggregate;
  const qp = a.qualiAhead + a.qualiBehind ? Math.round(a.qualiAhead / (a.qualiAhead + a.qualiBehind) * 100) : 50;
  const rp = a.raceAhead + a.raceBehind ? Math.round(a.raceAhead / (a.raceAhead + a.raceBehind) * 100) : 50;
  return (
    <tr>
      <td className="who"><a href={`/driver?d=${t.teammateId}`}>{t.teammate}</a><span className="ys">{yrRange(t.seasonsShared)} · {a.races}r</span></td>
      <td className="h2"><span className="sc"><b>{a.qualiAhead}</b>–{a.qualiBehind}</span><span className="bar"><i style={{ width: qp + "%" }} /></span></td>
      <td className="h2"><span className="sc"><b>{a.raceAhead}</b>–{a.raceBehind}</span><span className="bar"><i style={{ width: rp + "%" }} /></span></td>
      <td className="pts"><b>{fmt(a.pointsSelf)}</b><span className="vs">{fmt(a.pointsMate)}</span></td>
    </tr>
  );
}
function H2HHead() {
  return <thead><tr><th className="l">Teammate</th><th className="l">Qualifying</th><th className="l">Race</th><th className="l">Points</th></tr></thead>;
}

function H2HPro({ d }) {
  const sorted = [...d.teammates].sort((a, b) => b.aggregate.races - a.aggregate.races);
  return (
    <section>
      <div className="sec-h"><h2>Teammates, head to head</h2><span className="hint">most races first</span></div>
      <div className="card"><table><H2HHead />
        <tbody>{sorted.map((t) => <H2HRow key={t.teammateId} code={d.code} t={t} />)}</tbody>
      </table></div>
    </section>
  );
}

function GhostRow() {
  const w = () => 40 + Math.floor(Math.random() * 40);
  return (
    <tr>
      <td className="who"><span className="sk" style={{ width: w() + "px" }} /></td>
      <td className="h2"><span className="sk" style={{ width: "44px" }} /></td>
      <td className="h2"><span className="sk" style={{ width: "40px" }} /></td>
      <td className="pts"><span className="sk" style={{ width: "48px" }} /></td>
    </tr>
  );
}

function EngineerSection({ engineer }) {
  const current = engineer?.current ?? null;
  const past = Array.isArray(engineer?.past) ? engineer.past : [];
  if (!current && past.length === 0) return null;
  return (
    <section>
      <div className="sec-h"><h2>Race engineer</h2></div>
      <div className="card eng-card">
        {current && (
          <div className="eng-cur">
            <a className="eng-name" href={`/people/${current.personId}`}>
              {current.personName}{current.aka ? ` "${current.aka}"` : ""}
            </a>
            <span className="eng-meta">
              <a href={`/teams/${current.teamId}`}>{current.teamName}</a>{" · since "}{current.fromYear}
            </span>
            {current.notes && <span className="eng-note">{current.notes}</span>}
          </div>
        )}
        {past.length > 0 && (
          <div className="eng-past">
            {past.map((p, i) => (
              <div className="eng-past-row" key={i}>
                <a className="eng-name" href={`/people/${p.personId}`}>
                  {p.personName}{p.aka ? ` "${p.aka}"` : ""}
                </a>
                <span className="eng-meta">
                  <a href={`/teams/${p.teamId}`}>{p.teamName}</a>
                  {" · "}{p.fromYear === p.toYear ? p.fromYear : `${p.fromYear}–${p.toYear}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function H2HGate({ d }) {
  const teaser = d.teammateTeaser;
  const more = Math.max(0, (d.teammateCount || 1) - 1);
  return (
    <section>
      <div className="sec-h"><h2>Teammates, head to head</h2><span className="protag">Pro</span></div>
      <div className="gatewrap">
        <div className="card gatecard"><table><H2HHead />
          <tbody>
            {teaser ? <H2HRow code={d.code} t={teaser} /> : null}
            <GhostRow /><GhostRow /><GhostRow /><GhostRow />
          </tbody>
        </table></div>
        <div className="gate">
          <div className="gpanel">
            <div className="lock">🔒 {more} more teammate{more === 1 ? "" : "s"}</div>
            <h3>Unlock more with Pro</h3>
            <p>Every teammate battle, race engineer, and salary — for all drivers.</p>
            <a className="go" href="/pro">Go Pro · $9/mo →</a>
            <div className="fine">cancel anytime</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DriverPage() {
  const [st, setSt] = useState({ s: "loading", d: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (window.F1Access && window.F1Access.ready) { try { await window.F1Access.ready; } catch (e) {} }
        const slug = (new URLSearchParams(location.search).get("d") || "").toLowerCase();
        if (!slug) { if (alive) setSt({ s: "noslug", d: null }); return; }
        const d = await fetchDriver(slug);
        if (alive) setSt({ s: "ready", d });
      } catch (e) {
        if (alive) setSt({ s: e.code === 404 ? "notfound" : "error", d: null });
      }
    })();
    return () => { alive = false; };
  }, []);

  const { s, d } = st;
  return (
    <div className="dp">
      <Styles />
      <TopBar />
      {s === "loading" && <div className="state">Loading…</div>}
      {s === "noslug" && <div className="state">No driver selected</div>}
      {s === "notfound" && <div className="state">Driver not found</div>}
      {s === "error" && <div className="state">Couldn’t load this driver — refresh to retry</div>}
      {s === "ready" && d && (
        <>
          <Identity d={d} />
          <div className="wrap">
            <CareerTable d={d} />
            <EngineerSection engineer={d.engineer} />
            {!d.pro && <div className="adslot"><span>Advertisement</span></div>}
            {d.pro ? <H2HPro d={d} /> : <H2HGate d={d} />}
            <div className="foot">F1 <b>Δ</b> DELTA · data via F1DB · unofficial</div>
          </div>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DriverPage />);
