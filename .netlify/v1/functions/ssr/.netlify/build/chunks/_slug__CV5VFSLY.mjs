import { c as createComponent } from './astro-component_D6KGALc0.mjs';
import 'piccolore';
import { r as renderTemplate, i as renderSlot, f as addAttribute, j as renderHead, m as maybeRenderHead, k as renderComponent, l as Fragment } from './ssr-function_D8nCXlOz.mjs';
import fs from 'node:fs';
import path from 'node:path';
import 'clsx';

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$BaseLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title, description, canonical } = Astro2.props;
  const pageTitle = title ?? "f1delta";
  const pathname = Astro2.url.pathname;
  function navKey(p) {
    if (p.startsWith("/drivers")) return "drivers";
    if (p.startsWith("/teams")) return "teams";
    if (p.startsWith("/engineers") || p.startsWith("/principals") || p.startsWith("/technical-directors") || p.startsWith("/people")) return "people";
    if (p.startsWith("/standings")) return "standings";
    if (p.startsWith("/grands-prix")) return "gps";
    if (p.startsWith("/circuits")) return "circuits";
    if (p.startsWith("/records")) return "records";
    if (p.startsWith("/fantasy")) return "fantasy";
    if (p.startsWith("/compare")) return "compare";
    if (p.startsWith("/trivia")) return "trivia";
    return "";
  }
  const current = navKey(pathname);
  return renderTemplate(_a$1 || (_a$1 = __template$1(['<html lang="en" data-astro-cid-37fxchfa> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', "</title>", "", '<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/f1-table.css">', `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{&quot;token&quot;:&quot;231dcb0acef2461c8d76032d94a31207&quot;}"><\/script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=JetBrains+Mono:wght@400;700&display=swap"><!-- Google Consent Mode v2 — must fire BEFORE any Google tag (AdSense, GA4) --><script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      // EEA + UK: denied pending consent banner (GDPR requires prior opt-in)
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'wait_for_update': 500,
        'region': ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR',
                   'HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK',
                   'SI','ES','SE','IS','LI','NO','GB']
      });
      // Rest of world (US, etc.): granted — no prior-consent legal requirement
      gtag('consent', 'default', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    <\/script><!-- AdSense --><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6298973348658731" crossorigin="anonymous"><\/script><!-- Google Analytics (GA4) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-WJ7VNMC69K"><\/script><script>
      gtag('js', new Date());
      gtag('config', 'G-WJ7VNMC69K');
    <\/script>`, '</head> <body style="margin:0;background:#f4f4f1" data-astro-cid-37fxchfa> <nav class="site-nav" data-astro-cid-37fxchfa> <div class="nav-inner" data-astro-cid-37fxchfa> <a class="wordmark" href="/" data-astro-cid-37fxchfa>F1<svg class="wm-tri" aria-hidden="true" width="11" height="10" viewBox="0 0 100 86" data-astro-cid-37fxchfa><path d="M50 4 L97 82 L3 82 Z" fill="currentColor" data-astro-cid-37fxchfa></path></svg>DELTA</a> <div class="nav-links" id="nav-links" data-astro-cid-37fxchfa> <a href="/drivers"', ' data-astro-cid-37fxchfa>Drivers</a> <a href="/teams"', " data-astro-cid-37fxchfa>Teams</a> <div", ' data-astro-cid-37fxchfa> <button class="nav-group-btn" aria-haspopup="true" aria-expanded="false" data-astro-cid-37fxchfa>People <span class="caret" aria-hidden="true" data-astro-cid-37fxchfa>&#9660;</span></button> <div class="nav-group-panel" role="menu" data-astro-cid-37fxchfa> <a href="/engineers" role="menuitem"', ' data-astro-cid-37fxchfa>Engineers</a> <a href="/principals" role="menuitem"', ' data-astro-cid-37fxchfa>Team Principals</a> <a href="/technical-directors" role="menuitem"', ' data-astro-cid-37fxchfa>Technical Directors</a> </div> </div> <a href="/standings"', ' data-astro-cid-37fxchfa>Seasons</a> <a href="/grands-prix"', ' data-astro-cid-37fxchfa>GPs</a> <a href="/circuits"', ' data-astro-cid-37fxchfa>Circuits</a> <a href="/records"', ' data-astro-cid-37fxchfa>Records</a> <a href="/compare"', ' data-astro-cid-37fxchfa>Compare</a> <a href="/fantasy"', ' data-astro-cid-37fxchfa>Fantasy</a> <a href="/trivia"', ' data-astro-cid-37fxchfa>Quiz</a> <!-- Inline search — always visible on desktop, in dropdown on mobile --> <div class="nav-srch-wrap" id="nav-srch-wrap" data-astro-cid-37fxchfa> <input type="text" id="nav-srch-in" class="nav-srch-in" placeholder="Search…" autocomplete="off" spellcheck="false" aria-label="Search" data-astro-cid-37fxchfa> <div class="nav-srch-res" id="nav-srch-res" hidden data-astro-cid-37fxchfa></div> </div> </div> <a class="donate-btn" href="https://ko-fi.com/f1delta" target="_blank" rel="noopener noreferrer" data-astro-cid-37fxchfa>♥ Donate</a> <button class="hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-links" data-astro-cid-37fxchfa>&#9776;</button> </div> </nav> ', ' <footer class="site-footer" data-astro-cid-37fxchfa> <div class="footer-inner" data-astro-cid-37fxchfa> <nav class="footer-links" data-astro-cid-37fxchfa> <a href="/about" data-astro-cid-37fxchfa>About</a> <a href="/methodology" data-astro-cid-37fxchfa>Methodology</a> <a href="/contact" data-astro-cid-37fxchfa>Contact</a> <a href="/privacy-policy" data-astro-cid-37fxchfa>Privacy Policy</a> <a href="/terms" data-astro-cid-37fxchfa>Terms</a> <a href="https://ko-fi.com/f1delta" target="_blank" rel="noopener" data-astro-cid-37fxchfa>Donate</a> </nav> <p class="footer-copy" data-astro-cid-37fxchfa>&copy; ', ` F1 Delta</p> <p class="footer-disclaimer" data-astro-cid-37fxchfa>F1 Delta is an unofficial, independent fan project and is not affiliated with, endorsed by, or connected to Formula 1, the FIA, or related entities. F1 and FORMULA 1 are trademarks of their respective owners.</p> </div> </footer>  <script>
(function () {
  var burger = document.getElementById("nav-hamburger");
  var links  = document.getElementById("nav-links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Desktop: People dropdown click-open (for touch/hybrid devices)
  var gpBtn = document.querySelector(".nav-group-btn");
  if (gpBtn) {
    gpBtn.addEventListener("click", function () {
      if (window.innerWidth > 620) {
        var grp = gpBtn.closest(".nav-group");
        if (grp) {
          var wasOpen = grp.classList.contains("open");
          grp.classList.toggle("open");
          gpBtn.setAttribute("aria-expanded", wasOpen ? "false" : "true");
        }
      }
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    var grp = document.querySelector(".nav-group.open");
    if (grp && !grp.contains(e.target)) {
      grp.classList.remove("open");
      var btn = grp.querySelector(".nav-group-btn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
  });

  // ── Inline nav search ────────────────────────────────────────────────
  var srchWrap = document.getElementById("nav-srch-wrap");
  var srchIn   = document.getElementById("nav-srch-in");
  var srchRes  = document.getElementById("nav-srch-res");
  var _idx = null;

  async function ensureIdx() {
    if (_idx) return;
    try { _idx = await fetch("/search-index.json").then(function(r){ return r.json(); }); } catch(e){}
  }

  function matchIdx(q) {
    if (!_idx || !q.trim()) return [];
    var n = q.trim().toLowerCase();
    return _idx
      .filter(function(e) {
        var lbl = (e.label || "").toLowerCase();
        return lbl.startsWith(n)
          || lbl.split(/\\s+/).some(function(w){ return w.startsWith(n); })
          || (e.code || "").toLowerCase().startsWith(n)
          || (e.terms || []).some(function(t){ return t.startsWith(n); });
      })
      .sort(function(a, b) {
        var as = (a.label||"").toLowerCase().startsWith(n);
        var bs = (b.label||"").toLowerCase().startsWith(n);
        if (as && !bs) return -1; if (bs && !as) return 1;
        return (b.ly||0) - (a.ly||0);
      })
      .slice(0, 7);
  }

  var TYPE_META = { h2h:"H2H", team:"Team", person:"Person" };

  function renderRes(matches) {
    if (!srchRes) return;
    if (!matches.length) { srchRes.hidden = true; return; }
    srchRes.innerHTML = matches.map(function(e) {
      var meta = e.fy != null
        ? (e.fy === e.ly ? String(e.fy) : e.fy + "–" + e.ly)
        : (e.type === "record" ? (e.scope || "Record")
           : e.type === "circuit" ? (e.country || "Circuit")
           : e.type === "gp"      ? (e.country || "Grand Prix")
           : e.type === "season"  ? String(e.year || "")
           : e.type === "race"    ? String(e.year || "")
           : (TYPE_META[e.type] || ""));
      return '<a class="srch-opt" href="' + e.url + '">'
        + '<span class="srch-opt-label">' + e.label + '</span>'
        + (meta ? '<span class="srch-opt-meta">' + meta + '</span>' : '')
        + '</a>';
    }).join("");
    srchRes.hidden = false;
  }

  if (srchIn) {
    srchIn.addEventListener("input", async function() {
      await ensureIdx();
      renderRes(matchIdx(srchIn.value));
    });
  }

  if (srchWrap) {
    srchWrap.addEventListener("keydown", function(e) {
      var opts = srchRes ? Array.from(srchRes.querySelectorAll(".srch-opt")) : [];
      var fi = opts.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (fi < 0 && opts[0]) opts[0].focus();
        else if (fi < opts.length - 1) opts[fi+1].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (fi > 0) opts[fi-1].focus();
        else if (srchIn) srchIn.focus();
      } else if (e.key === "Escape") {
        if (srchRes) srchRes.hidden = true;
        if (srchIn) srchIn.focus();
      } else if (e.key === "Enter" && fi < 0 && opts.length) {
        e.preventDefault(); opts[0].click();
      }
    });
  }

  // Hide results when clicking outside the search wrapper
  document.addEventListener("click", function(e) {
    if (srchWrap && srchRes && !srchRes.hidden && !srchWrap.contains(e.target)) {
      srchRes.hidden = true;
    }
  });
})();
<\/script></body></html>`], ['<html lang="en" data-astro-cid-37fxchfa> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', "</title>", "", '<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/f1-table.css">', `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{&quot;token&quot;:&quot;231dcb0acef2461c8d76032d94a31207&quot;}"><\/script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=JetBrains+Mono:wght@400;700&display=swap"><!-- Google Consent Mode v2 — must fire BEFORE any Google tag (AdSense, GA4) --><script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      // EEA + UK: denied pending consent banner (GDPR requires prior opt-in)
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'wait_for_update': 500,
        'region': ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR',
                   'HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK',
                   'SI','ES','SE','IS','LI','NO','GB']
      });
      // Rest of world (US, etc.): granted — no prior-consent legal requirement
      gtag('consent', 'default', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    <\/script><!-- AdSense --><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6298973348658731" crossorigin="anonymous"><\/script><!-- Google Analytics (GA4) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-WJ7VNMC69K"><\/script><script>
      gtag('js', new Date());
      gtag('config', 'G-WJ7VNMC69K');
    <\/script>`, '</head> <body style="margin:0;background:#f4f4f1" data-astro-cid-37fxchfa> <nav class="site-nav" data-astro-cid-37fxchfa> <div class="nav-inner" data-astro-cid-37fxchfa> <a class="wordmark" href="/" data-astro-cid-37fxchfa>F1<svg class="wm-tri" aria-hidden="true" width="11" height="10" viewBox="0 0 100 86" data-astro-cid-37fxchfa><path d="M50 4 L97 82 L3 82 Z" fill="currentColor" data-astro-cid-37fxchfa></path></svg>DELTA</a> <div class="nav-links" id="nav-links" data-astro-cid-37fxchfa> <a href="/drivers"', ' data-astro-cid-37fxchfa>Drivers</a> <a href="/teams"', " data-astro-cid-37fxchfa>Teams</a> <div", ' data-astro-cid-37fxchfa> <button class="nav-group-btn" aria-haspopup="true" aria-expanded="false" data-astro-cid-37fxchfa>People <span class="caret" aria-hidden="true" data-astro-cid-37fxchfa>&#9660;</span></button> <div class="nav-group-panel" role="menu" data-astro-cid-37fxchfa> <a href="/engineers" role="menuitem"', ' data-astro-cid-37fxchfa>Engineers</a> <a href="/principals" role="menuitem"', ' data-astro-cid-37fxchfa>Team Principals</a> <a href="/technical-directors" role="menuitem"', ' data-astro-cid-37fxchfa>Technical Directors</a> </div> </div> <a href="/standings"', ' data-astro-cid-37fxchfa>Seasons</a> <a href="/grands-prix"', ' data-astro-cid-37fxchfa>GPs</a> <a href="/circuits"', ' data-astro-cid-37fxchfa>Circuits</a> <a href="/records"', ' data-astro-cid-37fxchfa>Records</a> <a href="/compare"', ' data-astro-cid-37fxchfa>Compare</a> <a href="/fantasy"', ' data-astro-cid-37fxchfa>Fantasy</a> <a href="/trivia"', ' data-astro-cid-37fxchfa>Quiz</a> <!-- Inline search — always visible on desktop, in dropdown on mobile --> <div class="nav-srch-wrap" id="nav-srch-wrap" data-astro-cid-37fxchfa> <input type="text" id="nav-srch-in" class="nav-srch-in" placeholder="Search…" autocomplete="off" spellcheck="false" aria-label="Search" data-astro-cid-37fxchfa> <div class="nav-srch-res" id="nav-srch-res" hidden data-astro-cid-37fxchfa></div> </div> </div> <a class="donate-btn" href="https://ko-fi.com/f1delta" target="_blank" rel="noopener noreferrer" data-astro-cid-37fxchfa>♥ Donate</a> <button class="hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-links" data-astro-cid-37fxchfa>&#9776;</button> </div> </nav> ', ' <footer class="site-footer" data-astro-cid-37fxchfa> <div class="footer-inner" data-astro-cid-37fxchfa> <nav class="footer-links" data-astro-cid-37fxchfa> <a href="/about" data-astro-cid-37fxchfa>About</a> <a href="/methodology" data-astro-cid-37fxchfa>Methodology</a> <a href="/contact" data-astro-cid-37fxchfa>Contact</a> <a href="/privacy-policy" data-astro-cid-37fxchfa>Privacy Policy</a> <a href="/terms" data-astro-cid-37fxchfa>Terms</a> <a href="https://ko-fi.com/f1delta" target="_blank" rel="noopener" data-astro-cid-37fxchfa>Donate</a> </nav> <p class="footer-copy" data-astro-cid-37fxchfa>&copy; ', ` F1 Delta</p> <p class="footer-disclaimer" data-astro-cid-37fxchfa>F1 Delta is an unofficial, independent fan project and is not affiliated with, endorsed by, or connected to Formula 1, the FIA, or related entities. F1 and FORMULA 1 are trademarks of their respective owners.</p> </div> </footer>  <script>
(function () {
  var burger = document.getElementById("nav-hamburger");
  var links  = document.getElementById("nav-links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Desktop: People dropdown click-open (for touch/hybrid devices)
  var gpBtn = document.querySelector(".nav-group-btn");
  if (gpBtn) {
    gpBtn.addEventListener("click", function () {
      if (window.innerWidth > 620) {
        var grp = gpBtn.closest(".nav-group");
        if (grp) {
          var wasOpen = grp.classList.contains("open");
          grp.classList.toggle("open");
          gpBtn.setAttribute("aria-expanded", wasOpen ? "false" : "true");
        }
      }
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    var grp = document.querySelector(".nav-group.open");
    if (grp && !grp.contains(e.target)) {
      grp.classList.remove("open");
      var btn = grp.querySelector(".nav-group-btn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
  });

  // ── Inline nav search ────────────────────────────────────────────────
  var srchWrap = document.getElementById("nav-srch-wrap");
  var srchIn   = document.getElementById("nav-srch-in");
  var srchRes  = document.getElementById("nav-srch-res");
  var _idx = null;

  async function ensureIdx() {
    if (_idx) return;
    try { _idx = await fetch("/search-index.json").then(function(r){ return r.json(); }); } catch(e){}
  }

  function matchIdx(q) {
    if (!_idx || !q.trim()) return [];
    var n = q.trim().toLowerCase();
    return _idx
      .filter(function(e) {
        var lbl = (e.label || "").toLowerCase();
        return lbl.startsWith(n)
          || lbl.split(/\\\\s+/).some(function(w){ return w.startsWith(n); })
          || (e.code || "").toLowerCase().startsWith(n)
          || (e.terms || []).some(function(t){ return t.startsWith(n); });
      })
      .sort(function(a, b) {
        var as = (a.label||"").toLowerCase().startsWith(n);
        var bs = (b.label||"").toLowerCase().startsWith(n);
        if (as && !bs) return -1; if (bs && !as) return 1;
        return (b.ly||0) - (a.ly||0);
      })
      .slice(0, 7);
  }

  var TYPE_META = { h2h:"H2H", team:"Team", person:"Person" };

  function renderRes(matches) {
    if (!srchRes) return;
    if (!matches.length) { srchRes.hidden = true; return; }
    srchRes.innerHTML = matches.map(function(e) {
      var meta = e.fy != null
        ? (e.fy === e.ly ? String(e.fy) : e.fy + "–" + e.ly)
        : (e.type === "record" ? (e.scope || "Record")
           : e.type === "circuit" ? (e.country || "Circuit")
           : e.type === "gp"      ? (e.country || "Grand Prix")
           : e.type === "season"  ? String(e.year || "")
           : e.type === "race"    ? String(e.year || "")
           : (TYPE_META[e.type] || ""));
      return '<a class="srch-opt" href="' + e.url + '">'
        + '<span class="srch-opt-label">' + e.label + '</span>'
        + (meta ? '<span class="srch-opt-meta">' + meta + '</span>' : '')
        + '</a>';
    }).join("");
    srchRes.hidden = false;
  }

  if (srchIn) {
    srchIn.addEventListener("input", async function() {
      await ensureIdx();
      renderRes(matchIdx(srchIn.value));
    });
  }

  if (srchWrap) {
    srchWrap.addEventListener("keydown", function(e) {
      var opts = srchRes ? Array.from(srchRes.querySelectorAll(".srch-opt")) : [];
      var fi = opts.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (fi < 0 && opts[0]) opts[0].focus();
        else if (fi < opts.length - 1) opts[fi+1].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (fi > 0) opts[fi-1].focus();
        else if (srchIn) srchIn.focus();
      } else if (e.key === "Escape") {
        if (srchRes) srchRes.hidden = true;
        if (srchIn) srchIn.focus();
      } else if (e.key === "Enter" && fi < 0 && opts.length) {
        e.preventDefault(); opts[0].click();
      }
    });
  }

  // Hide results when clicking outside the search wrapper
  document.addEventListener("click", function(e) {
    if (srchWrap && srchRes && !srchRes.hidden && !srchWrap.contains(e.target)) {
      srchRes.hidden = true;
    }
  });
})();
<\/script></body></html>`])), pageTitle, description && renderTemplate`<meta name="description"${addAttribute(description, "content")}>`, canonical && renderTemplate`<link rel="canonical"${addAttribute(canonical, "href")}>`, renderSlot($$result, $$slots["head"]), renderHead(), addAttribute(current === "drivers" ? "page" : void 0, "aria-current"), addAttribute(current === "teams" ? "page" : void 0, "aria-current"), addAttribute(["nav-group", { "is-active": current === "people" }], "class:list"), addAttribute(pathname.startsWith("/engineers") ? "page" : void 0, "aria-current"), addAttribute(pathname.startsWith("/principals") ? "page" : void 0, "aria-current"), addAttribute(pathname.startsWith("/technical-directors") ? "page" : void 0, "aria-current"), addAttribute(current === "standings" ? "page" : void 0, "aria-current"), addAttribute(current === "gps" ? "page" : void 0, "aria-current"), addAttribute(current === "circuits" ? "page" : void 0, "aria-current"), addAttribute(current === "records" ? "page" : void 0, "aria-current"), addAttribute(current === "compare" ? "page" : void 0, "aria-current"), addAttribute(current === "fantasy" ? "page" : void 0, "aria-current"), addAttribute(current === "trivia" ? "page" : void 0, "aria-current"), renderSlot($$result, $$slots["default"]), (/* @__PURE__ */ new Date()).getFullYear());
}, "/Users/thomaspayment/f1delta/src/layouts/BaseLayout.astro", void 0);

