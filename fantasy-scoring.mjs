/**
 * fantasy-scoring.mjs  ―  f1delta Fantasy Score formula (single source of truth).
 *
 * Derived, position-based score covering all of F1 history from 1950 forward.
 * This is NOT the official F1 Fantasy game score; it is our own metric, clearly
 * labelled "f1delta Fantasy Score" everywhere it appears.
 *
 * INTENTIONALLY OMITTED (absent from F1DB historical record):
 *   Overtakes    +1 each in the real F1 Fantasy game — no historical overtake data.
 *
 * Scoring basis: 2026 F1 Fantasy official point table — applied to all eras for
 * cross-era comparison (not the championship points drivers actually earned).
 * Race position:    P1-10 = 25/18/15/12/10/8/6/4/2/1 · P11+ = 0
 * Qualifying:       KNOCKOUT (2006+): Q3 (P1-10) = 10-1 · Q2 (P11-15) = 5-1 · Q1 (P16+) = 0
 *                   Pre-KNOCKOUT: P1-10 = 10-1 · P11+ = 0
 * Positions gained: +2 per position moved forward grid→finish
 * Positions lost:   -2 per position moved backward grid→finish
 * DNF / NC:         -20 · DSQ / EX: -25 · DNS / DNQ / DNP / DNPQ: 0
 * Fastest lap:      +5 if driver finished P1-10 (applied to all eras for consistency)
 * Driver of the Day: +10 (F1DB supplies this from 2016 onward; no award before 2016)
 * Constructor bonus (KNOCKOUT only): +10 if both drivers reached Q3
 *
 * Phase 1's bake-fantasy.mjs PPM function lives here so live and historical
 * layers share one definition; import { ppm } from "./fantasy-scoring.mjs".
 */

// ── Race position points table ────────────────────────────────────────────────
// Index = finishing position.  RACE_PTS[1]=25, RACE_PTS[11]=undefined → 0.
const RACE_PTS = Object.freeze([0, 25, 18, 15, 12, 10, 8, 6, 4, 2, 1]);

