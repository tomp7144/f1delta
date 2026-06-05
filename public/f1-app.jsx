/* ============================================================
   F1 DELTA — app root
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "liveSpeed": 1,
  "leaderGlow": true,
  "livePaused": false,
  "accent": "#dc0000"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // apply tweak-driven CSS vars to :root
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--leader-glow", t.leaderGlow ? "1" : "0");
    r.style.setProperty("--ferrari", t.accent);
    r.style.setProperty("--brand", t.accent);
  }, [t.leaderGlow, t.accent]);

  // scroll-reveal entrance (fail-safe: content visible if JS errors)
  useEffect(() => {
    document.body.classList.add("js-anim");
    const els = [...document.querySelectorAll(".rise")];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="hero-eyebrow">
              <Eyebrow>Formula 1 — Data &amp; History</Eyebrow>
            </div>
            
            {/* Main timing tower */}
            <TimingTower speed={t.liveSpeed} paused={t.livePaused} />
            
            {/* Championship Standings & Pro Upgrades stacked directly below */}
            <StandingsTower />
            <UpgradesModule />
            
            <div className="rise"><Reveal /></div>
            <DeltaBar />
          </div>
        </section>

        <HistorySection />
        <FantasySection />
        <ProStrip />
      </main>
      <Footer />

      <TweaksPanel>
        <TweakSection label="Live timing" />
        <TweakSlider
          label="Liveness speed" value={t.liveSpeed} min={0.4} max={2} step={0.1} unit="×"
          onChange={(v) => setTweak("liveSpeed", v)}
        />
        <TweakToggle
          label="Pause live data" value={t.livePaused}
          onChange={(v) => setTweak("livePaused", v)}
        />
        <TweakToggle
          label="Leader row glow" value={t.leaderGlow}
          onChange={(v) => setTweak("leaderGlow", v)}
        />
        <TweakSection label="Brand" />
        <TweakColor
          label="Accent" value={t.accent}
          options={["#dc0000", "#ff8000", "#00d2be", "#1f44e0", "#f4c215"]}
          onChange={(v) => setTweak("accent", v)}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);