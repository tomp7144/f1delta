/* ============================================================
   F1 DELTA — Pro area (gated)
   Renders into #root on /pro. Access state comes entirely from
   window.F1Access (backend-verified) — this file only reacts to it.
   Relies on f1-shared.jsx being loaded first (Logo / DeltaMark /
   Eyebrow, and the shared React hook declarations).
   ============================================================ */

/* Display only — must match the recurring price you set in Stripe.
   Stripe is the source of truth for what's actually billed. */
const PRICE_LABEL = "$9";
const PRICE_PER = "/ month · cancel anytime";

/* Page-scoped styles. Built only from existing design tokens so the
   page reads as the same site; nothing here touches f1delta.css. */
function ProStyles() {
  return (
    <style>{`
      .pro-gate { display:grid; grid-template-columns:1.1fr 0.9fr; gap:clamp(28px,5vw,64px); align-items:start; padding-top:clamp(28px,4vw,52px); }
      @media (max-width:860px){ .pro-gate { grid-template-columns:1fr; } }

      .pro-lead h1 { font-family:var(--disp); font-weight:700; font-size:clamp(46px,7vw,98px); line-height:0.88; letter-spacing:-0.012em; color:var(--text); }
      .pro-lead h1 .accent { color:var(--ferrari); }
      .pro-lead p { font-family:var(--body); font-size:clamp(15px,1.1vw,17px); line-height:1.62; color:var(--text-dim); max-width:46ch; margin-top:20px; text-wrap:pretty; }

      .pro-feat { list-style:none; margin-top:30px; display:flex; flex-direction:column; gap:15px; }
      .pro-feat li { display:flex; gap:13px; align-items:flex-start; font-family:var(--body); font-size:15px; line-height:1.4; color:var(--text); }
      .pro-feat li .delta-mark { transform:translateY(3px); flex:0 0 auto; }
      .pro-feat li b { font-weight:600; }
      .pro-feat li span.s { color:var(--text-dim); }

      .pro-card { border:1px solid var(--line); border-radius:4px; overflow:hidden; background:linear-gradient(180deg,var(--surface) 0%,var(--bg-2) 100%); box-shadow:0 30px 80px -50px rgba(0,0,0,.9); position:sticky; top:88px; }
      .pro-card-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:15px clamp(18px,2vw,22px); border-bottom:1px solid var(--line); background:rgba(0,0,0,.25); }
      .pro-card-head .pt { font-family:var(--disp); font-weight:700; font-size:20px; letter-spacing:.04em; text-transform:uppercase; color:var(--text); }
      .pro-card-body { padding:clamp(20px,2.4vw,30px); display:flex; flex-direction:column; gap:16px; }

      .pro-price { display:flex; align-items:baseline; gap:11px; }
      .pro-price .amt { font-family:var(--disp); font-weight:700; font-size:54px; line-height:.85; color:var(--text); }
      .pro-price .per { font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--text-faint); }

      .pro-field { width:100%; font-family:var(--mono); font-size:14px; color:var(--text); background:var(--surface-2); border:1px solid var(--line-2); border-radius:2px; padding:13px 14px; outline:none; transition:border-color .16s; }
      .pro-field:focus { border-color:var(--text-dim); }
      .pro-field::placeholder { color:var(--text-faint); letter-spacing:.04em; }

      .pro-card .btn { justify-content:center; }
      .pro-card .btn[disabled] { opacity:.55; cursor:default; transform:none; }

      .pro-row { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .pro-link { background:none; border:0; cursor:pointer; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--text-dim); text-decoration:underline; text-underline-offset:3px; padding:0; }
      .pro-link:hover { color:var(--text); }
      .pro-msg { font-family:var(--mono); font-size:12px; letter-spacing:.02em; color:var(--ferrari); min-height:1em; }
      .pro-fine { font-family:var(--mono); font-size:10.5px; letter-spacing:.05em; color:var(--text-ghost); line-height:1.55; border-top:1px solid var(--line); padding-top:14px; }

      .pro-loading { padding:clamp(80px,16vh,180px) 0; text-align:center; font-family:var(--mono); font-size:12px; letter-spacing:.26em; text-transform:uppercase; color:var(--text-faint); }

      .pro-acct { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:14px clamp(16px,2vw,22px); border:1px solid var(--line); border-radius:4px; background:rgba(0,0,0,.2); margin-bottom:clamp(22px,3vw,34px); }
      .pro-acct .who { font-family:var(--mono); font-size:12px; letter-spacing:.08em; color:var(--text-dim); }
      .pro-acct .who b { color:var(--text); font-weight:700; }
      .pro-acct .admin { color:var(--gold); }

      .pro-cards { grid-template-columns:repeat(2,1fr); }
      @media (max-width:760px){ .pro-cards { grid-template-columns:1fr; } }
    `}</style>
  );
}

