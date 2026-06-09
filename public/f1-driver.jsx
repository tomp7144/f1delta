/* ============================================================
   F1 DELTA — driver page (gated)
   Renders into #root. Reads ONE driver from the gated function
   /.netlify/functions/driver?d=<driverId>. Access state comes from
   window.F1Access (same as f1-pro.jsx). Requires f1-shared.jsx first
   (Logo / DeltaMark / Eyebrow + the shared React hook declarations).

   URL: /driver?d=max_verstappen   (slug == driverId)
   ============================================================ */

/* Cosmetic team accents — fallback to a neutral line when unknown.
   Not the source of truth for colours; purely visual on career rows. */
const TEAM_AC = {
  ferrari: "var(--ferrari)", mclaren: "var(--mclaren)", mercedes: "var(--mercedes)",
  red_bull: "#3671C6", williams: "#37BEDD", aston_martin: "#229971",
  alpine: "#0093CC", haas: "#B6BABD", sauber: "#52E252", rb: "#6692FF",
  toro_rosso: "#469BFF", racing_point: "#F596C8", renault: "#FFF500",
};
const acFor = (id) => TEAM_AC[id] || "var(--text-faint)";

/* ---- driver data fetch -------------------------------------------
   Sends the same token f1-access.js stores in localStorage
   ("f1delta_token") as a Bearer header. The /api/driver function
   verifies it via the shared lib/access.mjs, same as check-access. */
const TOKEN_KEY = "f1delta_token"; // must match f1-access.js
function readToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; }
}
async function fetchDriver(slug) {
  const token = readToken();
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  const res = await fetch(`/api/driver?d=${encodeURIComponent(slug)}`, { headers });
  if (res.status === 401) { const e = new Error("locked"); e.locked = true; throw e; }
  if (!res.ok) throw new Error(`fetch_failed_${res.status}`);
  return res.json();
}

function DriverStyles() {
  return (
    <style>{`
      .dp-wrap { padding-top:clamp(24px,4vw,46px); }

      /* hero */
      .dp-hero { display:flex; align-items:flex-end; gap:clamp(16px,2.4vw,28px); flex-wrap:wrap; }
      .dp-code { font-family:var(--disp); font-weight:700; font-size:clamp(40px,7vw,86px); line-height:.8; letter-spacing:.02em; color:var(--ferrari); }
      .dp-name h1 { font-family:var(--disp); font-weight:700; font-size:clamp(30px,4.4vw,58px); line-height:.92; letter-spacing:-.01em; color:var(--text); }
      .dp-name .sub { font-family:var(--mono); font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-dim); margin-top:9px; }

      .dp-totals { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:1px; background:var(--line); border:1px solid var(--line); border-radius:4px; overflow:hidden; margin-top:clamp(22px,3vw,32px); }
      @media (max-width:680px){ .dp-totals { grid-template-columns:repeat(3,1fr); } }
      .dp-stat { background:var(--surface); padding:15px 14px; }
      .dp-stat .v { font-family:var(--disp); font-weight:700; font-size:clamp(22px,2.4vw,30px); color:var(--text); line-height:1; }
      .dp-stat .v.gold { color:var(--gold); }
      .dp-stat .k { font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--text-faint); margin-top:7px; }

      .dp-sec { margin-top:clamp(40px,6vw,72px); }
      .dp-sec .sec-head { display:flex; align-items:center; gap:12px; margin-bottom:clamp(14px,2vw,20px); }
      .dp-sec .sec-head .label { display:flex; align-items:center; gap:9px; font-family:var(--disp); font-weight:700; font-size:18px; letter-spacing:.05em; text-transform:uppercase; color:var(--text); }

      /* career table */
      .dp-tbl { width:100%; border-collapse:collapse; font-family:var(--mono); font-size:13px; }
      .dp-tbl th { text-align:right; font-weight:500; font-size:10px; letter-spacing:.13em; text-transform:uppercase; color:var(--text-faint); padding:9px 10px; border-bottom:1px solid var(--line); }
      .dp-tbl th.l, .dp-tbl td.l { text-align:left; }
      .dp-tbl td { text-align:right; padding:11px 10px; border-bottom:1px solid var(--line); color:var(--text-dim); white-space:nowrap; }
      .dp-tbl tr:hover td { background:rgba(255,255,255,.02); }
      .dp-tbl td.yr { color:var(--text); font-weight:600; }
      .dp-tbl td.team { color:var(--text); }
      .dp-tbl td.team .dot { display:inline-block; width:8px; height:8px; border-radius:2px; margin-right:8px; vertical-align:middle; background:var(--ac,var(--text-faint)); }
      .dp-tbl td.team .more { color:var(--text-faint); font-size:11px; }
      .dp-tbl td.wdc .p { color:var(--text); }
      .dp-tbl td.wdc .p.champ { color:var(--gold); font-weight:700; }
      .dp-tbl td.hl { color:var(--text); font-weight:600; }

      /* H2H tiles */
      .dp-h2h { display:grid; grid-template-columns:repeat(2,1fr); gap:clamp(12px,1.6vw,18px); }
      @media (max-width:760px){ .dp-h2h { grid-template-columns:1fr; } }
      .h2h { border:1px solid var(--line); border-radius:4px; background:linear-gradient(180deg,var(--surface) 0%,var(--bg-2) 100%); padding:clamp(16px,2vw,20px); }
      .h2h-top { display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:16px; }
      .h2h-top .nm { font-family:var(--disp); font-weight:700; font-size:19px; color:var(--text); letter-spacing:.01em; }
      .h2h-top .yrs { font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-faint); }

      .h2h-row { margin-bottom:14px; }
      .h2h-row .lab { display:flex; align-items:baseline; justify-content:space-between; font-family:var(--mono); font-size:10px; letter-spacing:.13em; text-transform:uppercase; color:var(--text-faint); margin-bottom:6px; }
      .h2h-row .lab .score { color:var(--text); font-size:13px; letter-spacing:.02em; }
      .h2h-row .lab .score b { color:var(--ferrari); }
      .h2h-bar { display:flex; height:9px; border-radius:2px; overflow:hidden; background:var(--surface-2); }
      .h2h-bar .me { background:var(--ferrari); }
      .h2h-bar .them { background:var(--text-faint); opacity:.5; }

      .h2h-pts { display:flex; align-items:center; justify-content:space-between; margin-top:16px; padding-top:13px; border-top:1px solid var(--line); font-family:var(--mono); font-size:11px; letter-spacing:.06em; color:var(--text-faint); }
      .h2h-pts .pv { font-family:var(--disp); font-weight:700; font-size:17px; letter-spacing:0; }
      .h2h-pts .pv.me { color:var(--text); }
      .h2h-pts .pv.them { color:var(--text-dim); }

      .dp-load { padding:clamp(80px,16vh,180px) 0; text-align:center; font-family:var(--mono); font-size:12px; letter-spacing:.26em; text-transform:uppercase; color:var(--text-faint); }
      .dp-err { padding:clamp(60px,12vh,140px) 0; text-align:center; }
      .dp-err p { font-family:var(--mono); font-size:13px; letter-spacing:.04em; color:var(--text-dim); }
      .dp-err .btn { margin-top:20px; }
    `}</style>
  );
}

