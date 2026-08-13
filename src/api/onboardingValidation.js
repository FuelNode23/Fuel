// Client-side mirror of the backend's authoritative onboarding validation
// (onboardingSubmitSchema / onboardingDraftSchema + ONBOARDING_BOUNDS +
// applyOnboardingValueRules, per "Onboarding Data Validation" handoff doc).
// The backend re-checks everything before the athlete upsert & protocol
// generation and is the real gate (400 VALIDATION_ERROR on failure) - this
// module exists only to give the user the same feedback before they hit
// Finish, so a submission doesn't bounce back for a reason the UI could
// have caught. Bounds below are numerically identical to the backend's;
// the payload-key each rule maps to server-side is noted per field since
// this repo's Questions.js fields use English names (age/weight/height/...)
// rather than the backend's French payload keys (age/poids/taille/...).
//
// Every rule here is two-sided: the lower bound is enforced exactly as
// (in)clusive as the doc specifies, the upper bound is always exclusive
// (x < max), matching the backend's isWithinBounds.

// Fields whose bounds don't depend on which sport is selected.
// age -> payload key `age`; weight -> `poids`; height -> `taille`;
// sessions_per_week -> `seances_semaine` / `sessions_semaine`;
// pace is handled separately below (mm:ss text, not a plain number).
const UNIVERSAL_BOUNDS = {
  age: { min: 0, max: 100, minInclusive: false, integer: true },
  weight: { min: 0, max: 300, minInclusive: false },
  height: { min: 50, max: 300, minInclusive: false },
  sessions_per_week: { min: 0, max: 50, minInclusive: true, integer: true },
};

// pace -> payload key `pace_seconds_per_km` / `allure`. Stored in this UI
// as free text in min:sec-per-km form (e.g. "4:30"), not seconds, so it's
// parsed before the seconds bound (0 < x < 1200, i.e. under 20 min/km) is
// applied.
const PACE_BOUNDS = { min: 0, max: 1200, minInclusive: false };

// Fields whose bounds depend on the sport (Running vs Cycling) they're
// collected for. typical_distance -> `distance_typique`; avg_elevation /
// elevation_gain -> `denivele` / `denivele_moyen`.
const SPORT_BOUNDS = {
  Running: {
    typical_distance: { min: 0, max: 100, minInclusive: true },
    avg_elevation: { min: 0, max: 3000, minInclusive: true },
    elevation_gain: { min: 0, max: 3000, minInclusive: true },
  },
  Cycling: {
    typical_distance: { min: 0, max: 400, minInclusive: true },
    avg_elevation: { min: 0, max: 10000, minInclusive: true },
    elevation_gain: { min: 0, max: 10000, minInclusive: true },
  },
};

function normalizeDecimal(raw) {
  return typeof raw === "string" ? raw.trim().replace(",", ".") : raw;
}

function isEmptyValue(raw) {
  return raw === undefined || raw === null || raw.toString().trim() === "";
}

function isWithinBounds(value, bounds) {
  if (!Number.isFinite(value)) return false;
  if (bounds.integer && !Number.isInteger(value)) return false;
  const aboveMin = bounds.minInclusive ? value >= bounds.min : value > bounds.min;
  return aboveMin && value < bounds.max;
}

// Accepts "4:30" or "4m30" (mm:[s]s, matching the "5:30, 5m30" hint shown
// on the training-profile card) as well as a plain decimal number of
// minutes (e.g. "4.5"). Returns total seconds/km, or null if unparsable.
function parsePaceToSeconds(raw) {
  const str = normalizeDecimal(raw)?.toString().trim();
  if (!str) return null;

  const match = str.match(/^(\d+)\s*[:m]\s*(\d+(?:\.\d+)?)\s*s?$/i);
  if (match) {
    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    return Number.isFinite(minutes) && Number.isFinite(seconds) ? minutes * 60 + seconds : null;
  }

  const asMinutes = Number(str);
  return Number.isFinite(asMinutes) ? asMinutes * 60 : null;
}

/**
 * Resolves the sport-dependent bounds (if any) for a field name given a
 * validation context, e.g. { sport: "Cycling" }. Falls back to Running's
 * bounds when no sport is resolvable yet, since that's this flow's
 * default training-profile shape.
 */
function getBoundsForField(name, context = {}) {
  if (UNIVERSAL_BOUNDS[name]) return UNIVERSAL_BOUNDS[name];
  const sport = context.sport === "Cycling" ? "Cycling" : "Running";
  return SPORT_BOUNDS[sport]?.[name] || null;
}

/**
 * Validates a single onboarding field value against the same bounds the
 * backend enforces. Fields the backend doc doesn't cover (name, gender,
 * event_name, weeks_until_event, ...) fall back to "just required" -
 * unchanged from this flow's pre-existing behavior.
 *
 * On failure, `error` is a { kind, bounds? } descriptor rather than a
 * finished sentence - the caller (OnboardingFlow) composes the displayed
 * message from small t()-wrapped fragments plus the raw numbers, the same
 * way the rest of this flow builds strings with numbers in them (e.g. the
 * "Step {n} of {m}" progress label), so every language gets a real
 * translation instead of one baked-in English sentence per bound.
 *
 * @returns {{ valid: boolean, error?: { kind: "pace" | "bounds", bounds?: object } }}
 */
export function validateOnboardingField(name, rawValue, context = {}) {
  if (name === "pace") {
    if (isEmptyValue(rawValue)) return { valid: false };
    const seconds = parsePaceToSeconds(rawValue);
    if (seconds === null || !isWithinBounds(seconds, PACE_BOUNDS)) {
      return { valid: false, error: { kind: "pace" } };
    }
    return { valid: true };
  }

  const bounds = getBoundsForField(name, context);
  if (!bounds) {
    return { valid: !isEmptyValue(rawValue) };
  }

  if (isEmptyValue(rawValue)) return { valid: false };

  const numeric = typeof rawValue === "number" ? rawValue : Number(normalizeDecimal(rawValue));
  if (!isWithinBounds(numeric, bounds)) {
    return { valid: false, error: { kind: "bounds", bounds } };
  }
  return { valid: true };
}