/* Header matching .site-head, but nav links point back to the home
   page sections (the Pro page has no #history etc. of its own). */
function ProHeader() {
  return (
    <header className="site-head" id="top">
      <div className="wrap">
        <Logo />
        <nav className="nav">
          <a href="/#history">History</a>
          <a href="/#eras">Eras</a>
          <a href="/#fantasy">Fantasy</a>
          <a href="/pro" className="pro-pill">Pro</a>
        </nav>
      </div>
    </header>
  );
}

function ProFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Logo />
            <p>The delta tells the story. Live timing, championship context, and fantasy strategy for people who read the gaps, not just the result.</p>
          </div>
          <div className="foot-col">
            <h5>Data</h5>
            <a href="/#top">Live timing</a>
            <a href="/#top">Standings</a>
            <a href="/#fantasy">Fantasy</a>
          </div>
          <div className="foot-col">
            <h5>Explore</h5>
            <a href="/#history">History</a>
            <a href="/#eras">Eras</a>
            <a href="/pro">Pro</a>
          </div>
          <div className="foot-col">
            <h5>Account</h5>
            <a href="/pro">Membership</a>
            <a href="#" onClick={(e) => { e.preventDefault(); window.F1Access && window.F1Access.logout(); location.reload(); }}>Sign out</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} F1 Delta · Unofficial · Data via Jolpica</span>
          <div className="delta-bar"><span/><span/><span/><span/><span/></div>
        </div>
      </div>
    </footer>
  );
}

