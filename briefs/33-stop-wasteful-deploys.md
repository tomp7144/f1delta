# Brief 33 — Stop the credit-burning auto-deploys (diff-gated bake + race-aware schedule)

**Purpose:** The bake runs every 3 hours, commits, and triggers a full Netlify rebuild of ~5,700 pages — around data that changes ~24 times a season. That's near-pure waste of build credits. Fix: **only commit (and therefore only deploy) when the data actually changed**, and stop running the cron on a calendar that's mostly dead air. Keep freshness where it matters (race weekends) and add a manual trigger for mid-week news.

**Push status:** Cody reports Step 0 first (read what the bake actually does — don't prescribe a schedule from assumption). Then applies the changes. Tom reviews + pushes.

---

## Step 0 — READ AND REPORT (before changing the workflow)

1. **What the bake fetches.** In `bake-latest.yml` and the bake scripts: what data sources run? Separate them — **F1DB** (historical archive, changes rarely), **OpenF1 live timing** (only meaningful when cars are on track), **official Fantasy feed**, standings, anything else. Report which run every 3 hours.
2. **How the deploy is actually triggered.** Is it the cron **committing to `main`** (Netlify auto-builds on push), a Netlify **build hook**, or both? This determines where the gate goes. Report the exact mechanism.
3. **What actually changes between race weekends.** Does anything the bake writes differ on a random Tuesday? Report whether a mid-week run produces any diff at all in normal (non-race) weeks.
4. **Current commit behavior.** Does the bake commit unconditionally (even when the derived output is identical), or is there already any change-detection? Confirm whether the auto-committed files include the derived data + any cron artifacts (relevant to the scoped-commit discipline).

---

## Step 1 — The real fix: gate the commit on an actual data change

**This is the fix that works regardless of schedule.** No data change → no commit → no push → no deploy → no credits burned.

- After the bake runs, **compare the newly derived output against what's committed** — a content hash / `git diff --quiet` over the derived data paths (the baked JSON, standings, etc.).
- **If nothing changed, exit without committing.** No empty commits, no deploy.
- **If something changed, commit only the changed derived paths** (named paths, not `-A` — don't sweep unrelated files) and let the deploy fire.
- Exclude volatile-but-meaningless churn from the diff if any exists (e.g. a timestamp field that updates every run even when data is identical — if present, either stop writing it or exclude it from the hash, or *every* run looks "changed" and the gate does nothing). **Report if such a field exists.**

Even if the cron frequency were left alone, this alone kills ~99% of the waste, because almost every run now produces nothing and exits silently.

---

## Step 2 — Replace the 3-hour cron with a schedule that matches reality

Tune to what Step 0 shows the bake actually needs:

- **Race weekends** — a tighter burst around sessions (practice/quali/race) so live/standings data is fresh. Deploys still only fire on real changes (Step 1), so this is safe.
- **Between race weekends** — either **nothing**, or **one quiet daily check** that, thanks to Step 1, deploys only if something genuinely changed. A daily no-op run costs a GitHub Actions minute, not a Netlify build (it exits before committing).
- Drop the blanket every-3-hours schedule.

Exact cron expressions: derive from Step 0 (what the calendar looks like, what needs refreshing when). **Report the proposed schedule before finalizing** — a wrong cron is worse than the current one.

---

## Step 3 — Manual trigger for mid-week news

F1 news is real between weekends — a penalty overturned, a DSQ days later, a driver change. Weekends-only would miss those until the next scheduled build.

- Add a **`workflow_dispatch`** trigger to the bake workflow so a rebuild can be forced with one click from the GitHub Actions tab, no cron guessing.
- Costs nothing idle; runs on demand. The Step 1 gate still applies (if a manual run finds no change, it won't deploy — which is fine).

---

## Step 4 — Verify
- **No-change run:** trigger the bake with no upstream data change → confirm it **exits without committing** and **no Netlify build fires.** This is the core proof.
- **Change run:** simulate/force a data change → confirm it commits only the changed paths and the deploy fires.
- **Manual trigger:** `workflow_dispatch` runs and behaves (deploys only if changed).
- Confirm the scoped commit still only stages intended derived paths (no `-A` sweep).
- Historical/static pages unaffected — this only changes *when* builds happen, not what's built.

## Step 5 — Commit (scoped)
`git add .github/workflows/bake-latest.yml` + any bake script changed for the diff gate. Named paths, not `-A`. Commit: `Brief 33: diff-gate bake commit + race-aware cron + manual trigger (stop wasteful deploys)`. Not pushed.

---

## Definition of done
- [ ] Step 0 reported: what the bake fetches, how deploy triggers, what changes when.
- [ ] Commit gated on real data diff — no change, no commit, no deploy (verified with a no-change run).
- [ ] Blanket 3-hour cron replaced with a race-aware schedule (reported before finalizing).
- [ ] `workflow_dispatch` manual trigger added.
- [ ] Any always-changing timestamp/churn field handled so the gate actually gates.
- [ ] Scoped commit; not pushed.

---

**Note:** this also quietly protects the thing from Brief 22B — the bake fix. A bake that only commits on real change is easier to reason about, and the manual trigger gives a clean way to force a rebuild if a scheduled run ever misbehaves again.
