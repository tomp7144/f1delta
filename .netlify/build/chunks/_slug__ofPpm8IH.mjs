import { c as createComponent } from './astro-component_BwGJO027.mjs';
import 'piccolore';
import { r as renderTemplate, i as renderSlot, f as addAttribute, j as renderHead, k as renderComponent, m as maybeRenderHead, l as Fragment } from './ssr-function_CkMfTDrb.mjs';
import fs from 'node:fs';
import path from 'node:path';
import 'clsx';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
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
    return "";
  }
  const current = navKey(pathname);
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-astro-cid-37fxchfa> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', "</title>", "", '<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/f1-table.css">', `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{&quot;token&quot;:&quot;231dcb0acef2461c8d76032d94a31207&quot;}"><\/script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=JetBrains+Mono:wght@400;700&display=swap"><!-- AdSense site verification --><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6298973348658731" crossorigin="anonymous"><\/script><!-- Google Consent Mode v2 — defaults set BEFORE gtag loads --><script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'wait_for_update': 500
      });
    <\/script><!-- Google Analytics (GA4) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-WJ7VNMC69K"><\/script><script>
      gtag('js', new Date());
      gtag('config', 'G-WJ7VNMC69K');
    <\/script>`, '</head> <body style="margin:0;background:#f4f4f1" data-astro-cid-37fxchfa> <nav class="site-nav" data-astro-cid-37fxchfa> <div class="nav-inner" data-astro-cid-37fxchfa> <a class="wordmark" href="/" data-astro-cid-37fxchfa>F1<svg class="wm-tri" aria-hidden="true" width="11" height="10" viewBox="0 0 100 86" data-astro-cid-37fxchfa><path d="M50 4 L97 82 L3 82 Z" fill="currentColor" data-astro-cid-37fxchfa></path></svg>DELTA</a> <div class="nav-links" id="nav-links" data-astro-cid-37fxchfa> <a href="/drivers"', ' data-astro-cid-37fxchfa>Drivers</a> <a href="/teams"', " data-astro-cid-37fxchfa>Teams</a> <div", ' data-astro-cid-37fxchfa> <button class="nav-group-btn" aria-haspopup="true" aria-expanded="false" data-astro-cid-37fxchfa>People <span class="caret" aria-hidden="true" data-astro-cid-37fxchfa>&#9660;</span></button> <div class="nav-group-panel" role="menu" data-astro-cid-37fxchfa> <a href="/engineers" role="menuitem"', ' data-astro-cid-37fxchfa>Engineers</a> <a href="/principals" role="menuitem"', ' data-astro-cid-37fxchfa>Team Principals</a> <a href="/technical-directors" role="menuitem"', ' data-astro-cid-37fxchfa>Technical Directors</a> </div> </div> <a href="/standings"', ' data-astro-cid-37fxchfa>Seasons</a> <a href="/grands-prix"', ' data-astro-cid-37fxchfa>GPs</a> <a href="/circuits"', ' data-astro-cid-37fxchfa>Circuits</a> <a href="/records"', ' data-astro-cid-37fxchfa>Records</a> <a href="/compare"', ' data-astro-cid-37fxchfa>Compare</a> <a href="/fantasy"', ' data-astro-cid-37fxchfa>Fantasy</a> </div> <a class="donate-btn" href="https://ko-fi.com/f1delta" target="_blank" rel="noopener noreferrer" data-astro-cid-37fxchfa>♥ Donate</a> <button class="hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-links" data-astro-cid-37fxchfa>&#9776;</button> </div> </nav> ', ' <footer class="site-footer" data-astro-cid-37fxchfa> <div class="footer-inner" data-astro-cid-37fxchfa> <nav class="footer-links" data-astro-cid-37fxchfa> <a href="/about" data-astro-cid-37fxchfa>About</a> <a href="/contact" data-astro-cid-37fxchfa>Contact</a> <a href="/privacy-policy" data-astro-cid-37fxchfa>Privacy Policy</a> <a href="/terms" data-astro-cid-37fxchfa>Terms</a> <a href="https://ko-fi.com/f1delta" target="_blank" rel="noopener" data-astro-cid-37fxchfa>Donate</a> </nav> <p class="footer-copy" data-astro-cid-37fxchfa>&copy; ', ' F1 Delta</p> <p class="footer-disclaimer" data-astro-cid-37fxchfa>F1 Delta is an unofficial, independent fan project and is not affiliated with, endorsed by, or connected to Formula 1, the FIA, or related entities. F1 and FORMULA 1 are trademarks of their respective owners.</p> </div> </footer>  <script>\n(function () {\n  var burger = document.getElementById("nav-hamburger");\n  var links = document.getElementById("nav-links");\n  if (burger && links) {\n    burger.addEventListener("click", function () {\n      var open = links.classList.toggle("open");\n      burger.setAttribute("aria-expanded", open ? "true" : "false");\n    });\n  }\n\n  // Desktop: People dropdown click-open (for touch/hybrid devices)\n  var gpBtn = document.querySelector(".nav-group-btn");\n  if (gpBtn) {\n    gpBtn.addEventListener("click", function () {\n      if (window.innerWidth > 620) {\n        var grp = gpBtn.closest(".nav-group");\n        if (grp) {\n          var wasOpen = grp.classList.contains("open");\n          grp.classList.toggle("open");\n          gpBtn.setAttribute("aria-expanded", wasOpen ? "false" : "true");\n        }\n      }\n    });\n  }\n\n  // Close dropdown when clicking outside\n  document.addEventListener("click", function (e) {\n    var grp = document.querySelector(".nav-group.open");\n    if (grp && !grp.contains(e.target)) {\n      grp.classList.remove("open");\n      var btn = grp.querySelector(".nav-group-btn");\n      if (btn) btn.setAttribute("aria-expanded", "false");\n    }\n  });\n})();\n<\/script></body></html>'])), pageTitle, description && renderTemplate`<meta name="description"${addAttribute(description, "content")}>`, canonical && renderTemplate`<link rel="canonical"${addAttribute(canonical, "href")}>`, renderSlot($$result, $$slots["head"]), renderHead(), addAttribute(current === "drivers" ? "page" : void 0, "aria-current"), addAttribute(current === "teams" ? "page" : void 0, "aria-current"), addAttribute(["nav-group", { "is-active": current === "people" }], "class:list"), addAttribute(pathname.startsWith("/engineers") ? "page" : void 0, "aria-current"), addAttribute(pathname.startsWith("/principals") ? "page" : void 0, "aria-current"), addAttribute(pathname.startsWith("/technical-directors") ? "page" : void 0, "aria-current"), addAttribute(current === "standings" ? "page" : void 0, "aria-current"), addAttribute(current === "gps" ? "page" : void 0, "aria-current"), addAttribute(current === "circuits" ? "page" : void 0, "aria-current"), addAttribute(current === "records" ? "page" : void 0, "aria-current"), addAttribute(current === "compare" ? "page" : void 0, "aria-current"), addAttribute(current === "fantasy" ? "page" : void 0, "aria-current"), renderSlot($$result, $$slots["default"]), (/* @__PURE__ */ new Date()).getFullYear());
}, "/Users/thomaspayment/f1delta/src/layouts/BaseLayout.astro", void 0);

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
  const sorted = [rawA, rawB].sort();
  if (sorted[0] !== rawA || sorted[1] !== rawB) {
    return Astro2.redirect(`/compare/${sorted.join("-vs-")}`, 301);
  }
  const idA = rawA, idB = rawB;
  if (idA === idB) return new Response(null, { status: 404 });
  if (!validIds.has(idA) || !validIds.has(idB)) {
    return new Response(null, { status: 404 });
  }
  let dA, dB;
  try {
    dA = JSON.parse(fs.readFileSync(path.join(_root, `data/drivers/${idA}.json`), "utf8"));
    dB = JSON.parse(fs.readFileSync(path.join(_root, `data/drivers/${idB}.json`), "utf8"));
  } catch {
    return new Response(null, { status: 404 });
  }
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
    for (const s of Object.values(d.career ?? {})) {
      const id = s.primaryTeamId;
      const name = s.primaryTeam;
      if (id && !seen.has(id)) {
        seen.add(id);
        result.push({ id, name });
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
  const pageTitle = `${dA.name} vs ${dB.name} — f1delta`;
  const pageDesc = `Compare ${dA.name} and ${dB.name}: championships, wins, podiums, poles, and career rates.`;
  const canonical = `https://f1delta.com/compare/${slug}`;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": pageTitle, "description": pageDesc, "canonical": canonical, "data-astro-cid-bdsczzry": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="cmp" data-astro-cid-bdsczzry> <!-- Header --> <div class="cmp-hd" data-astro-cid-bdsczzry> <div class="cmp-names" data-astro-cid-bdsczzry> <a class="cmp-name"${addAttribute(`/drivers/${idA}`, "href")} data-astro-cid-bdsczzry>${dA.name}</a> <span class="cmp-sep" data-astro-cid-bdsczzry>vs</span> <a class="cmp-name"${addAttribute(`/drivers/${idB}`, "href")} data-astro-cid-bdsczzry>${dB.name}</a> </div> <p class="cmp-back" data-astro-cid-bdsczzry><a href="/compare" data-astro-cid-bdsczzry>← Compare another pair</a></p> </div> <!-- Comparison grid --> <div class="card" data-astro-cid-bdsczzry> <div class="table-scroll" data-astro-cid-bdsczzry> <table class="cmp-tbl" data-astro-cid-bdsczzry> <thead data-astro-cid-bdsczzry> <tr data-astro-cid-bdsczzry> <th class="lbl" data-astro-cid-bdsczzry></th> <th class="drv-col" data-astro-cid-bdsczzry><a${addAttribute(`/drivers/${idA}`, "href")} data-astro-cid-bdsczzry>${dA.name}</a></th> <th class="drv-col" data-astro-cid-bdsczzry><a${addAttribute(`/drivers/${idB}`, "href")} data-astro-cid-bdsczzry>${dB.name}</a></th> </tr> </thead> <tbody data-astro-cid-bdsczzry> <!-- ── CAREER ──────────────────────────────────────── --> <tr class="grp-hd" data-astro-cid-bdsczzry><th colspan="3" data-astro-cid-bdsczzry>Career</th></tr> <!-- Championships (directional: more = better) --> ${(() => {
    const a = tA.championships ?? 0, b = tB.championships ?? 0;
    const aWin = a > b, bWin = b > a;
    return renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Championships</td> <td${addAttribute(["val", { win: aWin, lose: bWin && !aWin }], "class:list")} data-astro-cid-bdsczzry>${a || "—"}</td> <td${addAttribute(["val", { win: bWin, lose: aWin && !bWin }], "class:list")} data-astro-cid-bdsczzry>${b || "—"}</td> </tr>`;
  })()} <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Career span</td> <td class="val neutral" data-astro-cid-bdsczzry>${dA.firstSeason}–${dA.lastSeason}</td> <td class="val neutral" data-astro-cid-bdsczzry>${dB.firstSeason}–${dB.lastSeason}</td> </tr> <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Seasons</td> <td class="val neutral" data-astro-cid-bdsczzry>${seasonsA}</td> <td class="val neutral" data-astro-cid-bdsczzry>${seasonsB}</td> </tr> <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Race starts</td> <td class="val neutral" data-astro-cid-bdsczzry>${tA.races ?? "—"}</td> <td class="val neutral" data-astro-cid-bdsczzry>${tB.races ?? "—"}</td> </tr> <tr class="teams-row" data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Teams</td> <td class="val neutral teams" data-astro-cid-bdsczzry> ${teamsA.map((t, i) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate`${i > 0 && renderTemplate`<span class="tsep" data-astro-cid-bdsczzry>, </span>`}<a${addAttribute(`/teams/${t.id}`, "href")} data-astro-cid-bdsczzry>${t.name}</a> ` })}`)} </td> <td class="val neutral teams" data-astro-cid-bdsczzry> ${teamsB.map((t, i) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-bdsczzry": true }, { "default": ($$result3) => renderTemplate`${i > 0 && renderTemplate`<span class="tsep" data-astro-cid-bdsczzry>, </span>`}<a${addAttribute(`/teams/${t.id}`, "href")} data-astro-cid-bdsczzry>${t.name}</a> ` })}`)} </td> </tr> <!-- ── WINS & PODIUMS (era-dependent) ─────────────── --> <tr class="grp-hd" data-astro-cid-bdsczzry> <th colspan="3" data-astro-cid-bdsczzry>
Wins &amp; podiums
<span class="grp-note" data-astro-cid-bdsczzry>era-dependent · not directly comparable across eras</span> </th> </tr> <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Wins</td> <td class="val neutral" data-astro-cid-bdsczzry>${fmt(tA.wins)}</td> <td class="val neutral" data-astro-cid-bdsczzry>${fmt(tB.wins)}</td> </tr> <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Podiums</td> <td class="val neutral" data-astro-cid-bdsczzry>${fmt(tA.podiums)}</td> <td class="val neutral" data-astro-cid-bdsczzry>${fmt(tB.podiums)}</td> </tr> <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Poles</td> <td class="val neutral" data-astro-cid-bdsczzry>${fmt(tA.poles)}</td> <td class="val neutral" data-astro-cid-bdsczzry>${fmt(tB.poles)}</td> </tr> <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Fastest laps</td> <td class="val neutral" data-astro-cid-bdsczzry>${fmt(tA.fastestLaps)}</td> <td class="val neutral" data-astro-cid-bdsczzry>${fmt(tB.fastestLaps)}</td> </tr> <!-- ── ERA-FAIR RATES ──────────────────────────────── --> <tr class="grp-hd" data-astro-cid-bdsczzry> <th colspan="3" data-astro-cid-bdsczzry>
Era-fair rates
<span class="grp-note" data-astro-cid-bdsczzry>career rate · across all seasons</span> </th> </tr> ${rateRows.map((row) => {
    const aWin = row.aRaw > row.bRaw;
    const bWin = row.bRaw > row.aRaw;
    return renderTemplate`<tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>${row.label}</td> <td${addAttribute(["val", { win: aWin, lose: bWin && !aWin }], "class:list")} data-astro-cid-bdsczzry>${row.aVal}</td> <td${addAttribute(["val", { win: bWin, lose: aWin && !bWin }], "class:list")} data-astro-cid-bdsczzry>${row.bVal}</td> </tr>`;
  })} <!-- ── POINTS ──────────────────────────────────────── --> <tr class="grp-hd" data-astro-cid-bdsczzry> <th colspan="3" data-astro-cid-bdsczzry>
Points
<span class="grp-note" data-astro-cid-bdsczzry>scoring-era variable · not directly comparable</span> </th> </tr> <tr data-astro-cid-bdsczzry> <td class="lbl" data-astro-cid-bdsczzry>Career total</td> <td class="val neutral" data-astro-cid-bdsczzry>${fmt(tA.points)}</td> <td class="val neutral" data-astro-cid-bdsczzry>${fmt(tB.points)}</td> </tr> </tbody> </table> </div> </div> <!-- Ad slot (E2): after table, before footer links --> <div id="cmp-ad-slot" data-ad-slot data-astro-cid-bdsczzry></div> <!-- H2H cross-link (E1): only if they were teammates with a race-comparable pairing --> ${hasH2H && renderTemplate`<div class="h2h-xlink" data-astro-cid-bdsczzry> <span class="h2h-xlink-icon" data-astro-cid-bdsczzry>🏎</span> <div data-astro-cid-bdsczzry> <strong data-astro-cid-bdsczzry>They shared a car.</strong> <a class="h2h-xlink-a"${addAttribute(`/h2h/${h2hSlug}`, "href")} data-astro-cid-bdsczzry>See the teammate head-to-head →</a> </div> </div>`} <!-- Footer links (E1) --> <div class="cmp-foot" data-astro-cid-bdsczzry> <a${addAttribute(`/drivers/${idA}`, "href")} data-astro-cid-bdsczzry>${dA.name} career page →</a> <a${addAttribute(`/drivers/${idB}`, "href")} data-astro-cid-bdsczzry>${dB.name} career page →</a> </div> </div> ` })}`;
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
