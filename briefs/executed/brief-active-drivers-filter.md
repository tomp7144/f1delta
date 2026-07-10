# Brief: Active drivers filter — derive the season threshold from the data

**Status:** Ready for Cody
**Type:** Build — read-and-report first, then implement. Small, standalone.

## Context

On `/drivers`, the filter button reads **"Active (2025+)"** and still includes drivers whose last season was 2025 (Yuki Tsunoda, Jack Doohan). The data already contains 2026 (driver pages render 2026 season rows), so the filter — not the data — is stale.

**Do not simply change 2025 to 2026.** That goes stale again in January. The threshold and the button label must both derive from the latest season present in the data, so the filter is correct forever with no manual edit.

## Step 1 — Read and report (no code yet)

- Open `src/pages/drivers/index.astro`. Report: where the "Active" filter is implemented (Astro frontmatter vs. the inline sort/filter script), the exact hardcoded year value(s), and where the button's label text (`Active (2025+)`) is produced.
- Report the shape of the driver records the page iterates over: which field holds the driver's last/most-recent season, and its exact name and type (number vs string).
- Report whether the page already has access to a "latest season in the dataset" value, or whether it must be computed (e.g. `Math.max(...)` over the drivers' last-season field).
- Grep the repo for other hardcoded season years used as an "active/current" threshold (e.g. `2025` in filter or "current driver" logic) — this same staleness may exist elsewhere. List every hit, but change nothing.
- **Report back and wait for confirmation before writing code.**

## Step 2 — Implement (after confirmation)

- Compute the latest season present in the driver data (single source of truth; derive, don't hardcode).
- The "Active" filter includes a driver if their last season is >= that latest season.
- The button label renders that same derived value — e.g. `Active (2026+)` — never a literal.
- Do not touch the other filters (`Champions only`, `Race winners`) or the sort behavior.

Note: "active" here means "raced in the latest season present in the data." If Step 1 reveals a driver could have a 2026 entry without having raced (see the starts-vs-entries brief), flag it — don't guess which is intended.

## Step 3 — Verify

- `/drivers` → the Active button label shows the derived latest season.
- Tsunoda and Doohan (last season 2025) are **excluded** when the latest season is 2026.
- Drivers with a 2026 season (e.g. Bortoleto, Lindblad) are **included**.
- Champions-only and Race-winners filters, and column sorting, all still work.

## Step 4 — Commit

Scoped to only the file(s) touched. No `git add -A`. Quote bracketed paths.
