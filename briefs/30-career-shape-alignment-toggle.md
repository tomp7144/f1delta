# Brief 30 — Career-shape chart: alignment toggle (career season / age / calendar) + overlay

**Purpose:** Complete the career-shape comparison on the compare grid. Brief 27 shipped career-season alignment only; this adds the **age** and **calendar** alignments and the overlay treatment. **Nothing from Brief 27 is discarded** — the phantom-flex-column alignment work and the shared `F1DeltaExplain.astro` component both stay.

**Two items, and they are not equally load-bearing — be clear on which is which:**
- **Age alignment is a correctness fix (required).** Without it the chart makes a false claim (see Step 2).
- **The overlay is a comparison-quality improvement (recommended).** Aligned bar rows are a legitimate design, not a shortcut; the overlay is better for reading two curves against each other.

**Push status:** Cody commits (scoped). Tom reviews + pushes.

---

## Step 0 — READ AND REPORT

1. **What shipped in Brief 27.** Report the current strip implementation (phantom flex columns, `flex: 1 1 0`, rank badge classes) so the alignment logic slots in rather than replacing it.
2. **Date of birth (blocking for age alignment).** Confirm `dateOfBirth` (or equivalent) exists per driver in the driver JSON. **If it is not there, derive it from F1DB — do not drop the age alignment** (Rule Q1). Report which.
3. **The esbuild gotcha.** Brief 27 hit esbuild's CSS parser tripping on `$` inside `style={...}` attributes. Note the workaround used (string concatenation) so this brief doesn't reintroduce it.

---

## Step 1 — X-axis alignment toggle

Three alignments over the same data. Toggle control above the chart; **career season is the default**.

| Alignment | Question it answers | x-axis |
|---|---|---|
| **Career season** *(default)* | "Whose trajectory was better?" | 1st season, 2nd, 3rd… *(shipped in Brief 27)* |
| **Age** | "Who was better **at 27**?" | driver's age during that season |
| **Calendar year** | "What was happening **that year**?" | real timeline |

- Each season's **real calendar year** must remain visible (label or hover/tap) in every alignment.
- Rank colors (#1 gold, #2–3 red, #4+ faint) carry across all three.
- Toggle state is UI-only; no URL change needed.

---

## Step 2 — Why age alignment is required, not optional

Career-season alignment places every driver's rookie year in the same column **regardless of how old they were**. Drivers debut at wildly different ages — Hamilton arrived in his early twenties; Fangio's F1 career didn't begin until his late thirties (**take exact figures from F1DB, not from assumption**). Aligned by career season, the chart puts a 38-year-old's first season directly against a 22-year-old's and presents them as equivalent.

That isn't a missing feature — it's the chart asserting something false. Age alignment corrects it, and it's the framing no other F1 site offers (Baseball-Reference's "age-27 season" convention — the site's stated North Star).

**Age computation:** the driver's age at the start of that season (or at their first race that season — pick one, apply consistently, and state which in the explanation). Report the choice.

---

## Step 3 — Overlay treatment (recommended)

Render both careers on a **single shared 0–100 f1δ axis** rather than two stacked rows.

**Why:** stacked rows force the eye to bounce between them. Overlaid, the curves **cross** — you see directly whose peak was higher, whose prime lasted longer, who tapered and when. It's also one chart instead of two on a narrow viewport.

- Two visually distinguishable series, each labeled with the driver's name.
- **Rank must survive the change** — colour each season's point/marker by its f1δ rank using the Brief 26 palette. If rank legibility genuinely degrades in overlay, report it and keep aligned bars; do not silently drop rank.
- The shorter career's series simply ends — never pad, stretch, or extrapolate.

---

## Step 4 — M1 explanation

Extend the existing `F1DeltaExplain.astro` compare note (do **not** duplicate copy):

> Each point is one season, scored against that season's maximum possible points. The two careers can be lined up three ways — by season number, by the driver's age, or by calendar year — because "whose trajectory was better," "who was better at 27," and "what happened that year" are three different questions. Age alignment matters because drivers debut at very different ages: lining up two rookie seasons can otherwise compare a driver in his late thirties to one in his early twenties.

---

## Step 5 — Verify

1. `/compare/ayrton-senna-vs-lewis-hamilton` — all three alignments render correctly; **calendar** correctly shows two separated series (accurate in that mode, not a bug); **age** lines up comparable ages.
2. A pairing with a late-debuting driver (e.g. Fangio vs a young-debut modern driver) — confirm age alignment visibly differs from career-season alignment. This is the proof the fix matters.
3. A teammate/rival pairing (Hamilton vs Bottas) — calendar alignment is the natural view; confirm it reads well.
4. Rank colors legible in every alignment and in overlay.
5. Mobile ~380px: no horizontal scroll; toggle usable.
6. Brief 27's f1δ row group unchanged.

## Step 6 — Commit (scoped)
`git add "src/pages/compare/[slug].astro"` (**quote it** — zsh glob) + chart/toggle JS/CSS + `F1DeltaExplain.astro` if extended. Named paths, not `-A`.
Commit: `Brief 30: career-shape chart alignment toggle + overlay`. Not pushed.

## Definition of done
- [ ] Date of birth confirmed or **derived** — age alignment not dropped.
- [ ] All three alignments live, career season default, real years always visible.
- [ ] Overlay renders with rank preserved (or reported if rank legibility fails, with aligned bars kept).
- [ ] Late-debut pairing proves age alignment differs meaningfully.
- [ ] M1 copy extended, not duplicated.
- [ ] Mobile-safe; Brief 27 row group untouched.
- [ ] Scoped, quoted commit; not pushed.
