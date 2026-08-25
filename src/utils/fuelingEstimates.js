/**
 * Values the protocol response has no field for at all (confirmed against
 * the real shape documented in src/api/Protocoladapters.js): hydration
 * range, electrolyte target, and an off-day calorie figure. Rather than
 * leaving them blank or inventing per-athlete numbers with no basis, these
 * are computed client-side from real inputs (body weight, BMR) using
 * simple, documented sports-nutrition heuristics. They're estimates, not
 * AI-generated or backend-sourced — swap for real fields the day the
 * protocol response actually returns them.
 */

/** ISO-8601 week number for a date (1-53). Used for the "Week {n}" badge —
 *  there's no week-of-plan field in the response, so this reads the
 *  calendar week instead. */
export function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// ~31-36ml/kg on a training day, ~30-35ml/kg on a rest day — both within
// the commonly cited 30-40ml/kg/day general hydration range, just narrowed
// to a band and nudged up for training days.
export function computeHydrationRangeL(weightKg, isTrainingDay) {
  if (!weightKg) return null;
  const [lowFactor, highFactor] = isTrainingDay ? [0.031, 0.036] : [0.03, 0.035];
  return {
    low: Math.round(weightKg * lowFactor * 10) / 10,
    high: Math.round(weightKg * highFactor * 10) / 10,
  };
}

// ~9.75mg/kg on a training day (moderate sweat losses covered), ~8mg/kg at
// rest — a simple proportional estimate, not a measured sweat-sodium test.
export function computeElectrolytesMg(weightKg, isTrainingDay) {
  if (!weightKg) return null;
  return Math.round(weightKg * (isTrainingDay ? 9.75 : 8));
}

// Light activity factor over BMR for a day with no session — not a full
// Harris-Benedict/TDEE activity multiplier, just a modest bump.
export function computeOffDayKcal(bmrKcal) {
  if (!bmrKcal) return null;
  return Math.round((bmrKcal * 1.15) / 10) * 10;
}