/* The locked state: value pitch + subscribe card. */
function ProLocked({ email, setEmail, busy, msg, onSubscribe, onRestore }) {
  function onKey(e) { if (e.key === "Enter" && !busy) onSubscribe(); }
  return (
    <section className="block">
      <div className="wrap">
        <Eyebrow>Pro Access</Eyebrow>
        <div className="pro-gate" style={{ marginTop: "clamp(20px,3vw,30px)" }}>
          <div className="pro-lead rise">
            <h1>The full <span className="accent">delta.</span></h1>
            <p>The free tier shows you what happened. Pro shows you <span className="hl">why</span> — the complete grid, weekend upgrade intelligence, and full-season fantasy projection in one membership.</p>
            <ul className="pro-feat">
              <li><DeltaMark size={11} color="var(--ferrari)" /><span><b>Complete grid &amp; gaps</b> — every car, every interval, every stint. <span className="s">Not just the podium.</span></span></li>
              <li><DeltaMark size={11} color="var(--mclaren)" /><span><b>Weekend upgrade intelligence</b> — who brought what, and the projected lap-time delta.</span></li>
              <li><DeltaMark size={11} color="var(--mercedes)" /><span><b>Full-season fantasy projection</b> — value picks, captain math, and form curves ahead of lock.</span></li>
              <li><DeltaMark size={11} color="var(--gold)" /><span><b>Historical head-to-head</b> — any two drivers, any era, the data that settles it.</span></li>
            </ul>
          </div>

          <div className="pro-card rise">
            <div className="pro-card-head">
              <span className="pt">F1 Delta Pro</span>
              <span className="tier-badge pro">Pro</span>
            </div>
            <div className="pro-card-body">
              <div className="pro-price">
                <span className="amt">{PRICE_LABEL}</span>
                <span className="per">{PRICE_PER}</span>
              </div>
              <input
                className="pro-field"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={onKey}
              />
              <button className="btn btn-primary" disabled={busy} onClick={onSubscribe}>
                {busy ? "One moment…" : "Subscribe"}<span className="arr">→</span>
              </button>
              <div className="pro-msg">{msg}</div>
              <div className="pro-row">
                <button className="pro-link" onClick={onRestore} disabled={busy}>Already a member? Restore access</button>
              </div>
              <div className="pro-fine">Secure checkout by Stripe. You'll be redirected to pay, then brought straight back with access unlocked. Cancel anytime from your receipt link.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* The unlocked state: account bar + Pro modules.
   The cards below are on-brand scaffolding — drop your real premium
   modules in here (or render them from your data files). */
function ProUnlocked({ account }) {
  const modules = [
    { kicker: "Live · Full Grid", title: "Every car, every interval", body: "The complete timing tower — all twenty cars, real gaps, stint compounds, and pit deltas. Updated each race weekend.", stat: "20 cars", ac: "var(--ferrari)" },
    { kicker: "Technical", title: "Weekend upgrade intelligence", body: "What each team brought to this round, the aero focus, and the projected lap-time impact before a wheel turns.", stat: "Per round", ac: "var(--mclaren)" },
    { kicker: "Fantasy", title: "Full-season projection", body: "Value picks, captaincy math, and form curves across the whole calendar — not just the next race.", stat: "24 rounds", ac: "var(--mercedes)" },
    { kicker: "Archive", title: "Historical head-to-head", body: "Pit any two drivers against each other across any era. The numbers that end the argument.", stat: "1950 → now", ac: "var(--gold)" },
  ];
  return (
    <section className="block">
      <div className="wrap">
        <div className="pro-acct rise">
          <span className="who">
            Signed in as <b>{account.email}</b>
            {account.admin ? <span className="admin"> · Admin</span> : null}
          </span>
          <button className="pro-link" onClick={() => { window.F1Access.logout(); location.reload(); }}>Sign out</button>
        </div>

        <div className="sec-head rise">
          <span className="label"><DeltaMark size={20} color="var(--ferrari)" /> Pro</span>
          <span className="tier-badge pro">Member</span>
        </div>

        <div className="cards pro-cards rise">
          {modules.map((m, i) => (
            <a className="hcard" key={i} href="#" style={{ "--ac": m.ac }}>
              <div className="accent-line" />
              <div className="ckicker">{m.kicker}</div>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
              <div className="cfoot">
                <span className="cstat">{m.stat}</span>
                <span className="cgo">→</span>
              </div>
            </a>
          ))}
        </div>

        <div className="delta-bar rise"><span/><span/><span/><span/><span/></div>
      </div>
    </section>
  );
}

function ProGate() {
  const [status, setStatus] = useState("checking"); // checking | locked | unlocked
  const [account, setAccount] = useState(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // resolve access on load (after any checkout-return token exchange)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (window.F1Access && window.F1Access.ready) await window.F1Access.ready;
        const res = window.F1Access ? await window.F1Access.check() : { active: false };
        if (!alive) return;
        if (res && res.active) { setAccount(res); setStatus("unlocked"); }
        else setStatus("locked");
      } catch {
        if (alive) setStatus("locked");
      }
    })();
    return () => { alive = false; };
  }, []);

  // same fail-safe scroll-reveal as the home page
  useEffect(() => {
    if (status === "checking") return;
    document.body.classList.add("js-anim");
    const els = [...document.querySelectorAll(".rise")];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [status]);

  async function onSubscribe() {
    if (!email.trim()) { setMsg("Enter your email to continue."); return; }
    setBusy(true); setMsg("");
    try {
      await window.F1Access.subscribe(email.trim()); // redirects to Stripe
    } catch (e) {
      setMsg("Couldn't start checkout. Please try again.");
      setBusy(false);
    }
  }

  async function onRestore() {
    if (!email.trim()) { setMsg("Enter the email you subscribed with."); return; }
    setBusy(true); setMsg("");
    try {
      const res = await window.F1Access.restore(email.trim());
      if (res && res.active) { setAccount(res); setStatus("unlocked"); }
      else setMsg("No active subscription found for that email.");
    } catch {
      setMsg("Couldn't verify right now. Please try again.");
    }
    setBusy(false);
  }

  return (
    <>
      <ProStyles />
      <ProHeader />
      <main>
        {status === "checking" && <div className="pro-loading">Verifying access…</div>}
        {status === "locked" && (
          <ProLocked
            email={email} setEmail={setEmail}
            busy={busy} msg={msg}
            onSubscribe={onSubscribe} onRestore={onRestore}
          />
        )}
        {status === "unlocked" && <ProUnlocked account={account} />}
      </main>
      <ProFooter />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ProGate />);
