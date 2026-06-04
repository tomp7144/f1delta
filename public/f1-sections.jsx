/* ============================================================
   F1 DELTA — reveal title, history, pro strip, footer
   ============================================================ */

function Reveal() {
  return (
    <div className="reveal">
      <h1>
        The delta<br />
        tells the <span className="accent">story.</span>
      </h1>
      <div className="reveal-side">
        <p>
          <span className="hl">Seventy-five years of Formula 1, visualized.</span>{" "}
          Every regulation era, every dynasty, every title decided by a handful
          of points — plus fantasy tools built on real historical track data.
        </p>
        <div className="cta-row">
          <a href="#history" className="btn btn-primary">Explore History</a>
          <a href="#fantasy" className="btn btn-ghost">
            Fantasy Tools <span className="arr">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function DeltaBar() {
  return (
    <div className="delta-bar" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
  );
}

function HistorySection() {
  return (
    <section className="block" id="history">
      <div className="wrap">
        <div className="sec-head">
          <div className="label">
            <DeltaMark size={20} color="var(--ferrari)" />
            History
          </div>
          <span className="tier-badge free">Free</span>
        </div>
        <div className="cards">
          {HISTORY_CARDS.map((c, i) => (
            <a className="hcard rise" href="#eras" key={i} style={{ "--ac": c.accent, transitionDelay: (i * 0.09) + "s" }}>
              <div className="accent-line"></div>
              <div className="ckicker">{c.kicker}</div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <div className="cfoot">
                <span className="cstat num">{c.stat}</span>
                <span className="cgo">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProStrip() {
  return (
    <section className="block" id="pro">
      <div className="wrap">
        <div className="pro-strip rise">
          <div className="pleft">
            <span className="ptag">Go Pro</span>
            <h4>Fantasy tools, era explorer & full history</h4>
            <span className="psub">
              Everything in Free, plus live fantasy projections and the complete
              75-season dataset. Cancel anytime.
            </span>
          </div>
          <div className="pright">
            <div className="price">
              <span className="amt num">$9</span>
              <div className="per">PER MONTH</div>
            </div>
            <a href="#pro" className="btn btn-primary">Unlock Pro</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Logo size={24} />
            <p>
              An independent Formula 1 data & history project. The delta tells
              the story.
            </p>
          </div>
          <div className="foot-col">
            <h5>Explore</h5>
            <a href="#history">Regulation Eras</a>
            <a href="#history">Dynasty Tracker</a>
            <a href="#history">Team Orders</a>
            <a href="#fantasy">Fantasy Assistant</a>
          </div>
          <div className="foot-col">
            <h5>Data</h5>
            <a href="#">Methodology</a>
            <a href="#">Sources</a>
            <a href="#">Season Archive</a>
            <a href="#">Changelog</a>
          </div>
          <div className="foot-col">
            <h5>Account</h5>
            <a href="#pro">Go Pro</a>
            <a href="#">Sign in</a>
            <a href="#">Newsletter</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 F1 DELTA · NOT AFFILIATED WITH FORMULA 1. DATA SHOWN IS ILLUSTRATIVE.</span>
          <DeltaBar />
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Reveal, DeltaBar, HistorySection, ProStrip, Footer });
