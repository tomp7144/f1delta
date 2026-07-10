# Brief: H2H default + DNS/DNF toggles + entries/starts columns

**Status:** Ready for Cody — Step 1 already reported; this supersedes the earlier version with the final locked rules.
**Type:** Build. Standalone (NOT part of the design overhaul).

## Context

`STARTS` is confirmed correct everywhere (reads `totalRaceStarts`). Do not touch it.

Three changes:

1. **Teammate H2H default** must count only rounds where **both drivers were cleanly classified** (finished, no retirement). Today `s.races++` fires on every shared result row, inflating the race count.
2. **Two independent UI toggles — "Include DNF" and "Include DNS"** — let the reader widen the definition. Same client-side re-display pattern as the "Active drivers" filter, but the underlying tallies differ per mode, so the derive step must compute them.
3. **Entries alongside starts** in the season table (data has `totalRaceEntries`).

## The data (confirmed in Step 1 — do not re-derive)

Each race result row has two independent fields:
- `positionNumber` — classified position, or `null` if not classified
- `reasonRetired` — retirement reason, or `null` if they ran to the end

Four states result:

| State | `positionNumber` | `reasonRetired` |
|---|---|---|
| Cleanly classified (finished) | set | `null` |
| Classified **but** retired (classified DNF) | set | set |
| Unclassified DNF | `null` | set |
| DNS | `null` | (DNS marker) |

F1DB has ~870 classified-DNF rows and ~200 `NC` (not classified) rows. This is established fact from Step 1.

## Locked rules (final — do NOT reinterpret; we iterated hard on these)

### Default (both toggles OFF)
A round counts for a pairing **only if BOTH drivers have `positionNumber != null AND reasonRetired == null`** — cleanly classified with no retirement.

- Classified-DNF (position set, reason set) is **excluded** by default. The "P16, 7 laps down, had a failure" case does NOT count in the default view.
- Unclassified DNF and DNS are excluded (no `positionNumber`).
- Invariant in this mode: **`wins + losses === races`** for every pairing. This is the acceptance test for the default.

### "Include DNF" toggle ON
Additionally counts rounds where a driver **retired but was still classified** (`positionNumber != null AND reasonRetired != null`) — the classified-DNF case comes back in as a comparable result. A retired-but-classified driver placed behind a teammate scores as a loss.

- Purely unclassified DNFs (`positionNumber == null`, reason set) have no position to compare — they can only increment a **races-contested** count, never wins/losses.

### "Include DNS" toggle ON
Additionally counts rounds where a driver **did not start** (`positionNumber == null`, DNS marker). A DNS has no position — it can only increment **races-contested**, never wins/losses.

### Both toggles interact independently
DNF and DNS are separate switches; all four combinations (off/off, DNF-only, DNS-only, both) are valid. When either is on, `wins + losses === races` deliberately no longer holds — the display must show the incomparable count openly (see Display).

## Step 2 — Compute all needed tallies in `derive-f1.mjs`

For each teammate pairing (per-season and career), derive:

- **Default tally:** `wins`, `losses`, `races` counting only rounds where both drivers are cleanly classified (`positionNumber != null && reasonRetired == null`).
- **Counts needed to build the toggle views without a re-derive:**
  - classified-DNF rounds (rounds excluded from default *only* because a driver was classified-but-retired) — enough to recompute wins/losses/races when "Include DNF" is on.
  - DNS rounds and unclassified-DNF rounds shared by the pairing — for the races-contested increments.
- Whatever the exact shape, the client must be able to render default / +DNF / +DNS / +both **without another network call**. Decide the minimal data shape that supports that and report it. Prefer precomputing the small set of derived numbers over shipping raw per-round arrays if it keeps the payload lean; propose your approach in the Step-1-style note before implementing if it's non-obvious.
- Rename the H2H `races` concept if it collides with the season `races` (starts) field — use an unambiguous key (e.g. `h2hRaces`).

## Step 3 — Carry entries into derived data

- Per-season: add `entries: s.totalRaceEntries ?? 0` beside `races: s.totalRaceStarts ?? 0`.
- Per-career: add the equivalent from `d.totalRaceEntries`.
- Do NOT rename or repurpose `races` (starts). Add, don't rewrite.

## Step 4 — Display

- **Toggles:** two controls in the H2H section — "Include DNF" and "Include DNS" — same interaction model as the Active-drivers filter (re-render from already-loaded data, no refetch). Default: both off.
- **Record display:**
  - Default: e.g. `'25–'26 · 19r (14 excl.)` — the `(N excl.)` suffix renders only when `excluded > 0`.
  - With a toggle on: the record recomputes, and the display must make the incomparable rounds visible (e.g. show races-contested and how many rounds have no comparable result). Propose exact wording and report before finalizing — keep it compact and self-explaining.
- **Season table:** add an `ENT` column beside `R` (starts). `R` stays starts. Hide `ENT` below the existing `@media(max-width:620px)` breakpoint (no column-hide rules exist there yet — add one). Zero horizontal scroll at ≤380px is a hard constraint.
- **Career entries:** do NOT add a 7th stat box (breaks mobile). Show the career total as a footnote beneath the 6-box row (e.g. "32 starts · 33 entries"), per Cody's Step 1 proposal.
- **Quali H2H:** already exists and displays (H2HRow, computed at derive-f1.mjs:187–193). No change.

## Step 5 — Verify

- **Default invariant:** `wins + losses === races` across **every** teammate pairing (assert over the whole dataset).
- **Fixtures behave (from Step 1 data):**
  - Bortoleto/Hülkenberg Chinese GP (Bortoleto DNS) — excluded by default; appears only when "Include DNS" on.
  - Antonelli/Russell British GP — Antonelli P15, Russell P2, both cleanly classified (`reasonRetired == null`) → **counts** by default as a Russell win. (The compromised-but-finished limitation is accepted.)
  - Antonelli/Russell Canadian GP — Russell `reasonRetired = "Engine"`, unclassified → excluded by default; with "Include DNF" on it becomes races-contested (no comparable position, so not a win/loss).
  - A classified-DNF round (position set + reason set) — excluded by default; **included as a scored result** when "Include DNF" is on.
- Toggling changes the numbers correctly with **no network request** fired.
- Bortoleto 2026 season row: `R` = 8, `ENT` = 9. Career footnote: 32 starts · 33 entries.
- Mobile: no horizontal scroll; `ENT` hidden ≤620px.
- A pairing with no DNS/DNF/retirement in shared rounds: display unchanged from before, all toggle states identical.

## Step 6 — Commit

Scoped to `derive-f1.mjs` and `f1-driver.jsx` only. No `git add -A`. Quote bracketed paths.

## Out of scope

- The starts logic (correct).
- Rate denominators (win/podium/pole rates use `totalRaceEntries` — leave alone).
- The drivers-index table.