// ── Qualifying position points (Q3 / pre-KNOCKOUT) ───────────────────────────
// QUALI_PTS[1]=10 … QUALI_PTS[10]=1 · QUALI_PTS[11+]=undefined → 0.
const QUALI_PTS = Object.freeze([0, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);

// ── Scalars ───────────────────────────────────────────────────────────────────
const POS_PTS       =  2;   // ± per position gained/lost (grid → finish)
const DNF_PENALTY   = -20;
const DSQ_PENALTY   = -25;
const FL_PTS        =  5;   // fastest lap, P1-10 finish only
const DOTD_PTS      = 10;   // Driver of the Day (official F1 Fantasy value)
const BOTH_Q3_PTS   = 10;   // constructor bonus, KNOCKOUT format only

/**
 * Compute the f1delta Fantasy Score for one driver in one race.
 *
 * @param {object} r  Race-result row from f1db-races-race-results.json.
 *   Expected fields (all may be null):
 *     positionNumber            {number|null}  Classified finish position.
 *     positionText              {string}       "1"…"30", "DNF", "DSQ", "DNS", …
 *     gridPositionNumber        {number|null}  Starting grid position.
 *     gridPositionText          {string|null}  "1"…"30", "PL" for pit-lane start.
 *     qualificationPositionNumber {number|null} Qualifying position.
 *     fastestLap                {boolean}
 *     positionsGained           {number|null}  Pre-computed by F1DB (grid − finish).
 *     driverOfTheDay            {boolean}      F1DB flag; present from 2016 onward.
 * @param {boolean} isKnockout     Race used KNOCKOUT qualifying format (2006+).
 * @param {boolean} driverOfTheDay Driver won the fan vote for that race.
 * @returns {{ score: number, partial: boolean, components: object }}
 *   partial = true when qualifying data is absent; score excludes those components.
 */
export function driverScore(r, isKnockout = false, driverOfTheDay = false) {
  const posNum   = r.positionNumber;
  const posText  = r.positionText ?? "";
  const gridPos  = r.gridPositionNumber;
  const qualiPos = r.qualificationPositionNumber;
  const hasFl    = !!r.fastestLap;
  const gained   = r.positionsGained; // grid - finish (positive = moved up)

  // ── Race finish ──────────────────────────────────────────────────────────
  const isFinished = posNum != null && posNum > 0;
  let race = 0, penalty = 0;

  if (isFinished) {
    race = RACE_PTS[posNum] ?? 0;
  } else if (posText === "DNF" || posText === "NC") {
    penalty = DNF_PENALTY;
  } else if (posText === "DSQ" || posText === "EX") {
    penalty = DSQ_PENALTY;
  }
  // DNS / DNPQ / DNQ / DNP → 0 penalty (did not participate in the race)

  // ── Fastest lap (only if classified in P1-10) ────────────────────────────
  const fl = hasFl && isFinished && posNum <= 10 ? FL_PTS : 0;

  // ── Driver of the Day ────────────────────────────────────────────────────
  const dotd = driverOfTheDay ? DOTD_PTS : 0;

  // ── Qualifying + positions gained (requires qualifying data) ─────────────
  const partial = qualiPos == null;
  let quali = 0, positions = 0;

  if (!partial) {
    // Qualifying points
    if (isKnockout) {
      if (qualiPos <= 10)        quali = QUALI_PTS[qualiPos] ?? 0;
      else if (qualiPos <= 15)   quali = 16 - qualiPos; // Q2: 5/4/3/2/1 for P11-15
      // P16+ (Q1 eliminees) = 0
    } else {
      quali = QUALI_PTS[qualiPos] ?? 0; // pre-KNOCKOUT: P1-10 only
    }

    // Positions gained / lost (only meaningful when driver finished)
    // Skip pit-lane starters (gridPositionText === "PL") since no grid slot.
    if (isFinished && r.gridPositionText !== "PL") {
      const posGained =
        gained != null ? gained        // pre-computed by F1DB
        : gridPos != null ? gridPos - posNum // manual fallback
        : null;
      if (posGained != null) positions = posGained * POS_PTS;
    }
  }

  const score = race + quali + positions + penalty + fl + dotd;

  return {
    score,
    partial,
    components: { race, quali, positions, penalty, fl, dotd },
  };
}

/**
 * Compute the f1delta Fantasy Score for one constructor in one race.
 *
 * @param {Array<{ score: number, qualiPos: number|null }>} drivers
 *   Scored driver results (from driverScore) for all entrants of this constructor.
 * @param {boolean} isKnockout  Race used KNOCKOUT qualifying format.
 * @returns {{ score: number, bothInQ3Bonus: number }}
 */
export function constructorScore(drivers, isKnockout = false) {
  const sum = drivers.reduce((acc, d) => acc + d.score, 0);

  // Both-in-Q3 bonus: exactly 2 drivers both with quali position ≤ 10.
  const bothInQ3 =
    isKnockout &&
    drivers.length === 2 &&
    drivers.every((d) => d.qualiPos != null && d.qualiPos <= 10);

  const bonus = bothInQ3 ? BOTH_Q3_PTS : 0;
  return { score: sum + bonus, bothInQ3Bonus: bonus };
}

/**
 * Points-per-million for the live F1 Fantasy tracker.
 * Numerator is points (official live game score), denominator is price (millions).
 * In Phase 3, swap the numerator here to use driverScore-based value instead.
 *
 * @param {number} price   Asset price in millions (e.g. 25.3).
 * @param {number} points  Official F1 Fantasy season points.
 * @returns {number|null}
 */
export function ppm(price, points) {
  if (!price) return null;
  return Math.round((points / price) * 10) / 10;
}