const $$F1DeltaExplain = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$F1DeltaExplain;
  const { compareNote = false, seasonNote = false, open = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<details class="f1d-explain"${addAttribute(open || void 0, "open")} data-astro-cid-wh272q75> <summary data-astro-cid-wh272q75>${seasonNote ? "Season f1δ explained" : "How is f1δ calculated?"}</summary> <div class="f1d-xbody" data-astro-cid-wh272q75> ${compareNote && renderTemplate`<p class="f1d-compare-note" data-astro-cid-wh272q75>Each point is one season, scored against that season's maximum possible points. The two careers can be lined up three ways — by season number, by the driver's age, or by calendar year — because "whose trajectory was better," "who was better at 27," and "what happened that year" are three different questions. Age alignment matters because drivers debut at very different ages: lining up two rookie seasons can otherwise compare a driver in his late thirties to one in his early twenties.</p>`} ${seasonNote && renderTemplate`<p class="f1d-compare-note" data-astro-cid-wh272q75>Each season is scored against the maximum points available that year, on a 0–100 scale. Comparing two seasons this way is era-fair: a dominant 1950 season and a dominant 2024 season both score near 100, regardless of the points system in use. The rank shown is where each driver finished in the global f1δ standings that year.</p>`} <h4 data-astro-cid-wh272q75>Career f1δ — who accumulated the most?</h4> <p data-astro-cid-wh272q75>Every season is scored as a share of that year's maximum possible points, on a 0–100 scale, then summed across a whole career. <strong data-astro-cid-wh272q75>Formula:</strong> season f1δ = (points scored ÷ maximum points winnable that season) × 100; career f1δ = the sum of every season. <strong data-astro-cid-wh272q75>Worked example:</strong> Verstappen's 2023 = 575 ÷ 620 × 100 = <strong data-astro-cid-wh272q75>92.7</strong>. <strong data-astro-cid-wh272q75>Why:</strong> dividing each season by its own era's maximum makes eras comparable — dominating a 7-race 1950 season and a 24-race 2024 season both come out near 100%, even though a win was worth 8 points then and 25 now. Summing rewards longevity. Indy 500 excluded; a DNF is simply a zero.</p> <h4 data-astro-cid-wh272q75>Peak f1δ — whose single best season was most dominant?</h4> <p data-astro-cid-wh272q75>A driver's highest single-season f1δ — their most dominant year, on its own. <strong data-astro-cid-wh272q75>Formula:</strong> the maximum of a driver's season scores. <strong data-astro-cid-wh272q75>Worked example:</strong> Verstappen's peak is his 2023 season — <strong data-astro-cid-wh272q75>92.7</strong>. <strong data-astro-cid-wh272q75>Why:</strong> the career total rewards longevity, so a short, ferocious peak can hide inside a lower lifetime sum. Peak isolates the single best year, so a driver whose brilliance was intense but brief stands where they belong.</p> <h4 data-astro-cid-wh272q75>Seasonal podiums &amp; dominant stretch — who stayed at the top longest?</h4> <p data-astro-cid-wh272q75>Rank every driver by f1δ each season. Finishing top-3 that year is a <strong data-astro-cid-wh272q75>seasonal podium</strong>; finishing 1st is a <strong data-astro-cid-wh272q75>seasonal win</strong>. A <strong data-astro-cid-wh272q75>dominant stretch</strong> is the longest run of consecutive seasons at top-3. <strong data-astro-cid-wh272q75>Formula:</strong> for each season, rank all drivers by f1δ; seasonal podium = f1δ rank ≤ 3; dominant stretch = longest run of consecutive seasonal podiums. <strong data-astro-cid-wh272q75>Worked example:</strong> Hamilton holds the record — 8 straight seasonal podiums (2014–2021). Schumacher ran 7 in a row (2000–2006); Verstappen's run stands at 7 (2019–2025). <strong data-astro-cid-wh272q75>Why:</strong> dominance is where you placed among the field, not your raw score. Hamilton in 2016 lost the title by five points but still scored a top-3 f1δ — something a binary "champion / not champion" would miss.</p> </div> </details>`;
}, "/Users/thomaspayment/f1delta/src/components/F1DeltaExplain.astro", void 0);

