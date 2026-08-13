/**
 * Static copy/reference content paired with real per-athlete data from
 * protocol.meal_timing_windows (targets, timing, base_type all come from
 * the actual response — see Protocol.jsx). Three things here have no
 * backend field at all, so they're fixed reference content instead of
 * fabricated AI text:
 *   - MEAL_SLOT_META: display title + one-line framing sentence per
 *     window_name (there are only ever 4 window_names, so this is a
 *     closed, safe lookup, not a guess).
 *   - SOURCE_EXAMPLES: generic ingredient examples per macro, filtered
 *     against the athlete's onboarding restrictions/diet below.
 *   - GOAL_SHORT_LABELS: shortens Questions.js's long goal option strings
 *     for pill display.
 */

// Display title + static fallback framing sentence per window_name (a
// closed set of 4 — not a guess). Titles are generic day-part labels
// (Breakfast/Lunch/Dinner/Pre-session snack) per product spec, not a
// strict claim that e.g. main_meal always literally falls at lunchtime —
// actual timing still comes from the window's own real `timing` field.
export const MEAL_SLOT_META = {
  pre_training_meal: {
    title: "Breakfast",
    blurb: "This meal starts the day and lays down much of your energy for it.",
  },
  pre_training_snack: {
    title: "Pre-session snack",
    blurb: "This snack bridges the gap between your last meal and the start, without restarting a full digestion.",
  },
  recovery_window: {
    title: "Dinner",
    blurb: "This dinner is above all about restarting recovery right after your session.",
  },
  main_meal: {
    title: "Lunch",
    blurb: "This is the day's central meal — it tops you back up and keeps energy steady.",
  },
};

// Where a window_name's timing plausibly lines up with one of
// session_fueling_plan's 3 stages (pre/during/post — a different, coarser
// grouping than the 4 meal_timing_windows), prefer that stage's real
// plain_explanation over the static blurb above. pre_training_meal and
// main_meal have no reliable session_fueling_plan counterpart, so they
// always fall back to the static blurb.
export const WINDOW_TO_SESSION_STAGE = {
  pre_training_snack: "pre_session",
  recovery_window: "post_session",
};

// Real `timing` strings vary in format across languages/sessions —
// French "15h30 à 16h30 (3-4 heures avant l'entraînement)", English
// "Between 07:00 and 09:00", plain "60 minutes before, small and light".
// This only reformats the ones with a recognizable HH:MM-HH:MM range;
// anything else is returned unchanged rather than risk mangling text this
// can't reliably parse. Whatever text trails the matched range (often a
// parenthetical like "(3-4 heures avant l'entraînement)") is kept as a
// separate `detail` string instead of being dropped.
const TIME_RANGE_PATTERN = /(\d{1,2})[h:](\d{2})\s*(?:–|-|à|to|and)\s*(\d{1,2})[h:](\d{2})/i;

export function formatMealTiming(raw) {
  if (!raw) return { start: null, end: null, detail: null, raw };

  const match = raw.match(TIME_RANGE_PATTERN);
  if (!match) return { start: null, end: null, detail: null, raw };

  const [, h1, m1, h2, m2] = match;
  const detail = raw
    .slice(match.index + match[0].length)
    .trim()
    .replace(/^[(\s]+|[)\s]+$/g, "");

  return {
    start: `${h1.padStart(2, "0")}:${m1}`,
    end: `${h2.padStart(2, "0")}:${m2}`,
    detail: detail || null,
    raw,
  };
}

const SOURCE_EXAMPLES = {
  carbs: ["oats", "toast", "plain brioche", "banana", "fruit purée", "rice", "pasta", "potatoes", "couscous", "wraps", "white rice", "sweet potato", "sourdough bread"],
  proteins: ["skyr", "fromage blanc", "eggs", "Greek yogurt", "tofu", "light mozzarella", "omelette", "plain yogurt"],
  fats: ["almond butter", "peanut butter", "chia seeds", "avocado", "olive oil", "olives", "walnuts"],
};

const RESTRICTED_TERMS = {
  gluten: ["toast", "plain brioche", "pasta", "couscous", "wraps", "sourdough bread"],
  oeuf: ["eggs", "omelette"],
  egg: ["eggs", "omelette"],
};

/** Filters SOURCE_EXAMPLES against the athlete's onboarding restrictions
 *  (userData.restrictions, e.g. ["gluten", "oeuf"]) and diet pattern
 *  (userData.diet_pattern) so the examples shown don't contradict what the
 *  athlete already told onboarding. */
export function getSourceExamples(restrictions = [], dietPattern = "") {
  const normalizedRestrictions = restrictions.map((r) => r.toLowerCase());
  const isVegetarian = /vegetari|vegan/i.test(dietPattern || "");

  const excluded = new Set();
  normalizedRestrictions.forEach((r) => {
    (RESTRICTED_TERMS[r] || []).forEach((term) => excluded.add(term));
  });
  if (isVegetarian) excluded.add("eggs").add("omelette");

  return {
    carbs: SOURCE_EXAMPLES.carbs.filter((item) => !excluded.has(item)),
    proteins: SOURCE_EXAMPLES.proteins.filter((item) => !excluded.has(item)),
    fats: SOURCE_EXAMPLES.fats.filter((item) => !excluded.has(item)),
  };
}

export const GOAL_SHORT_LABELS = {
  "Improve my performance": "Performance",
  "Build my endurance": "Endurance",
  "Have more energy in training": "Energy",
  "Recover better": "Recovery",
  "Prepare for a race": "Race prep",
  "Optimize my body composition": "Body composition",
  "Improve my hydration": "Hydration",
  "Tolerate fueling better during effort": "Fueling tolerance",
  "Simplify my nutrition routine": "Simplicity",
};
