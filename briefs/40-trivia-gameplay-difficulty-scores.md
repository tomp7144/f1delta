# Brief 40 — Trivia gameplay: 10-question rounds, difficulty + decades filters, local high scores

**Purpose:** Play feedback from the built game — sudden death is punishing, unfamiliar deep-cut drivers feel like unfair losses. Fix the loop and let the player control the pool. Four changes: **fixed 10-question rounds** (not sudden death), **difficulty tiers** (incl. the "100+ races" tier that fixes the unheard-of-drivers problem), a **decades filter**, and **per-combo browser-local high scores**. No backend, no accounts (those are a future bolt-on — build so they'd add cleanly later, but nothing here needs them).

**Push status:** Cody commits (scoped). Tom reviews + pushes.

---

## Item 1 — 10-question rounds (replace sudden death)

- A round is **exactly 10 questions.** A wrong answer or a timeout **costs points** (scores 0 for that question) but **does not end the round** — play continues to Q10.
- After Q10: a **score screen** — total score, questions correct (e.g. 7/10), best-score comparison (Item 4), and **Play Again**.
- Timer + smooth-decay scoring per question unchanged (Brief 36). Keep the running score visible during the round.
- (Daily mode stays its own thing — if daily was a single question, it can become a 10-question daily set, or stay as-is; Cody's call, report it. This item is about the arcade/practice loop.)

---

## Item 2 — Difficulty tiers (the real fix for "drivers I've never heard of")

Replace the current famous/deep-cut split with three tiers, driven by data already present:

| Tier | Pool | Purpose |
|---|---|---|
| **Easy** | drivers with **100+ career races** | recognizable names — the "keep it fair" filter from the F1 video |
| **Medium** | race winners / champions (the existing ≥1-win filter) | still famous, a bit deeper |
| **Hard** | any driver with **2+ distinct constructors** (the full deep-cut pool) | the masochist tier |

- Report the pool size of each tier.
- **Easy is the default** — a new player should land on recognizable drivers, not 1970s privateers.
- Difficulty selector on the game landing + adjustable between rounds.

---

## Item 3 — Decades filter

- Let the player pick an era: **All-time (default)**, and per-decade (2020s, 2010s, 2000s, 1990s, 1980s, 1970s, 1960s, 1950s). A driver is eligible for a decade if their active years overlap it (from the driver's season data).
- Presented alongside difficulty on the landing.

## Item 3b — Stacking + grey-out (the combos interaction)

Difficulty and decades **stack** (e.g. "2010s + Easy" = 100+ race drivers active in the 2010s). Because some combos are too thin to make a fair round:

- Compute each combo's eligible pool. A round needs enough drivers to run 10 questions with **4 unique options each and reasonable non-repetition** — set a **minimum pool threshold** (report the number chosen; must be comfortably more than 4, e.g. ≥12–15, so questions don't repeat and distractors are available).
- **Combos below the threshold are greyed out / disabled** in the UI (e.g. "1950s + Easy" — almost nobody raced 100+ times then). Show why on hover/tap ("not enough drivers for a full round"), don't just silently fail.
- Never start a round on a pool too small to fill it — that's the honest version, rather than serving a broken 4-driver loop.

**Verify:** "2010s + Easy" and "All-time + Hard" are playable; "1950s + Easy" (or whichever combo is genuinely too thin) is greyed out with a reason. Report the grid of which combos are available vs disabled.

---

## Item 4 — Per-combo local high scores

- Store the player's **best score per (difficulty × decade) combo** in the browser (`localStorage` — this is a real site page, not a sandboxed artifact, so localStorage is fine; the artifact storage restriction does not apply).
- Key by the settings, e.g. `f1delta:trivia:best:easy:2010s`. Each combo tracks its own best (and best correct-count if wanted).
- Score screen shows **"Best: X"** for the current combo and flags a **new best** when beaten.
- The landing can show your best for the currently-selected combo before you start.
- **Graceful if storage is unavailable** (private mode, etc.): the game still plays, high score just isn't persisted — never block play on storage.
- **Future-proofing note (do not build):** keep the score-saving behind a small function (e.g. `saveBest(combo, score)`) so that when accounts are added later, that one function can also sync to a backend — accounts stay an additive bolt-on, never required. Just structure it cleanly; no backend now.

---

## Wiring / verify
- Settings (difficulty + decade) on the `/trivia` landing; both adjustable between rounds.
- Mobile ~380px: selectors, greyed combos, 10-question flow, score screen all usable, no horizontal scroll.
- Distractor generator (Brief 36) still pulls decoys from the **same active pool** (a round in "2010s Easy" draws decoys from 2010s-easy drivers, so wrong answers stay plausible *and* recognizable).

**Verify checklist:**
- Round runs 10 questions; wrong answer costs points but round continues to 10; score screen + Play Again.
- Easy (100+ races) is default and noticeably more recognizable than Hard.
- Decade filter works; stacking works; thin combos greyed with a reason.
- Per-combo best saves and shows; new-best flagged; private-mode still plays.

## Commit (scoped)
Trivia page/component + any engine change for pooling. Named paths, not `-A`. Commit: `Brief 40: 10-question rounds, difficulty/decades filters, per-combo local high scores`. Not pushed.

## Definition of done
- [ ] 10-question rounds; wrong ≠ round over; score screen + Play Again.
- [ ] Easy/Medium/Hard tiers (Easy = 100+ races, default); pool sizes reported.
- [ ] Decades filter; stacks with difficulty; thin combos greyed with reason; availability grid reported.
- [ ] Per-combo localStorage high score; new-best flagged; graceful without storage; save behind a swappable function.
- [ ] Decoys drawn from the active pool; mobile-safe.
- [ ] Scoped commit; not pushed.
