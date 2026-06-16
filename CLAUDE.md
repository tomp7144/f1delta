# f1delta — project guide for Claude Code

f1delta.com is an F1 statistics & history reference site (think Baseball-Reference for F1), aimed at the Drive-to-Survive audience who want historical context. Dense, light-themed, fast, evergreen. Free tier is the SEO funnel; a Pro tier ($9/mo) is planned for relationship/intel data but is currently switched off.

**Data principle: no data is wasted, but no dataset is scattered.** If F1DB has it, there's an interesting way to present it — but each dataset earns one well-curated home, not thin pages generated for coverage. Depth over breadth.

**Owner works solo, commits to `main` himself via terminal, and reviews every diff before it lands.** Make surgical, minimal-diff changes. Don't scaffold speculatively or rewrite working files. When in doubt about intent, ask before building.

## Stack

- **Astro** site, hosted on **Netlify** (Functions v2, hybrid/SSR mode), Cloudflare DNS, repo `tomp7144/f1delta`.
- No bundler. Legacy interactive components are **React via Babel-standalone**, mounted as `window`-globals from `public/`.
- `build` script is just `astro build`. Derived data is **committed to the repo**, not generated at deploy.

## Two page patterns — pick the right one

1. **Static reference pages** (records, teams, and most new content). Pure server-rendered Astro reading committed JSON from `data/`, plus the shared vanilla sorter `public/f1-records.js` for sortable tables (tag a `<table>` with `data-record-table` and put `data-sort`/`data-type` on the `<th>`s and `data-<key>` on the `<tr>`s). No React. Content ships in the HTML — this is the SEO funnel, so rows must be crawlable.
2. **Tiered/interactive pages** (the driver page). Served through a Netlify function (`/api/driver?d=<slug>`) that gates free vs Pro server-side; the page is `/driver?d=<slug>` and uses a React component. Use this pattern **only** when per-user gating or live interactivity is required.

Default to pattern 1. Reach for pattern 2 only when something must be gated or personalized.

## Data pipeline

- **F1DB** (CC BY 4.0, self-hosted) is the canonical archive, unzipped as json-splitted files in `data/f1db/`. The goal is build-time-only third-party data; there are no remaining runtime third-party calls.
- `derive-*.mjs` scripts at repo root read `data/f1db/`, compute, and write `data/<entity>/` (e.g. `derive-records.mjs` → `data/records/`, `derive-teams.mjs` → `data/teams/`). They are pure, no network, and idempotent. Re-run them after pulling a newer F1DB release.
- F1DB precomputes career and per-season totals on the entity/season objects — use those (they already handle subtleties like a 1–2 finish counting as one constructor win). Only per-Grand-Prix / per-circuit / streak figures need a manual pass over race results.
- A **GitHub Actions cron (every 3h)** bakes the latest completed race from OpenF1 and commits `public/latest-race.json` to `main`. Expect the remote to move under you.

## Design system (locked — match exactly)

Light reference-desk aesthetic. Background `#f4f4f1`, ink `#16161a`, muted text `#6b6b70`, hairlines `#e4e4df`, white surfaces `#fff`. One red accent `#e10600`. Championship/record-holder rows get a quiet gold tint `#fbf3d0`. Numbers are tabular mono (`font-variant-numeric: tabular-nums`). Tables are dense and sortable. Team colors appear only as small (~8px) dots. No flashy fan-site styling.

## Git & deploy discipline

- **Astro routes must live in `src/pages/`.** A route file anywhere else silently 404s.
- Netlify runs in hybrid mode, so any static route needs `export const prerender = true;` in its frontmatter or it won't be built.
- `getStaticPaths` runs in isolation — it can't see top-level frontmatter consts. Define what it needs *inside* the function.
- **Always use a scoped `git add`** (name the paths you changed). A blanket `git add -A` sweeps in the cron's `public/latest-race.json` and causes a rebase conflict on every push.
- When a push is rejected with `(fetch first)`, it's the cron. `git pull --rebase` then `git push`. If it complains about unstaged changes, `git stash` first.

## Pro / sensitive — do not touch without explicit instruction

- Pro is disabled via a kill-switch; the flag is greppable as `PRO-DISABLED`. Don't flip it.
- All gating/verification logic lives **server-side only** (Netlify functions, `lib/access.mjs`). Everything in `public/` is downloadable source — never put secrets or gating logic there.
- **Stripe live keys (`sk_live_…`) must never appear in any file, commit, or output.** Netlify env vars only. Do not add, echo, or hardcode them.

## Hard-won gotchas

- OpenF1's free tier only covers *completed* race results; current-season/live data is paid. Don't build runtime features assuming the free tier exposes more.
- There are no remaining runtime third-party calls. The WDC standings are baked by `bake-standings.mjs` (Jolpica, cron-time) into `public/standings.json`; the latest race result is baked by `bake-latest.mjs` (OpenF1, cron-time) into `public/latest-race.json`. Don't add new runtime calls to external APIs.
- F1DB IDs use both hyphens and underscores (`adrian-sutil`, `max_verstappen`). Any slug regex must allow both.