const fmt = (n) => (n % 1 === 0 ? String(n) : n.toFixed(1));

function DriverHero({ d }) {
  const champs = d.career.filter((s) => s.wdcFinish === 1).length;
  const t = d.totals;
  const stats = [
    ["Races", t.races, false], ["Wins", t.wins, false], ["Podiums", t.podiums, false],
    ["Poles", t.poles, false], ["Points", fmt(t.points), false],
    ["Titles", champs, champs > 0],
  ];
  return (
    <div className="dp-hero rise">
      <div className="dp-code">{d.code}</div>
      <div className="dp-name">
        <h1>{d.name}</h1>
        <div className="sub">{d.firstSeason}–{d.lastSeason}</div>
      </div>
      <div className="dp-totals" style={{ flexBasis: "100%" }}>
        {stats.map(([k, v, gold]) => (
          <div className="dp-stat" key={k}>
            <div className={"v" + (gold ? " gold" : "")}>{v}</div>
            <div className="k">{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CareerTable({ d }) {
  return (
    <div className="dp-sec rise">
      <div className="sec-head"><span className="label"><DeltaMark size={16} /> Career</span></div>
      <div style={{ overflowX: "auto" }}>
        <table className="dp-tbl">
          <thead>
            <tr>
              <th className="l">Season</th><th className="l">Team</th>
              <th>R</th><th>Win</th><th>Pod</th><th>Pole</th><th>Pts</th><th>WDC</th>
            </tr>
          </thead>
          <tbody>
            {d.career.map((s) => {
              const others = s.teams.filter((x) => x.constructorId !== s.primaryTeamId);
              return (
                <tr key={s.season}>
                  <td className="l yr">{s.season}</td>
                  <td className="l team">
                    <span className="dot" style={{ "--ac": acFor(s.primaryTeamId) }} />
                    {s.primaryTeam}
                    {others.length ? <span className="more"> +{others.map((o) => o.constructor).join(", ")}</span> : null}
                  </td>
                  <td>{s.races}</td>
                  <td className={s.wins ? "hl" : ""}>{s.wins}</td>
                  <td>{s.podiums}</td>
                  <td>{s.poles}</td>
                  <td className="hl">{fmt(s.points)}</td>
                  <td className="wdc"><span className={"p" + (s.wdcFinish === 1 ? " champ" : "")}>P{s.wdcFinish}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function bar(me, them) {
  const tot = me + them;
  const p = tot ? (me / tot) * 100 : 50;
  return { me: p, them: 100 - p };
}

function H2HTile({ d, t }) {
  const a = t.aggregate;
  const yrs = t.seasonsShared;
  const range = yrs.length === 1 ? `${yrs[0]}` : `${Math.min(...yrs)}–${Math.max(...yrs)}`;
  const q = bar(a.qualiAhead, a.qualiBehind);
  const r = bar(a.raceAhead, a.raceBehind);
  return (
    <div className="h2h">
      <div className="h2h-top">
        <span className="nm">{d.code} vs {t.teammate}</span>
        <span className="yrs">{range} · {a.races} races</span>
      </div>

      <div className="h2h-row">
        <div className="lab"><span>Qualifying · both ran</span><span className="score"><b>{a.qualiAhead}</b>–{a.qualiBehind}</span></div>
        <div className="h2h-bar"><span className="me" style={{ width: q.me + "%" }} /><span className="them" style={{ width: q.them + "%" }} /></div>
      </div>

      <div className="h2h-row">
        <div className="lab"><span>Race · both classified</span><span className="score"><b>{a.raceAhead}</b>–{a.raceBehind}</span></div>
        <div className="h2h-bar"><span className="me" style={{ width: r.me + "%" }} /><span className="them" style={{ width: r.them + "%" }} /></div>
      </div>

      <div className="h2h-pts">
        <span><span className="pv me">{fmt(a.pointsSelf)}</span> {d.code}</span>
        <span>pts</span>
        <span>{t.teammate.split(" ").slice(-1)[0]} <span className="pv them">{fmt(a.pointsMate)}</span></span>
      </div>
    </div>
  );
}

function TeammateH2H({ d }) {
  const sorted = [...d.teammates].sort((a, b) => b.aggregate.races - a.aggregate.races);
  return (
    <div className="dp-sec rise">
      <div className="sec-head"><span className="label"><DeltaMark size={16} color="var(--gold)" /> Head-to-head</span></div>
      <div className="dp-h2h">
        {sorted.map((t) => <H2HTile key={t.teammateId} d={d} t={t} />)}
      </div>
    </div>
  );
}

function DriverHeader() {
  return (
    <header className="site-head" id="top">
      <div className="wrap">
        <Logo />
        <nav className="nav">
          <a href="/#history">History</a>
          <a href="/#eras">Eras</a>
          <a href="/pro">Pro</a>
        </nav>
      </div>
    </header>
  );
}

function DriverPage() {
  const [state, setState] = useState({ status: "checking", data: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (window.F1Access && window.F1Access.ready) await window.F1Access.ready;
        const acc = window.F1Access ? await window.F1Access.check() : { active: false };
        if (!alive) return;
        if (!acc || !acc.active) { setState({ status: "locked", data: null }); return; }

        const slug = (new URLSearchParams(location.search).get("d") || "").toLowerCase();
        if (!slug) { setState({ status: "noslug", data: null }); return; }

        const data = await fetchDriver(slug);
        if (alive) setState({ status: "ready", data });
      } catch (e) {
        if (!alive) return;
        setState({ status: e.locked ? "locked" : "error", data: null });
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (state.status !== "ready") return;
    document.body.classList.add("js-anim");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".rise").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [state.status]);

  return (
    <>
      <DriverStyles />
      <DriverHeader />
      <main>
        {state.status === "checking" && <div className="dp-load">Verifying access…</div>}
        {state.status === "locked" && (
          <div className="dp-err"><div className="wrap"><p>This is a Pro feature.</p><a className="btn btn-primary" href="/pro">Unlock Pro <span className="arr">→</span></a></div></div>
        )}
        {state.status === "noslug" && (
          <div className="dp-err"><div className="wrap"><p>No driver selected.</p></div></div>
        )}
        {state.status === "error" && (
          <div className="dp-err"><div className="wrap"><p>Couldn't load that driver.</p></div></div>
        )}
        {state.status === "ready" && (
          <section className="block"><div className="wrap dp-wrap">
            <Eyebrow>Driver Profile</Eyebrow>
            <DriverHero d={state.data} />
            <CareerTable d={state.data} />
            <TeammateH2H d={state.data} />
            <div className="delta-bar rise" style={{ marginTop: "clamp(40px,6vw,72px)" }}><span/><span/><span/><span/><span/></div>
          </div></section>
        )}
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DriverPage />);
