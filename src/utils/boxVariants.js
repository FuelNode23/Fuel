import { lookupProductReference } from "../data/productCatalog";

/**
 * Derives the three weekly-box "views" an athlete can switch between —
 * International, Best value, French brands — from the single flat item
 * list the protocol response already returns (weekly_box_contents). The
 * backend/AI generation step returns one product per protocol_slot, not
 * multiple candidate products per slot, so there's nothing to genuinely
 * swap in/out between variants. Each variant is the same set of items,
 * reordered (and, for International/French, origin-tagged) by a different
 * priority:
 *   - international: non-domestic brands surfaced first
 *   - french:         domestic (France) brands surfaced first
 *   - value:          ranked by a nutrition-per-euro score (see
 *                      src/data/productCatalog.js — reference estimates,
 *                      not live pricing, since the protocol response has
 *                      no price/nutrition fields at all)
 * Items with no brand_origin, or with unmatched pricing data, sort last
 * within their variant and are flagged so the UI can say so rather than
 * silently guessing.
 */

// Real protocol responses return brand_origin as a plain English demonym
// ("French", "Swedish", "Slovenian", "Canadian", "US", ...), not "France" —
// confirmed against actual weekly_box_contents payloads.
const FRANCE_PATTERN = /\bfrance\b|\bfran[cç]ais|\bfrench\b/;

/** true = domestic (France), false = international, null = unspecified. */
export function classifyOrigin(brandOrigin) {
  if (!brandOrigin) return null;
  const normalized = brandOrigin.toLowerCase();
  if (FRANCE_PATTERN.test(normalized) || normalized.includes("domestic")) return true;
  return false;
}

function originRank(isDomestic, preferDomestic) {
  if (isDomestic === null) return 2; // unspecified always sorts last
  if (preferDomestic) return isDomestic ? 0 : 1;
  return isDomestic ? 1 : 0;
}

function enrichItem(item) {
  const reference = lookupProductReference(item);
  const isDomestic = classifyOrigin(item?.brand_origin);
  const valueScore =
    reference.price_eur > 0
      ? Math.round(((reference.kcal + reference.protein_g * 4) / reference.price_eur) * 10) / 10
      : 0;

  return {
    ...item,
    isDomestic,
    valueScore,
    priceEstimated: reference.estimated,
  };
}

// Converts a valueScore (nutrition points per euro, see productCatalog.js)
// into a 0-4 display rating. Thresholds are static and calibrated against
// the reference table's own score range (roughly 8-200) — not a universal
// nutrition scale, just enough spread to be a useful at-a-glance ranking
// signal within this app.
export function scoreToDots(valueScore) {
  if (valueScore >= 120) return 4;
  if (valueScore >= 70) return 3;
  if (valueScore >= 40) return 2;
  if (valueScore >= 15) return 1;
  return 0;
}

export function buildBoxVariants(items) {
  const enriched = Array.isArray(items) ? items.map(enrichItem) : [];

  const international = [...enriched].sort(
    (a, b) => originRank(a.isDomestic, false) - originRank(b.isDomestic, false)
  );
  const french = [...enriched].sort(
    (a, b) => originRank(a.isDomestic, true) - originRank(b.isDomestic, true)
  );
  const value = [...enriched].sort((a, b) => b.valueScore - a.valueScore);

  return { international, value, french };
}
