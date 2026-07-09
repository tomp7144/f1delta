# Brief: Starts vs. entries — what is `STARTS` actually counting?

**Status:** Ready for Cody
**Type:** Diagnosis. Read-and-report ONLY. No code changes, no data changes.

## Context

In Formula 1 these are distinct:

- **Entry** — the driver was entered for the race weekend.
- **Start** — the driver actually took the start. A DNS (did not start) is an entry but **not** a start.

Observation: Gabriel Bortoleto's 2026 row shows `R = 8`, but he is believed to have 9 entries and 8 starts. If our `STARTS` stat is actually counting entries, that's wrong **site-wide**, not just for one driver — it would affect every driver's `STARTS` box, the `R` column on season-by-season tables, and any record board built on starts.

Historical accuracy is core to the site's credibility, so this needs to be established from the data, not assumed. **This brief establishes the facts only. No fix, no data regeneration.**

## Investigate — report findings, change nothing

### 1. What feeds the numbers on screen
- The driver page's `STARTS` stat box: which field, from which derived JSON file, computed by which script? Trace it back to source.
- The season-by-season table's `R` column: same trace. Is it the same field as `STARTS`, or a different one?
- Report whether `STARTS` (career total) and `R` (per-season) are derived from the same underlying count. If they diverge, say how.

### 2. What F1DB actually provides
- Inspect the F1DB source JSON we ingest. For race results / driver-race records, list the fields that distinguish participation states — e.g. anything resembling `positionText`, `status`, `statusId`, `gridPosition`, `raceEntry`, `didNotStart`, `dns`, `reasonRetired`.
- **Determine explicitly: does F1DB let us tell an entry from a start?** If yes, name the exact field(s) and the values that indicate a DNS. If no, say so plainly.
- Note whether F1DB itself exposes a precomputed starts count, or whether we compute it ourselves.

### 3. What our derive scripts do
- Find the `derive-*.mjs` script(s) that compute driver career/season stats. Report the exact logic that produces the starts/races count — quote the relevant lines.
- State clearly: does it count **every result row** (i.e. entries), or does it filter out DNS/non-start rows (i.e. true starts)?

### 4. Check against the real case
- Pull Bortoleto's 2026 result rows from the source data. Report the row count, and for each row whether it looks like a start or a DNS (per the fields found in step 2).
- Does 9 entries / 8 starts hold up in the data? Report what the data actually says — do not assume the premise is right.

### 5. Blast radius (if it is counting entries)
- List every place a starts/races count surfaces: driver page stat box, season table `R` column, any records board keyed on starts, drivers index columns, anything else found by grep.
- Note whether any other stat (wins, podiums, poles) has the same entry-vs-start ambiguity, or whether those are unambiguous.

## Output

Answer these four questions directly:

1. Does F1DB distinguish entries from starts? (yes/no + the field)
2. What is our `STARTS` currently counting — entries or starts?
3. Is `R` in the season table the same count as `STARTS`?
4. If it's wrong, what's the blast radius?

Then state whether Bortoleto's 8 is correct-as-starts, correct-as-entries, or something else entirely.

**No code, no commits. Report and wait** — we'll scope the fix (if any) from this.
