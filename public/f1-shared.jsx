/* ============================================================
   F1 DELTA — shared chrome (delta mark, header, eyebrow)
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

// The Δ mark — a real working glyph reused across the page.
function DeltaMark({ size = 18, color = "var(--ferrari)", stroke = false }) {
  const w = size, h = size * 0.86;
  return (
    <span className="delta-mark" aria-hidden="true">
      <svg width={w} height={h} viewBox="0 0 100 86">
        {stroke ? (
          <path d="M50 6 L96 80 L4 80 Z" fill="none" stroke={color} strokeWidth="9" strokeLinejoin="miter" />
        ) : (
          <path d="M50 4 L97 82 L3 82 Z" fill={color} />
        )}
      </svg>
    </span>
  );
}

function Eyebrow({ children, color = "var(--ferrari)" }) {
  return (
    <div className="eyebrow">
      <DeltaMark size={13} color={color} />
      <span>{children}</span>
    </div>
  );
}

function Logo({ size }) {
  return (
    <a href="#top" className="logo" style={size ? { fontSize: size } : null}>
      <span className="lm">F1</span>
      <DeltaMark size={size ? size * 0.62 : 16} color="var(--ferrari)" />
      <span className="ld">DELTA</span>
    </a>
  );
}

function Header() {
  return (
    <header className="site-head" id="top">
      <div className="wrap">
        <Logo />
        <nav className="nav">
          <a href="#history" className="active">History</a>
          <a href="#eras">Eras</a>
          <a href="#fantasy">Fantasy</a>
          <a href="#pro" className="pro-pill">Pro</a>
        </nav>
      </div>
    </header>
  );
}

Object.assign(window, { DeltaMark, Eyebrow, Logo, Header });
