# Brief 41 — Fix the bake for real: race-schedule cadence + stop null-overwriting live data

**Purpose:** The every-few-hours bake is deploying constantly because it overwrites real live-timing data with garbage when no session is running — the commit diffs show `"name": "Hungarian Grand Prix"` ⇄ `"Hungary GP"` and `"compound": "S"` ⇄ `null` flip-flopping every run (23 lines of churn). The diff gate is working correctly; the *data* is genuinely changing because the bake pulls volatile OpenF1 live data mid-week when there's no live session. Fix: bake on the **race schedule** (not a blind clock), and **never overwrite good data with null/empty**. Also run down the swallowed exit-22 error, and stop fetching fields nothing displays.

**Push status:** Cody commits (scoped, staged per fix). Tom reviews + pushes.

---

## Step 0 — READ AND REPORT (before changing anything)

1. **What the bake actually writes and from where.** In the bake scripts, identify each field in `public/latest-race.json` and its source — F1DB vs OpenF1 (live timing) vs elsewhere. Specifically: where do `session.name`, `compound`, and the driver rows come from? Report which fields are **live-timing** (volatile, session-only) vs **stable**.
2. **The exit-22 error.** The Aug 2 bake showed "Process completed with exit code 22" **but the run reported Success** (the workflow is swallowing a failure). Find what exits 22 — is it the OpenF1 fetch failing when no session is live? Report whether the error and the null-writes are the **same root cause** (fetch errors → fallback writes null). This likely explains the whole thing.
3. **What's actually displayed.** `compound` is suspected to be rendered nowhere. Confirm which `latest-race.json` fields any page/component actually reads. Report the unused ones (candidates to stop fetching entirely).
4. **Current schedule + trigger.** Quote the current `bake-latest.yml` cron and confirm `workflow_dispatch` is present.

**Report all four before implementing** — the fix path depends on 0.1/0.2 (is null-overwrite a fetch-error fallback, or the feed legitimately returning null off-session?).

---

## Fix 1 — Never overwrite good data with null/empty (the real data-integrity fix)

Regardless of schedule, the bake must **not** replace a real value with `null`/empty just because the live feed returned nothing this run. This is what's corrupting the data (real "S" → null, real GP name → alternate).

- When writing `latest-race.json`, for any field sourced from live timing: **if the new fetched value is null/empty/missing, keep the previously-committed value** rather than writing null. Merge over the existing file, don't blindly replace.
- For the race **name** specifically: pin it to **one canonical source** (F1DB — the site's canonical source everywhere else) so it can't flip between "Hungary GP" and "Hungarian Grand Prix" depending on which feed answered. Normalize if both are consulted.
- Net effect: an off-session bake that gets nulls from OpenF1 writes **no change** (keeps last-known values) → no diff → no commit → no deploy. This alone stops most of the churn even before the schedule change.

**Verify:** run the bake twice with no live session → second run produces **no change** to `latest-race.json` (last-known values preserved, no null-overwrite). This is the core proof.

---

## Fix 2 — Race-schedule cadence (drop the weekday clock)

Replace the blanket cron with a schedule matched to when data actually changes. Tom's model:

- **Race weekends** — bake through the actual **session windows** (practice / quali / race) so live tower + standings are fresh *while a session is live*. Ideally driven by the F1 calendar rather than a blind clock; if a static approximation is simpler, a weekend burst (Fri–Sun during session hours) is acceptable — report the approach.
- **Weekly checkpoints (non-race weeks)** — **Sunday night** (catch final results) and **Wednesday** (catch mid-week official changes: penalties, DSQs). That's it.
- **No every-few-hours weekday cron.** Remove it.
- **Keep `workflow_dispatch`** — manual trigger for forcing a rebuild when something happens.

With Fix 1 in place, even these scheduled runs only deploy when something genuinely changed.

**Report the proposed cron expressions before finalizing** — a wrong cron is worse than the current one.

---

## Fix 3 — Investigate & fix exit-22 (and stop swallowing failures)

- From 0.2: fix whatever exits 22. If it's the OpenF1 fetch erroring off-session, handle it gracefully (no session → skip the live-timing fetch, don't error, don't write nulls — ties into Fix 1).
- **Stop the workflow reporting a failed bake as Success.** A bake that errors should surface as a failed run (or at minimum log loudly), not a green check with a hidden red X — a silently-erroring bake is how bad data reaches the site unnoticed.

---

## Fix 4 — Stop fetching unused fields (cheapest fix of all)

- From 0.3: if `compound` (and any other field) is rendered nowhere, **stop fetching and writing it.** Data you don't display shouldn't be in the bake at all — it can only cause churn, never value.
- Confirm with Tom before removing a field that turns out to be used; drop only the confirmed-unused ones.

---

## Verify (the whole thing)
- **No-session run:** trigger a bake with no live session → `latest-race.json` unchanged (Fix 1), no commit, no Netlify deploy. **This is the headline proof the churn is dead.**
- Race name is stable across runs (one canonical source).
- No `null` ever overwrites a real live-timing value.
- Removed unused fields no longer appear in the diff churn.
- Exit-22 resolved; a genuinely failing bake now reports as failed, not Success.
- Schedule: weekday clock gone; weekend sessions + Sun/Wed checkpoints; `workflow_dispatch` intact.
- **Passive confirmation (tell Tom to check in a few days):** Netlify Deploys should go nearly flat off race weekends — a deploy only when real data changed.

## Commit (scoped, staged)
Bake scripts (null-guard, canonical name, drop unused fields, exit-22) → `bake-latest.yml` (schedule + failure surfacing). Named paths, not `-A`. Base msg: `Brief 41: race-schedule baking + null-overwrite guard + exit-22 fix`. Not pushed.

## Definition of done
- [ ] Step 0 (0.1–0.4) reported before implementing; confirmed whether exit-22 and null-writes share a root cause.
- [ ] Bake never overwrites a real value with null/empty (merge-over, keep last-known); no-session run produces zero change. **Proven.**
- [ ] Race name pinned to one canonical source (no flip-flop).
- [ ] Weekday clock removed; weekend-session + Sun/Wed checkpoint schedule (reported before finalizing); `workflow_dispatch` kept.
- [ ] Exit-22 fixed; failing bakes no longer report Success.
- [ ] Confirmed-unused fields (e.g. `compound`) no longer fetched/written.
- [ ] Scoped, staged commits; not pushed.
