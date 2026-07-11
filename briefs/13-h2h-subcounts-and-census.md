# Brief 13 — Teammate H2H: derive subcounts + pairing census

**Ends in:** commit by Cody — **not** a push. Owner reviews the diff and pushes.
Push is safe now (no rendered page changes; this brief only touches build-time data) and must land in `main` **before Brief 14 builds**, because Brief 14's `getStaticPaths` reads the census file this brief emits.

**Depends on:** Brief 12 read (done). **Blocks:** Brief 14 (H2H pages build against this brief's census + subcounts).

**Single purpose:** Add four `excl_*` subcounts to the teammate H2H derive so the client toggles (default / +DNF / +DNS) are reconstructable without a refetch, re-run derive, and emit a pairing census that defines exactly which H2H pages exist. **No page building. No file deletion.**

**URL lock (Rule U1):** the H2H slug is locked here so Brief 14 does not re-decide it — two F1DB driver IDs sorted alphabetically, joined by `-vs-`. `A` = alphabetically first ID. Confirmed unambiguous in the Brief 12 read (zero underscore IDs; `-vs-` never appears inside an ID). Brief 14 splits on `-vs-` and reads the pairing from A's perspective.

---

## Step 0 — Read and report (NO code until this is posted back)

Read and report, quoting real code:

1. **`derive-f1.mjs` — `newSeasonH2H()`**: the exact current field list, verbatim.
2. **The H2H counting loop**: quote the exact branch where a shared race is routed to `excluded` (the line where `excluded++` or equivalent happens). List every variable in scope at that point — specifically: self finishing position, mate finishing position, and **how "classified vs unclassified" is represented** (is it a null `posN`? a status field? a DNF flag?). The categorization in Step 1 hangs on this, so report the actual accessor, don't paraphrase.
3. **Aggregate assembly**: confirm the career `aggregate` is a field-wise sum of the season entries, and list which fields are summed — so the four new fields get added to that sum and none is missed.
4. **`data/drivers/index.json`**: confirm it exists and enumerates **F1DB-valid drivers only**. This is the enumeration source and the mechanism that keeps the 820 stale Ergast files out **without deleting them**. If it doesn't exist or isn't F1DB-only, **STOP and report** — we need a clean F1DB-valid list before proceeding.
5. **Write surface**: confirm `derive-f1.mjs` writes **only** F1DB driver files and never touches the stale Ergast files. If it might touch them, report.

**Do not write code until this report is posted and confirmed.**

---

## Step 1 — Add the four subcounts

In `newSeasonH2H()`, add four fields initialized to `0`:

- `excl_selfWinDNF`
- `excl_mateWinDNF`
- `excl_tiedDNF`
- `excl_dns`

**Categorize INSIDE the existing `excluded` branch only.** Scoping the categorization to the same branch where `excluded++` already fires guarantees these four buckets *repartition the excluded set* and can never double-count a race that's already a default `raceAhead`/`raceBehind`.

For each race that currently increments `excluded`, increment **exactly one** subcount. Using self position `sPos` and mate position `mPos` (lower = better finish; `null` = unclassified — substitute the real accessor from Step 0):

- both non-null AND `sPos < mPos` → `excl_selfWinDNF++`  (both classified, self ahead, but the race was excluded because ≥1 retired)
- both non-null AND `sPos > mPos` → `excl_mateWinDNF++`  (both classified, mate ahead)
- both non-null AND `sPos === mPos` → `excl_tiedDNF++`  (shared-car artificial tie)
- either null → `excl_dns++`  (position comparison impossible — DNS / power-unit loss / collision DNF / DSQ)

Add the **same four fields** to the aggregate accumulation (sum across seasons — do not forget any of the four here).

---

## Step 2 — Invariant guard (data integrity, Rule D1)

During derive, assert for **every season entry AND every aggregate**:

```
excl_selfWinDNF + excl_mateWinDNF + excl_tiedDNF + excl_dns  ===  excluded
```

If any entry fails, **HARD FAIL** the derive and print the driver pair + year. The four buckets must exactly re-partition the existing `excluded` count — no more, no less. This is the proof that the split is complete and correct.

**Do not proceed to Step 3 until derive runs clean with the invariant holding everywhere.**

---

## Step 3 — Re-run derive + regression spot-check

Run `node derive-f1.mjs`. Confirm:

- It completes and the Step 2 invariant holds for every entry.
- **Existing fields are UNCHANGED** for the known reference pair. Per the Brief 12 read, Hamilton (`lewis-hamilton`) vs Rosberg (`nico-rosberg`) is a 4-season set totaling **Q 42–34, R 37–27, pts 1334 / 1195, 14 excl**. After the change these existing numbers must be identical — only the four new fields should appear. If any existing number moves, stop and report; the categorization is leaking into the default branch.

---

## Step 4 — Emit the pairing census

Write **`data/h2h-pairings.json`** — the authoritative "which H2H pages exist" list that Brief 14's `getStaticPaths` reads. It lives in `data/` (build-time only, never shipped to the client).

Build it from the F1DB-valid enumeration:

- For each F1DB-valid driver (from `index.json`), iterate its `teammates[]`.
- For each teammate entry, form the unordered pair, compute the canonical slug (both IDs sorted alphabetically, `-vs-`, A = first), and **dedup by slug**.
- Read the comparable counts from that entry's `aggregate`.

**Inclusion floor (owner's call — "no pages with no data"):** include a pairing **iff it has ≥1 comparable race in any toggle mode**:

```
raceAhead + raceBehind + excl_selfWinDNF + excl_mateWinDNF  >=  1
```

A comparable race = a real position comparison exists (default, or a classified-DNF that +DNF mode counts). Contested-only races (`excl_tiedDNF`, `excl_dns`) and qualifying-only overlaps **do not clear the floor** — their race section would render blank, which is exactly the thin page being excluded. A genuine one-off like Bearman's single Ferrari race vs Leclerc **does** clear it (a real finish comparison).

File shape — one entry per **included** pairing:

```json
{
  "slug": "charles-leclerc-vs-oliver-bearman",
  "a": "charles-leclerc",
  "b": "oliver-bearman",
  "defaultRaces": 1,
  "dnfComparable": 0,
  "totalComparable": 1
}
```

`a` = alphabetically-first ID = the perspective whose `raceAhead` means "A beats B." Brief 14 reads the pairing from A's `teammates[]`. Excluded pairings simply don't appear in this file — their relationship still shows on each driver's teammate table, so nothing is lost.

---

## Step 5 — Census report (report the numbers; don't decide anything)

Print and report:

- Total F1DB-valid drivers enumerated (from `index.json`).
- Total unordered pairings sharing ≥1 race.
- **Included** (clear the floor): **N** ← this locks Brief 14's page count.
- **Excluded — qualifying/contested only** (share races, zero comparable race in any mode): **M** ← the thin set we're intentionally dropping; report it so we can see the size of the cut.
- Of the included: how many have ≥1 default race vs. how many are **DNF-rescued** (0 default races, but ≥1 comparable once +DNF counting exists).
- **Spot-check (must-keep one-off):** resolve the real F1DB IDs and canonical slug for the **Bearman–Leclerc 2024 Ferrari** pairing (Bearman subbed for Sainz, Saudi Arabian GP) and confirm it is **INCLUDED** with 1 comparable race. This is the one-off the owner flagged — it verifies the floor catches genuine single-race pairings rather than dropping them with the thin ones.

The **included count N** locks Brief 14's scope the moment this report comes back.

---

## Step 6 — Commit (Cody), owner pushes

**Scoped commit — named paths only, never `git add -A`** (cron auto-commits must not be swept):

- `data/drivers/*.json`  (updated with the four subcounts)
- `data/h2h-pairings.json`  (the census)
- `derive-f1.mjs`  (the logic change)

Commit message: `Add H2H excl_* subcounts + emit pairing census (Brief 13)`

Ends in **commit**. Owner reviews the diff and pushes. Push is safe now (no rendered page changes) and should land in `main` before Brief 14 builds, so the census is available to `getStaticPaths`.

---

## Explicitly NOT in this brief

- **Deleting the 820 stale Ergast files** — own single-purpose brief later (Rule W3; a 820-file sweep doesn't ride on the derive change).
- **Building any H2H page** — Brief 14.
- **Search indexing the H2H pairings** — Brief 16 (Rule S1 tracked, applied when the pages exist).