const $$ReliabilityExplain = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ReliabilityExplain;
  const { open = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<details class="rel-explain"${addAttribute(open || void 0, "open")} data-astro-cid-ez5qnbff> <summary data-astro-cid-ez5qnbff>DNF rate &amp; points-finish rate</summary> <div class="rel-xbody" data-astro-cid-ez5qnbff> <h4 data-astro-cid-ez5qnbff>DNF rate — "how often did they not finish?"</h4> <p data-astro-cid-ez5qnbff>The share of race starts that ended without a classified finish. <strong data-astro-cid-ez5qnbff>Formula:</strong> races not finished ÷ race starts × 100. Races the driver did not start are excluded from both sides. A disqualification counts as a finish that scored nothing, not a DNF. <strong data-astro-cid-ez5qnbff>Why it sits apart from the era-fair rates:</strong> unlike a win or a podium, <em data-astro-cid-ez5qnbff>finishing</em> meant something very different in different eras. Cars in the 1950s–70s broke constantly; modern cars almost always reach the flag. A high DNF rate in 1955 says far more about the machinery than the driver. Comparing two drivers within the same season is meaningful — they faced the same conditions. Across eras it's context, not a verdict.</p> <h4 data-astro-cid-ez5qnbff>Points-finish rate — "how often did they score?"</h4> <p data-astro-cid-ez5qnbff>The share of race starts that ended in a points-paying position. <strong data-astro-cid-ez5qnbff>Formula:</strong> races finished in a scoring position ÷ race starts × 100, using that season's real points system. <strong data-astro-cid-ez5qnbff>Why it's era-dependent:</strong> the number of positions that pay points has changed repeatedly — the top five scored in 1950, the top ten score today. A modern driver has roughly twice as many scoring positions available for the same relative performance, so a higher percentage doesn't necessarily mean a better driver. Like DNF rate, it's shown as context.</p> </div> </details>`;
}, "/Users/thomaspayment/f1delta/src/components/ReliabilityExplain.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const prerender = false;
const $$slug = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const _root = path.resolve(".");
  const { pairings: _pairings } = JSON.parse(
    fs.readFileSync(path.join(_root, "data/h2h-pairings.json"), "utf8")
  );
  const h2hSlugs = new Set(_pairings.map((p) => p.slug));
  const { drivers: _driverIndex } = JSON.parse(
    fs.readFileSync(path.join(_root, "data/drivers/index.json"), "utf8")
  );
  const validIds = new Set(_driverIndex.map((d) => d.driverId));
  const { slug } = Astro2.params;
  const vsIdx = slug ? slug.indexOf("-vs-") : -1;
  if (!slug || vsIdx < 0) return new Response(null, { status: 404 });
  const rawA = slug.slice(0, vsIdx);
  const rawB = slug.slice(vsIdx + 4);
  if (!rawA || !rawB) return new Response(null, { status: 404 });
  const yearRe = /-(\d{4})$/;
  const mA = rawA.match(yearRe);
  const mB = rawB.match(yearRe);
  const isSeasonMode = mA != null && mB != null;
  const idA = isSeasonMode ? rawA.slice(0, mA.index) : rawA;
  const idB = isSeasonMode ? rawB.slice(0, mB.index) : rawB;
  const yearA = isSeasonMode ? parseInt(mA[1]) : null;
  const yearB = isSeasonMode ? parseInt(mB[1]) : null;
  if (idA === idB) return new Response(null, { status: 404 });
  if (!validIds.has(idA) || !validIds.has(idB)) {
    return new Response(null, { status: 404 });
  }
  if (idA > idB) {
    const canonical2 = isSeasonMode ? `/compare/${idB}-${yearB}-vs-${idA}-${yearA}` : `/compare/${idB}-vs-${idA}`;
    return Astro2.redirect(canonical2, 301);
  }
  let dA, dB;
  try {
    dA = JSON.parse(fs.readFileSync(path.join(_root, `data/drivers/${idA}.json`), "utf8"));
    dB = JSON.parse(fs.readFileSync(path.join(_root, `data/drivers/${idB}.json`), "utf8"));
  } catch {
    return new Response(null, { status: 404 });
  }
  const csA = isSeasonMode ? dA.career.find((c) => c.season === yearA) ?? null : null;
  const csB = isSeasonMode ? dB.career.find((c) => c.season === yearB) ?? null : null;
  if (isSeasonMode && (!csA || !csB)) return new Response(null, { status: 404 });
  Astro2.response.headers.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400"
  );
  const tA = dA.totals ?? {};
  const tB = dB.totals ?? {};
  function pct(n, d) {
    return d > 0 ? (n / d * 100).toFixed(1) + "%" : "—";
  }
  function fmt(n) {
    if (n == null) return "—";
    return n % 1 === 0 ? String(n) : n.toFixed(1);
  }
  function careerTeams(d) {
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const s of d.career ?? []) {
      for (const t of s.teams ?? []) {
        if (t.constructorId && !seen.has(t.constructorId)) {
          seen.add(t.constructorId);
          result.push({ id: t.constructorId, name: t.constructor });
        }
      }
    }
    return result;
  }
  const teamsA = careerTeams(dA);
  const teamsB = careerTeams(dB);
  const seasonsA = Object.keys(dA.career ?? {}).length;
  const seasonsB = Object.keys(dB.career ?? {}).length;
  const rateRows = [
    {
      label: "Win %",
      aVal: pct(tA.wins ?? 0, tA.races ?? 0),
      bVal: pct(tB.wins ?? 0, tB.races ?? 0),
      aRaw: (tA.wins ?? 0) / (tA.races || 1),
      bRaw: (tB.wins ?? 0) / (tB.races || 1)
    },
    {
      label: "Podium %",
      aVal: pct(tA.podiums ?? 0, tA.races ?? 0),
      bVal: pct(tB.podiums ?? 0, tB.races ?? 0),
      aRaw: (tA.podiums ?? 0) / (tA.races || 1),
      bRaw: (tB.podiums ?? 0) / (tB.races || 1)
    },
    {
      label: "Pole %",
      aVal: pct(tA.poles ?? 0, tA.races ?? 0),
      bVal: pct(tB.poles ?? 0, tB.races ?? 0),
      aRaw: (tA.poles ?? 0) / (tA.races || 1),
      bRaw: (tB.poles ?? 0) / (tB.races || 1)
    }
  ];
  const h2hSlug = [idA, idB].sort().join("-vs-");
  const hasH2H = h2hSlugs.has(h2hSlug);
  const f1dA = dA.f1delta ?? {};
  const f1dB = dB.f1delta ?? {};
  const hasF1D = f1dA.career != null || f1dB.career != null;
  const f1dRows = [
    {
      label: "Career f1δ",
      aVal: f1dA.career != null ? f1dA.career.toFixed(1) : "—",
      bVal: f1dB.career != null ? f1dB.career.toFixed(1) : "—",
      aRaw: f1dA.career ?? 0,
      bRaw: f1dB.career ?? 0
    },
    {
      label: "Peak season",
      aVal: f1dA.peak != null ? `${f1dA.peak.toFixed(1)} (${f1dA.peakYear})` : "—",
      bVal: f1dB.peak != null ? `${f1dB.peak.toFixed(1)} (${f1dB.peakYear})` : "—",
      aRaw: f1dA.peak ?? 0,
      bRaw: f1dB.peak ?? 0
    },
    {
      label: "Seasonal wins",
      aVal: f1dA.seasonalWins != null ? String(f1dA.seasonalWins) : "—",
      bVal: f1dB.seasonalWins != null ? String(f1dB.seasonalWins) : "—",
      aRaw: f1dA.seasonalWins ?? 0,
      bRaw: f1dB.seasonalWins ?? 0
    },
    {
      label: "Seasonal podiums",
      aVal: f1dA.seasonalPodiums != null ? String(f1dA.seasonalPodiums) : "—",
      bVal: f1dB.seasonalPodiums != null ? String(f1dB.seasonalPodiums) : "—",
      aRaw: f1dA.seasonalPodiums ?? 0,
      bRaw: f1dB.seasonalPodiums ?? 0
    },
    {
      label: "Longest stretch",
      aVal: f1dA.dominantStretch > 0 ? `${f1dA.dominantStretch} · ${f1dA.stretchStart}–${f1dA.stretchEnd}` : f1dA.career != null ? "0" : "—",
      bVal: f1dB.dominantStretch > 0 ? `${f1dB.dominantStretch} · ${f1dB.stretchStart}–${f1dB.stretchEnd}` : f1dB.career != null ? "0" : "—",
      aRaw: f1dA.dominantStretch ?? 0,
      bRaw: f1dB.dominantStretch ?? 0
    }
  ];
  const f1dSeasonA = isSeasonMode ? f1dA.seasons?.find((s) => s.year === yearA) ?? null : null;
  const f1dSeasonB = isSeasonMode ? f1dB.seasons?.find((s) => s.year === yearB) ?? null : null;
  const peakYearA = f1dA.peakYear ?? dA.firstSeason;
  const peakYearB = f1dB.peakYear ?? dB.firstSeason;
  const careerUrl = "/compare/" + idA + "-vs-" + idB;
  const toSeasonUrl = "/compare/" + idA + "-" + peakYearA + "-vs-" + idB + "-" + peakYearB;
  const relPct = (n, d) => d > 0 ? (n / d * 100).toFixed(1) + "%" : "—";
  const relRows = [
    {
      label: "DNF rate",
      aVal: relPct(tA.dnfCount ?? 0, tA.races ?? 0),
      bVal: relPct(tB.dnfCount ?? 0, tB.races ?? 0)
    },
    {
      label: "Points-finish rate",
      aVal: relPct(tA.pointsFinishes ?? 0, tA.races ?? 0),
      bVal: relPct(tB.pointsFinishes ?? 0, tB.races ?? 0)
    }
  ];
  const stripA = f1dA.seasons ?? [];
  const stripB = f1dB.seasons ?? [];
  const stripCols = Math.max(stripA.length, stripB.length);
  const birthYearA = dA.dateOfBirth ? parseInt(dA.dateOfBirth.slice(0, 4)) : null;
  const birthYearB = dB.dateOfBirth ? parseInt(dB.dateOfBirth.slice(0, 4)) : null;
  const stripAWithAge = stripA.map((s) => ({
    year: s.year,
    f1delta: s.f1delta,
    rank: s.rank,
    age: birthYearA != null ? s.year - birthYearA : null
  }));
  const stripBWithAge = stripB.map((s) => ({
    year: s.year,
    f1delta: s.f1delta,
    rank: s.rank,
    age: birthYearB != null ? s.year - birthYearB : null
  }));
  const pageTitle = isSeasonMode ? `${dA.name} ${yearA} vs ${dB.name} ${yearB} — f1delta` : `${dA.name} vs ${dB.name} — f1delta`;
  const pageDesc = isSeasonMode ? `Compare ${dA.name}'s ${yearA} season against ${dB.name}'s ${yearB} season: f1δ scores, wins, podiums, and rates.` : `Compare ${dA.name} and ${dB.name}: championships, wins, podiums, poles, and career rates.`;
  const canonical = `https://f1delta.com/compare/${slug}`;
  return renderTemplate(_a || (_a = __template(["", ` <script>
(function () {
  var el = document.getElementById('f1ds-chart');
  if (!el) return;

  var stripA = JSON.parse(el.dataset.a);
  var stripB = JSON.parse(el.dataset.b);
  var highlightA = parseInt(el.dataset.ha) || null;
  var highlightB = parseInt(el.dataset.hb) || null;

  var W = 560, CH = 60, LH = 14, H = CH + LH;

  function py(v) { return +(CH - v * CH / 100).toFixed(2); }

  function rankFill(r) {
    if (r === 1) return '#b8952a';
    if (r <= 3) return '#e10600';
    if (r != null) return '#9398a3';
    return '#c0c4c8';
  }

  function buildCols(mode) {
    if (mode === 'career') {
      var len = Math.max(stripA.length, stripB.length);
      return Array.from({ length: len }, function (_, i) {
        return { aData: stripA[i] || null, bData: stripB[i] || null, label: String(i + 1) };
      });
    }
    if (mode === 'age') {
      var ages = stripA.concat(stripB).map(function (s) { return s.age; }).filter(function (a) { return a != null; });
      if (!ages.length) return buildCols('career');
      var lo = Math.min.apply(null, ages), hi = Math.max.apply(null, ages);
      return Array.from({ length: hi - lo + 1 }, function (_, i) {
        var age = lo + i;
        return {
          aData: stripA.find(function (s) { return s.age === age; }) || null,
          bData: stripB.find(function (s) { return s.age === age; }) || null,
          label: String(age),
        };
      });
    }
    // calendar
    var years = stripA.concat(stripB).map(function (s) { return s.year; });
    var lo2 = Math.min.apply(null, years), hi2 = Math.max.apply(null, years);
    return Array.from({ length: hi2 - lo2 + 1 }, function (_, i) {
      var yr = lo2 + i;
      return {
        aData: stripA.find(function (s) { return s.year === yr; }) || null,
        bData: stripB.find(function (s) { return s.year === yr; }) || null,
        label: "'" + String(yr).slice(2),
      };
    });
  }

  function pathFor(cols, key) {
    var cw = W / cols.length;
    var d = '', prevHad = false;
    cols.forEach(function (col, i) {
      var s = col[key];
      if (!s) { prevHad = false; return; }
      var x = ((i + 0.5) * cw).toFixed(1);
      var y = py(s.f1delta);
      d += (prevHad ? ' L' : ' M') + x + ',' + y;
      prevHad = true;
    });
    return d.trim();
  }

  function esc(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function render(mode) {
    var cols = buildCols(mode);
    var n = cols.length;
    if (!n) return;
    var cw = W / n;
    var skip = Math.max(1, Math.ceil(n / 15));
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;display:block;overflow:visible" aria-hidden="true">';

    // grid lines
    [25, 50, 75].forEach(function (v) {
      svg += '<line x1="0" y1="' + py(v) + '" x2="' + W + '" y2="' + py(v) + '" stroke="#e4e4df" stroke-width="0.5"/>';
    });

    // paths
    var pa = pathFor(cols, 'aData');
    if (pa) svg += '<path d="' + pa + '" fill="none" stroke="#e10600" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>';
    var pb = pathFor(cols, 'bData');
    if (pb) svg += '<path d="' + pb + '" fill="none" stroke="#6b6b70" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="4 2"/>';

    // B dots first so A appears on top
    cols.forEach(function (col, i) {
      if (!col.bData) return;
      var x = ((i + 0.5) * cw).toFixed(1), y = py(col.bData.f1delta);
      var tip = esc(col.bData.year + ': ' + col.bData.f1delta.toFixed(1) + ' f1δ' + (col.bData.rank ? ' \\xb7 #' + col.bData.rank : ''));
      svg += '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + rankFill(col.bData.rank) + '" stroke="#fff" stroke-width="1" opacity="0.9"><title>' + tip + '</title></circle>';
    });
    cols.forEach(function (col, i) {
      if (!col.aData) return;
      var x = ((i + 0.5) * cw).toFixed(1), y = py(col.aData.f1delta);
      var tip = esc(col.aData.year + ': ' + col.aData.f1delta.toFixed(1) + ' f1δ' + (col.aData.rank ? ' \\xb7 #' + col.aData.rank : ''));
      svg += '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="' + rankFill(col.aData.rank) + '" stroke="#fff" stroke-width="1"><title>' + tip + '</title></circle>';
    });

    // highlight rings for season-mode selected years
    if (highlightA || highlightB) {
      cols.forEach(function (col, i) {
        var x = ((i + 0.5) * cw).toFixed(1);
        if (highlightA && col.aData && col.aData.year === highlightA) {
          svg += '<circle cx="' + x + '" cy="' + py(col.aData.f1delta) + '" r="6.5" fill="none" stroke="#e10600" stroke-width="1.5" opacity="0.6"/>';
        }
        if (highlightB && col.bData && col.bData.year === highlightB) {
          svg += '<circle cx="' + x + '" cy="' + py(col.bData.f1delta) + '" r="6.5" fill="none" stroke="#6b6b70" stroke-width="1.5" stroke-dasharray="3 1" opacity="0.6"/>';
        }
      });
    }

    // x-axis labels
    cols.forEach(function (col, i) {
      if (i % skip !== 0 && i !== n - 1) return;
      var x = ((i + 0.5) * cw).toFixed(1);
      svg += '<text x="' + x + '" y="' + (H - 2) + '" text-anchor="middle" font-size="7" font-family="monospace" fill="#9398a3">' + esc(col.label) + '</text>';
    });

    svg += '</svg>';
    el.innerHTML = svg;
  }

  var mode = 'career';
  render(mode);

  document.querySelectorAll('.f1dt[data-align]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.f1dt[data-align]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      mode = btn.dataset.align;
      render(mode);
    });
  });
}());

document.querySelectorAll('.yr-sel').forEach(function (sel) {
  sel.addEventListener('change', function () {
    var side = sel.dataset.side;
    var yr = sel.value;
    var aId = sel.dataset.aid, bId = sel.dataset.bid;
    var aYr = sel.dataset.ayear, bYr = sel.dataset.byear;
    var newA = side === 'a' ? yr : aYr;
    var newB = side === 'b' ? yr : bYr;
    window.location = '/compare/' + aId + '-' + newA + '-vs-' + bId + '-' + newB;
  });
});
<\/script>`], ["", ` <script>
(function () {
  var el = document.getElementById('f1ds-chart');
  if (!el) return;

  var stripA = JSON.parse(el.dataset.a);
  var stripB = JSON.parse(el.dataset.b);
  var highlightA = parseInt(el.dataset.ha) || null;
  var highlightB = parseInt(el.dataset.hb) || null;

  var W = 560, CH = 60, LH = 14, H = CH + LH;

  function py(v) { return +(CH - v * CH / 100).toFixed(2); }

  function rankFill(r) {
    if (r === 1) return '#b8952a';
    if (r <= 3) return '#e10600';
    if (r != null) return '#9398a3';
    return '#c0c4c8';
  }

  function buildCols(mode) {
    if (mode === 'career') {
      var len = Math.max(stripA.length, stripB.length);
      return Array.from({ length: len }, function (_, i) {
        return { aData: stripA[i] || null, bData: stripB[i] || null, label: String(i + 1) };
      });
    }
    if (mode === 'age') {
      var ages = stripA.concat(stripB).map(function (s) { return s.age; }).filter(function (a) { return a != null; });
      if (!ages.length) return buildCols('career');
      var lo = Math.min.apply(null, ages), hi = Math.max.apply(null, ages);
      return Array.from({ length: hi - lo + 1 }, function (_, i) {
        var age = lo + i;
        return {
          aData: stripA.find(function (s) { return s.age === age; }) || null,
          bData: stripB.find(function (s) { return s.age === age; }) || null,
          label: String(age),
        };
      });
    }
    // calendar
    var years = stripA.concat(stripB).map(function (s) { return s.year; });
    var lo2 = Math.min.apply(null, years), hi2 = Math.max.apply(null, years);
    return Array.from({ length: hi2 - lo2 + 1 }, function (_, i) {
      var yr = lo2 + i;
      return {
        aData: stripA.find(function (s) { return s.year === yr; }) || null,
        bData: stripB.find(function (s) { return s.year === yr; }) || null,
        label: "'" + String(yr).slice(2),
      };
    });
  }

  function pathFor(cols, key) {
    var cw = W / cols.length;
    var d = '', prevHad = false;
    cols.forEach(function (col, i) {
      var s = col[key];
      if (!s) { prevHad = false; return; }
      var x = ((i + 0.5) * cw).toFixed(1);
      var y = py(s.f1delta);
      d += (prevHad ? ' L' : ' M') + x + ',' + y;
      prevHad = true;
    });
    return d.trim();
  }

  function esc(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function render(mode) {
    var cols = buildCols(mode);
    var n = cols.length;
    if (!n) return;
    var cw = W / n;
    var skip = Math.max(1, Math.ceil(n / 15));
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;display:block;overflow:visible" aria-hidden="true">';

    // grid lines
    [25, 50, 75].forEach(function (v) {
      svg += '<line x1="0" y1="' + py(v) + '" x2="' + W + '" y2="' + py(v) + '" stroke="#e4e4df" stroke-width="0.5"/>';
    });

    // paths
    var pa = pathFor(cols, 'aData');
    if (pa) svg += '<path d="' + pa + '" fill="none" stroke="#e10600" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>';
    var pb = pathFor(cols, 'bData');
    if (pb) svg += '<path d="' + pb + '" fill="none" stroke="#6b6b70" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="4 2"/>';

    // B dots first so A appears on top
    cols.forEach(function (col, i) {
      if (!col.bData) return;
      var x = ((i + 0.5) * cw).toFixed(1), y = py(col.bData.f1delta);
      var tip = esc(col.bData.year + ': ' + col.bData.f1delta.toFixed(1) + ' f1δ' + (col.bData.rank ? ' \\\\xb7 #' + col.bData.rank : ''));
      svg += '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + rankFill(col.bData.rank) + '" stroke="#fff" stroke-width="1" opacity="0.9"><title>' + tip + '</title></circle>';
    });
    cols.forEach(function (col, i) {
      if (!col.aData) return;
      var x = ((i + 0.5) * cw).toFixed(1), y = py(col.aData.f1delta);
      var tip = esc(col.aData.year + ': ' + col.aData.f1delta.toFixed(1) + ' f1δ' + (col.aData.rank ? ' \\\\xb7 #' + col.aData.rank : ''));
      svg += '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="' + rankFill(col.aData.rank) + '" stroke="#fff" stroke-width="1"><title>' + tip + '</title></circle>';
    });

    // highlight rings for season-mode selected years
    if (highlightA || highlightB) {
      cols.forEach(function (col, i) {
        var x = ((i + 0.5) * cw).toFixed(1);
        if (highlightA && col.aData && col.aData.year === highlightA) {
          svg += '<circle cx="' + x + '" cy="' + py(col.aData.f1delta) + '" r="6.5" fill="none" stroke="#e10600" stroke-width="1.5" opacity="0.6"/>';
        }
        if (highlightB && col.bData && col.bData.year === highlightB) {
          svg += '<circle cx="' + x + '" cy="' + py(col.bData.f1delta) + '" r="6.5" fill="none" stroke="#6b6b70" stroke-width="1.5" stroke-dasharray="3 1" opacity="0.6"/>';
        }
      });
    }

    // x-axis labels
    cols.forEach(function (col, i) {
      if (i % skip !== 0 && i !== n - 1) return;
      var x = ((i + 0.5) * cw).toFixed(1);
      svg += '<text x="' + x + '" y="' + (H - 2) + '" text-anchor="middle" font-size="7" font-family="monospace" fill="#9398a3">' + esc(col.label) + '</text>';
    });

    svg += '</svg>';
    el.innerHTML = svg;
  }

  var mode = 'career';
  render(mode);

  document.querySelectorAll('.f1dt[data-align]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.f1dt[data-align]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      mode = btn.dataset.align;
      render(mode);
    });
  });
}());

document.querySelectorAll('.yr-sel').forEach(function (sel) {
  sel.addEventListener('change', function () {
    var side = sel.dataset.side;
    var yr = sel.value;
    var aId = sel.dataset.aid, bId = sel.dataset.bid;
    var aYr = sel.dataset.ayear, bYr = sel.dataset.byear;
    var newA = side === 'a' ? yr : aYr;
    var newB = side === 'b' ? yr : bYr;
    window.location = '/compare/' + aId + '-' + newA + '-vs-' + bId + '-' + newB;
  });
});
<\/script>`])), renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": pageTitle, "description": pageDesc, "canonical": canonical, "data-astro-cid-bdsczzry": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="cmp" data-astro-cid-bdsczzry> <!-- Header --> <div class="cmp-hd" data-astro-cid-bdsczzry> <div class="cmp-names" data-astro-cid-bdsczzry> <a class="cmp-name"${addAttribute("/drivers/" + idA, "href")} data-astro-cid-bdsczzry>${dA.name}</a> <span class="cmp-sep" data-astro-cid-bdsczzry>vs</span> <a class="cmp-name"${addAttribute("/drivers/" + idB, "href")} data-astro-cid-bdsczzry>${dB.name}</a> </div> <p class="cmp-back" data-astro-cid-bdsczzry><a href="/compare" data-astro-cid-bdsczzry>← Compare another pair</a></p> </div> <!-- Mode toggle --> <div class="mode-ctrl" data-astro-cid-bdsczzry> <a${addAttribute(careerUrl, "href")}${addAttribute(["mode-btn", { "mode-active": !isSeasonMode }], "class:list")} data-astro-cid-bdsczzry>Career</a> <a${addAttribute(toSeasonUrl, "href")}${addAttribute(["mode-btn", { "mode-active": isSeasonMode }], "class:list")} data-astro-cid-bdsczzry>Season</a> </div> <!-- Comparison grid --> <div class="card" data-astro-cid-bdsczzry> <div class="table-scroll" data-astro-cid-bdsczzry> <table class="cmp-tbl" data-astro-cid-bdsczzry> <thead data-astro-cid-bdsczzry> <tr data-astro-cid-bdsczzry> <th class="lbl" data-astro-cid-bdsczzry></th> <th class="drv-col" data-astro-cid-bdsczzry> <a${addAttribute("/drivers/" + idA, "href")} data-astro-cid-bdsczzry>${dA.name}</a> ${isSeasonMode && renderTemplate`<select class="yr-sel" data-side="a"${addAttribute(idA, "data-aid")}${addAttribute(idB, "data-bid")}${addAttribute(yearA, "data-ayear")}${addAttribute(yearB, "data-byear")} data-astro-cid-bdsczzry> ${dA.career.slice().sort((a, b) => b.season - a.season).map((c) => renderTemplate`<option${addAttribute(c.season, "value")}${addAttribute(c.season === yearA, "selected")} data-astro-cid-bdsczzry>${c.season}</option>`)} </select>`} </th> <th class="drv-col" data-astro-cid-bdsczzry> <a${addAttribute("/drivers/" + idB, "href")} data-astro-cid-bdsczzry>${dB.name}</a> ${isSeasonMode && renderTemplate`<select class="yr-sel" data-side="b"${addAttribute(idA, "data-aid")}${addAttribute(idB, "data-bid")}${addAttribute(yearA, "data-ayear")}${addAttribute(yearB, "data-byear")} data-astro-cid-bdsczzry> ${dB.career.slice().sort((a, b) => b.season - a.season).map((c) => renderTemplate`<option${addAttribute(c.season, "value")}${addAttribute(c.season === yearB, "selected")} data-astro-cid-bdsczzry>${c.season}</option>`)} </select>`} </th> </tr> </thead> <tbody data-astro-cid-bdsczzry> <!-- ── CAREER / SEASON ────────────────────────────── --> ${isSeasonMode ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Season</th></tr> <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Season</td> <td class="val neutral" data-astro-cid-bdsczzry><a${addAttribute("/standings/" + yearA, "href")} data-astro-cid-bdsczzry>${yearA}</a></td> <td class="val neutral" data-astro-cid-bdsczzry><a${addAttribute("/standings/" + yearB, "href")} data-astro-cid-bdsczzry>${yearB}</a></td> </tr> <tr class="teams-row" data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Team</td> <td class="val neutral teams" data-astro-cid-bdsczzry> ${csA.teams.map((t, i) => renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result4) => renderTemplate`${i > 0 && renderTemplate`<span class="tsep" data-astro-cid-bdsczzry>, </span>`}<a${addAttribute("/teams/" + t.constructorId, "href")} data-astro-cid-bdsczzry>${t.constructor}</a>` })}`)} </td> <td class="val neutral teams" data-astro-cid-bdsczzry> ${csB.teams.map((t, i) => renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result4) => renderTemplate`${i > 0 && renderTemplate`<span class="tsep" data-astro-cid-bdsczzry>, </span>`}<a${addAttribute("/teams/" + t.constructorId, "href")} data-astro-cid-bdsczzry>${t.constructor}</a>` })}`)} </td> </tr> <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Races</td> <td class="val neutral" data-astro-cid-bdsczzry>${csA.races ?? "—"}</td> <td class="val neutral" data-astro-cid-bdsczzry>${csB.races ?? "—"}</td> </tr> ${(() => {
    const aPos = csA.wdcFinish ?? 99, bPos = csB.wdcFinish ?? 99;
    return renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>WDC finish</td> <td${addAttribute(["val", { win: aPos < bPos && aPos < 99, lose: bPos < aPos && bPos < 99 }], "class:list")} data-astro-cid-bdsczzry> ${csA.wdcFinish ? "P" + csA.wdcFinish : "—"} </td> <td${addAttribute(["val", { win: bPos < aPos && bPos < 99, lose: aPos < bPos && aPos < 99 }], "class:list")} data-astro-cid-bdsczzry> ${csB.wdcFinish ? "P" + csB.wdcFinish : "—"} </td> </tr>`;
  })()}` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Career</th></tr> ${(() => {
    const a = tA.championships ?? 0, b = tB.championships ?? 0;
    const aWin = a > b, bWin = b > a;
    return renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Championships</td> <td${addAttribute(["val", { win: aWin, lose: bWin && !aWin }], "class:list")} data-astro-cid-bdsczzry>${a || "—"}</td> <td${addAttribute(["val", { win: bWin, lose: aWin && !bWin }], "class:list")} data-astro-cid-bdsczzry>${b || "—"}</td> </tr>`;
  })()}<tr data-astro-cid-bdsczzry><td class="lbl" data-astro-cid-bdsczzry>Career span</td><td class="val neutral" data-astro-cid-bdsczzry>${dA.firstSeason}–${dA.lastSeason}</td><td class="val neutral" data-astro-cid-bdsczzry>${dB.firstSeason}–${dB.lastSeason}</td></tr> ` })}<tr data-astro-cid-bdsczzry><td class="lbl" data-astro-cid-bdsczzry>Seasons</td><td class="val neutral" data-astro-cid-bdsczzry>${seasonsA}</td><td class="val neutral" data-astro-cid-bdsczzry>${seasonsB}</td></tr>
                <tr data-astro-cid-bdsczzry><td class="lbl" data-astro-cid-bdsczzry>Race starts</td><td class="val neutral" data-astro-cid-bdsczzry>${tA.races ?? "—"}</td><td class="val neutral" data-astro-cid-bdsczzry>${tB.races ?? "—"}</td></tr>
                <tr class="teams-row" data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Teams</td> <td class="val neutral teams" data-astro-cid-bdsczzry> ${teamsA.map((t, i) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate`${i > 0 && renderTemplate`<span class="tsep" data-astro-cid-bdsczzry>, </span>`}<a${addAttribute("/teams/" + t.id, "href")} data-astro-cid-bdsczzry>${t.name}</a>` })}`)} </td> <td class="val neutral teams" data-astro-cid-bdsczzry> ${teamsB.map((t, i) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate`${i > 0 && renderTemplate`<span class="tsep" data-astro-cid-bdsczzry>, </span>`}<a${addAttribute("/teams/" + t.id, "href")} data-astro-cid-bdsczzry>${t.name}</a>` })}`)} </td> </tr>`} <!-- ── f1δ SCORE ──────────────────────────────────── --> ${hasF1D && (isSeasonMode ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry> <th colspan="3" data-astro-cid-bdsczzry>f1δ Score <span class="grp-note" data-astro-cid-bdsczzry>era-fair · season vs season · <a href="/methodology" class="grp-link" data-astro-cid-bdsczzry>what is this?</a></span></th> </tr> ${(() => {
    const aV = f1dSeasonA?.f1delta ?? null;
    const bV = f1dSeasonB?.f1delta ?? null;
    const aWin = aV != null && bV != null && aV > bV;
    const bWin = aV != null && bV != null && bV > aV;
    return renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Season f1δ · rank</td> <td${addAttribute(["val", { win: aWin, lose: bWin && !aWin }], "class:list")} data-astro-cid-bdsczzry> ${aV != null ? aV.toFixed(1) + " · #" + f1dSeasonA.rank : "—"} </td> <td${addAttribute(["val", { win: bWin, lose: aWin && !bWin }], "class:list")} data-astro-cid-bdsczzry> ${bV != null ? bV.toFixed(1) + " · #" + f1dSeasonB.rank : "—"} </td> </tr>`;
  })()}` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry> <th colspan="3" data-astro-cid-bdsczzry>f1δ Score <span class="grp-note" data-astro-cid-bdsczzry>era-fair dominance · <a href="/methodology" class="grp-link" data-astro-cid-bdsczzry>what is this?</a></span></th> </tr> ${f1dRows.map((row) => {
    const aWin = row.aRaw > row.bRaw, bWin = row.bRaw > row.aRaw;
    return renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>${row.label}</td> <td${addAttribute(["val", { win: aWin, lose: bWin && !aWin }], "class:list")} data-astro-cid-bdsczzry>${row.aVal}</td> <td${addAttribute(["val", { win: bWin, lose: aWin && !bWin }], "class:list")} data-astro-cid-bdsczzry>${row.bVal}</td> </tr>`;
  })}` })}`)} <!-- ── WINS & PODIUMS ──────────────────────────────── --> ${isSeasonMode ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Wins &amp; podiums <span class="grp-note" data-astro-cid-bdsczzry>that season · era-dependent</span></th></tr> ${[
    { label: "Wins", aRaw: csA.wins ?? 0, bRaw: csB.wins ?? 0 },
    { label: "Podiums", aRaw: csA.podiums ?? 0, bRaw: csB.podiums ?? 0 },
    { label: "Poles", aRaw: csA.poles ?? 0, bRaw: csB.poles ?? 0 },
    { label: "Fastest laps", aRaw: csA.fastestLaps ?? 0, bRaw: csB.fastestLaps ?? 0 }
  ].map((row) => {
    const aWin = row.aRaw > row.bRaw, bWin = row.bRaw > row.aRaw;
    return renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>${row.label}</td> <td${addAttribute(["val", { win: aWin, lose: !aWin && bWin }], "class:list")} data-astro-cid-bdsczzry>${row.aRaw}</td> <td${addAttribute(["val", { win: bWin, lose: !bWin && aWin }], "class:list")} data-astro-cid-bdsczzry>${row.bRaw}</td> </tr>`;
  })}` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Wins &amp; podiums <span class="grp-note" data-astro-cid-bdsczzry>era-dependent · not directly comparable across eras</span></th></tr> <tr data-astro-cid-bdsczzry><td class="lbl" data-astro-cid-bdsczzry>Wins</td><td class="val neutral" data-astro-cid-bdsczzry>${fmt(tA.wins)}</td><td class="val neutral" data-astro-cid-bdsczzry>${fmt(tB.wins)}</td></tr> ` })}<tr data-astro-cid-bdsczzry><td class="lbl" data-astro-cid-bdsczzry>Podiums</td><td class="val neutral" data-astro-cid-bdsczzry>${fmt(tA.podiums)}</td><td class="val neutral" data-astro-cid-bdsczzry>${fmt(tB.podiums)}</td></tr>
                <tr data-astro-cid-bdsczzry><td class="lbl" data-astro-cid-bdsczzry>Poles</td><td class="val neutral" data-astro-cid-bdsczzry>${fmt(tA.poles)}</td><td class="val neutral" data-astro-cid-bdsczzry>${fmt(tB.poles)}</td></tr>
                <tr data-astro-cid-bdsczzry><td class="lbl" data-astro-cid-bdsczzry>Fastest laps</td><td class="val neutral" data-astro-cid-bdsczzry>${fmt(tA.fastestLaps)}</td><td class="val neutral" data-astro-cid-bdsczzry>${fmt(tB.fastestLaps)}</td></tr>`} <!-- ── RATES ──────────────────────────────────────── --> ${isSeasonMode ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Season rates <span class="grp-note" data-astro-cid-bdsczzry>that season · same conditions</span></th></tr> ${[
    { label: "Win %", aNum: csA.wins ?? 0, bNum: csB.wins ?? 0 },
    { label: "Podium %", aNum: csA.podiums ?? 0, bNum: csB.podiums ?? 0 },
    { label: "Pole %", aNum: csA.poles ?? 0, bNum: csB.poles ?? 0 }
  ].map((row) => {
    const aR = row.aNum / (csA.races || 1), bR = row.bNum / (csB.races || 1);
    const aWin = aR > bR, bWin = bR > aR;
    return renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>${row.label}</td> <td${addAttribute(["val", { win: aWin, lose: !aWin && bWin }], "class:list")} data-astro-cid-bdsczzry>${pct(row.aNum, csA.races ?? 0)}</td> <td${addAttribute(["val", { win: bWin, lose: !bWin && aWin }], "class:list")} data-astro-cid-bdsczzry>${pct(row.bNum, csB.races ?? 0)}</td> </tr>`;
  })}` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Era-fair rates <span class="grp-note" data-astro-cid-bdsczzry>career rate · across all seasons</span></th></tr> ${rateRows.map((row) => {
    const aWin = row.aRaw > row.bRaw, bWin = row.bRaw > row.aRaw;
    return renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>${row.label}</td> <td${addAttribute(["val", { win: aWin, lose: bWin && !aWin }], "class:list")} data-astro-cid-bdsczzry>${row.aVal}</td> <td${addAttribute(["val", { win: bWin, lose: aWin && !bWin }], "class:list")} data-astro-cid-bdsczzry>${row.bVal}</td> </tr>`;
  })}` })}`} <!-- ── RELIABILITY & CONSISTENCY ──────────────────── --> ${isSeasonMode ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Reliability &amp; consistency <span class="grp-note" data-astro-cid-bdsczzry>that season · conditions matched</span></th></tr> ${(() => {
    const aS = csA.races ?? 0, bS = csB.races ?? 0;
    const dA2 = csA.dnfCount ?? 0, dB2 = csB.dnfCount ?? 0;
    const pA = csA.pointsFinishes ?? 0, pB = csB.pointsFinishes ?? 0;
    const dnfRA = aS > 0 ? dA2 / aS : 0, dnfRB = bS > 0 ? dB2 / bS : 0;
    const pRA = aS > 0 ? pA / aS : 0, pRB = bS > 0 ? pB / bS : 0;
    return renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result4) => renderTemplate` <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>DNF rate</td> <td${addAttribute(["val", { win: aS > 0 && dnfRA < dnfRB, lose: dnfRA > dnfRB }], "class:list")} data-astro-cid-bdsczzry>${relPct(dA2, aS)}</td> <td${addAttribute(["val", { win: bS > 0 && dnfRB < dnfRA, lose: dnfRB > dnfRA }], "class:list")} data-astro-cid-bdsczzry>${relPct(dB2, bS)}</td> </tr> <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Points-finish rate</td> <td${addAttribute(["val", { win: pRA > pRB, lose: aS > 0 && pRA < pRB }], "class:list")} data-astro-cid-bdsczzry>${relPct(pA, aS)}</td> <td${addAttribute(["val", { win: pRB > pRA, lose: bS > 0 && pRB < pRA }], "class:list")} data-astro-cid-bdsczzry>${relPct(pB, bS)}</td> </tr> ` })}`;
  })()}` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Reliability &amp; consistency <span class="grp-note" data-astro-cid-bdsczzry>era-dependent · see explanation</span></th></tr> ${relRows.map((row) => renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>${row.label}</td> <td class="val neutral" data-astro-cid-bdsczzry>${row.aVal}</td> <td class="val neutral" data-astro-cid-bdsczzry>${row.bVal}</td> </tr>`)}` })}`} <!-- ── POINTS ──────────────────────────────────────── --> ${isSeasonMode ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Points <span class="grp-note" data-astro-cid-bdsczzry>that season · scoring-era variable</span></th></tr> ${(() => {
    const aV = csA.points ?? 0, bV = csB.points ?? 0;
    const aWin = aV > bV, bWin = bV > aV;
    return renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Season total</td> <td${addAttribute(["val", { win: aWin, lose: bWin && !aWin }], "class:list")} data-astro-cid-bdsczzry>${fmt(csA.points)}</td> <td${addAttribute(["val", { win: bWin, lose: aWin && !bWin }], "class:list")} data-astro-cid-bdsczzry>${fmt(csB.points)}</td> </tr>`;
  })()}` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate` <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Points <span class="grp-note" data-astro-cid-bdsczzry>scoring-era variable · not directly comparable</span></th></tr> <tr data-astro-cid-bdsczzry><td class="lbl" data-astro-cid-bdsczzry>Career total</td><td class="val neutral" data-astro-cid-bdsczzry>${fmt(tA.points)}</td><td class="val neutral" data-astro-cid-bdsczzry>${fmt(tB.points)}</td></tr> ` })}`} </tbody> </table> </div> ${isSeasonMode && renderTemplate`${renderComponent($$result2, "F1DeltaExplain", $$F1DeltaExplain, { "seasonNote": true, "data-astro-cid-bdsczzry": true })}`} ${stripCols > 0 && renderTemplate`<div class="f1ds-section" data-astro-cid-bdsczzry> <div class="f1ds-hd" data-astro-cid-bdsczzry> <span class="f1ds-title" data-astro-cid-bdsczzry>f1δ season shape</span> <div class="f1dt-row" data-astro-cid-bdsczzry> <button class="f1dt active" data-align="career" data-astro-cid-bdsczzry>career</button> <button class="f1dt" data-align="age" data-astro-cid-bdsczzry>age</button> <button class="f1dt" data-align="calendar" data-astro-cid-bdsczzry>calendar</button> </div> </div> <div class="f1ds-legend" data-astro-cid-bdsczzry> <span class="f1ds-leg" data-astro-cid-bdsczzry> <svg width="16" height="3" aria-hidden="true" class="f1ds-lsvg" data-astro-cid-bdsczzry> <line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#e10600" stroke-width="2" data-astro-cid-bdsczzry></line> </svg> <a${addAttribute("/drivers/" + idA, "href")} class="f1ds-lname" data-astro-cid-bdsczzry>${dA.name}</a> </span> <span class="f1ds-leg" data-astro-cid-bdsczzry> <svg width="16" height="3" aria-hidden="true" class="f1ds-lsvg" data-astro-cid-bdsczzry> <line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#6b6b70" stroke-width="2" stroke-dasharray="4 2" data-astro-cid-bdsczzry></line> </svg> <a${addAttribute("/drivers/" + idB, "href")} class="f1ds-lname" data-astro-cid-bdsczzry>${dB.name}</a> </span> </div> <div class="f1ds-chart" id="f1ds-chart"${addAttribute(JSON.stringify(stripAWithAge), "data-a")}${addAttribute(JSON.stringify(stripBWithAge), "data-b")}${addAttribute(dA.name, "data-na")}${addAttribute(dB.name, "data-nb")}${addAttribute(isSeasonMode ? String(yearA) : "", "data-ha")}${addAttribute(isSeasonMode ? String(yearB) : "", "data-hb")} data-astro-cid-bdsczzry></div> ${renderComponent($$result2, "F1DeltaExplain", $$F1DeltaExplain, { "compareNote": true, "data-astro-cid-bdsczzry": true })} </div>`} ${renderComponent($$result2, "ReliabilityExplain", $$ReliabilityExplain, { "data-astro-cid-bdsczzry": true })} </div> <!-- Ad slot (E2): after table, before footer links --> <div id="cmp-ad-slot" data-ad-slot data-astro-cid-bdsczzry></div> <!-- H2H cross-link (E1): only if they were teammates with a race-comparable pairing --> ${hasH2H && renderTemplate`<div class="h2h-xlink" data-astro-cid-bdsczzry> <span class="h2h-xlink-icon" data-astro-cid-bdsczzry>🏎</span> <div data-astro-cid-bdsczzry> <strong data-astro-cid-bdsczzry>They shared a car.</strong> <a class="h2h-xlink-a"${addAttribute(`/h2h/${h2hSlug}`, "href")} data-astro-cid-bdsczzry>See the teammate head-to-head →</a> </div> </div>`} <!-- Footer links (E1) --> <div class="cmp-foot" data-astro-cid-bdsczzry> <a${addAttribute(`/drivers/${idA}`, "href")} data-astro-cid-bdsczzry>${dA.name} career page →</a> <a${addAttribute(`/drivers/${idB}`, "href")} data-astro-cid-bdsczzry>${dB.name} career page →</a> </div> </div> ` }));
}, "/Users/thomaspayment/f1delta/src/pages/compare/[slug].astro", void 0);

const $$file = "/Users/thomaspayment/f1delta/src/pages/compare/[slug].astro";
const $$url = "/compare/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
