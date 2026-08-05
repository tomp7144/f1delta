# Brief 36 — Career trivia game: "Guess the driver by their team chain"

**Purpose:** Build the F1 career-progression guessing game — show a driver's team chain (Toro Rosso → Red Bull), guess who. Original, interactive, replayable content (which also directly helps the AdSense "low value" problem — a game is not a stat table). All modes in one brief, **structured shared-core → modes** so feedback is specific ("arcade timer's off" / "free-text won't match Schumacher") rather than "the game's broken."

**Data:** built entirely on the `teams[]` chains proven correct in Briefs 34/35 — **use `career[].teams[]`, never `primaryTeamId`** (that's the distinction those briefs established; a chain missing a mid-season team is wrong).

**Push status:** Cody commits (scoped, staged: engine → each mode). Tom reviews + pushes.

---

## Part A — Shared engine (the core — build and verify this first)

### A1. Team chains
For each eligible driver, derive their **career team progression** from `career[].teams[]`: the ordered, de-duplicated list of constructors across their career (chronological). Collapse consecutive repeats (Red Bull 2019, Red Bull 2020 → one "Red Bull"), but **keep genuine returns** (a driver who left and came back to a team shows it twice if that's what happened). Mid-season splits appear in order (Verstappen: Toro Rosso → Red Bull; Fisichella's chain includes Ferrari).

Report the chain shape for a few checks: Verstappen (Toro Rosso → Red Bull), Hamilton (McLaren → Mercedes → Ferrari), Alonso (the long one), Leclerc (Sauber → Ferrari).

### A2. Difficulty tiers
- **Famous** (default): drivers who are recognizable — reuse the existing "winners" filter (≥1 win, ~116 drivers) or champions, Tom's call on the exact cut. Report the count.
- **Deep cut**: any driver with ≥2 distinct constructors. Report the count.

### A3. The distractor generator (THE hard part — treat as the heart of the game)
For a given answer driver, pick **3 wrong options that are genuinely hard to rule out** — not random. Priority order for choosing decoys:
1. Drivers who share **one or more of the same constructors** in their chain (same team lineage — e.g. for a Red Bull-program driver, other RB-program drivers: Gasly, Albon, Kvyat).
2. Drivers from the **same era** (overlapping active years).
3. Drivers with a **similar chain length/shape**.
Fill from tier 1, then 2, then 3 until 3 distractors are chosen. **Never** pick a decoy whose chain is identical to the answer's (would make the question unanswerable). Decoys come from the same difficulty tier as the answer.

**This is the make-or-break of multiple choice** — random decoys make it a coin flip. Report a sample: for Verstappen, the 3 decoys chosen and why.

### A4. Data payload
Bake a compact `trivia.json` (or similar) — per eligible driver: id, name, team chain, difficulty tier. The distractor generation can be baked (precomputed decoy pools) or run client-side from the payload — Cody's call based on size. Report the approach + size. (Mirror the `search-index.json` lazy-load pattern.)

**Verify Part A before building modes:** chains correct for the spot-check drivers; distractors plausible (the Verstappen sample); tiers sized sensibly.

---

## Part B — Mode 1: Arcade run (multiple choice, timed) — the core game

- Show the answer driver's **full team chain**; 4 options (answer + 3 distractors from A3), tap to answer.
- **Timer:** ~10s per chain.
- **Scoring — smooth decay:** ~1000 points at t=0 decaying continuously to a small floor (~100) at t=10. Every fraction of a second matters. Correct answer scores the current value; wrong or timeout ends the run.
- **Run structure:** consecutive chains, score accumulates, **one wrong answer or one timeout ends the run.** Show final score + streak length.
- Difficulty selector (famous / deep cut).
- Between chains: brief correct/wrong feedback (reveal the right driver, maybe a link to their page — E1, rabbit hole), then next chain.

**Verify:** a full run plays; timer + decay scoring feel right; wrong answer ends it; decoys are hard, not obvious.

---

## Part C — Mode 2: Daily challenge

- Same engine, but a **date-seeded** driver so **everyone gets the same chain on the same day** (deterministic from the date — e.g. hash the date to index the famous-tier pool).
- One attempt framing (or a fixed short run), and a **shareable result** — score/time in a copyable format (Wordle-style, no spoilers). This is the spread mechanic.
- Show the answer after the attempt with a link to the driver.

**Verify:** the daily driver is identical across two different browsers/devices on the same date; share text copies cleanly.

---

## Part D — Mode 3: Free-text casual

- **Relaxed / untimed** (or a generous timer) — the low-pressure version.
- Input is **free text with autocomplete** over the driver list (reuse the search-index driver names). Answer-matching must handle:
  - Surname-only ("Schumacher") — but **disambiguate** Michael vs Ralf (if a surname maps to multiple drivers, either require more or accept any matching driver only if it's the answer; report the approach).
  - Minor typos / case-insensitivity.
- Casual vibe: guess, get it or don't, reveal, next. No streak pressure.

**Verify:** "Schumacher" resolves correctly (and Michael/Ralf ambiguity handled); typos tolerated; feels casual, not timed.

---

## Part E — Wiring
- **New route** (e.g. `/trivia` or `/game`) — lock the slug (U1). Mode selector (Arcade / Daily / Free-text) on the landing.
- **Nav:** add a visible entry (Tom's call on label/placement).
- **Search (S1):** index the game page (terms: `trivia`, `game`, `guess`, `quiz`, `career`).
- Sitemap: static route, auto-covered.
- **Mobile (C1):** tap targets, timer, options all usable at ~380px, no horizontal scroll.
- **No browser storage caveat:** if tracking a high score or daily streak, keep it in memory / the URL — the artifact-storage restriction doesn't apply here (this is a real site page, not a sandboxed artifact), so `localStorage` is fine for a personal best if wanted. Confirm approach.

---

## Commits (scoped, staged)
Engine/data (Part A) → arcade (B) → daily (C) → free-text (D) → wiring (E). Named paths, not `-A`. Base msg: `Brief 36: career team-chain trivia (engine + arcade + daily + free-text)`. Not pushed.

## Definition of done
- [ ] Team chains derived from `teams[]` (not `primaryTeamId`); spot-checks correct incl. mid-season splits.
- [ ] Distractor generator produces **plausible** decoys (same lineage/era) — Verstappen sample reviewed; never an identical-chain decoy.
- [ ] Arcade: multiple choice, ~10s timer, smooth-decay scoring, run ends on wrong/timeout.
- [ ] Daily: date-seeded (same for everyone), shareable result.
- [ ] Free-text: autocomplete matching, Schumacher-ambiguity handled, casual/untimed.
- [ ] New route + nav entry + search-indexed; mobile-safe.
- [ ] Scoped, staged commits; not pushed.

---

**Why this matters beyond fun:** it's original interactive content built on data no other F1 site has cross-linked this way — exactly the "information gain" the AdSense re-review needs, and a genuine rabbit-hole hook (get a chain, click through to the driver, fall in). The distractor generator is the whole game; everything else is presentation.
