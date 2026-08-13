import { lookupProductReference } from "../data/productCatalog";

/**
 * Derives the three weekly-box "views" an athlete can switch between —
 * International, Best value, French brands — from the single flat item
 * list the protocol response already returns (weekly_box_contents). The
 * backend/AI generation step returns one product per protocol_slot, not
 * multiple candidate products per slot, so french/value only reorder that
 * same set of items:
 *   - french: domestic (France) brands surfaced first
 *   - value:  ranked by a nutrition-per-euro score (see
 *             src/data/productCatalog.js — reference estimates, not live
 *             pricing, since the protocol response has no price/nutrition
 *             fields at all)
 * international is the one genuine exception: each domestic item is
 * swapped for a real international-origin product from FuelNode's own
 * catalog (GET /catalog/international, passed in by the caller) sharing
 * the same protocol_slot, when one exists - see
 * substituteWithInternational. An unmatched slot keeps its original item
 * rather than inventing a substitute.
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

/**
 * Swaps a domestic (French) item for a real international-catalog product
 * sharing the same protocol_slot, when one exists. Never invents a
 * product - items with no international match at that slot (or that are
 * already international) pass through unchanged. Drops why_this_product/
 * storage_note on a swap, since that text was written by Claude for the
 * original product and may not hold for the substitute; the UI's own
 * fallbacks take over cleanly instead of carrying over a claim that's no
 * longer verified.
 */
function substituteWithInternational(item, bestBySlot) {
  if (classifyOrigin(item?.brand_origin) !== true) return item;

  const slot = (item?.protocol_slot || "").toLowerCase();
  const alternate = bestBySlot.get(slot);
  if (!alternate) return item;

  return {
    ...item,
    product_name: alternate.productName,
    brand: alternate.brand,
    brand_origin: alternate.brandOrigin,
    why_this_product: null,
    storage_note: null,
  };
}

/**
 * internationalCatalog is the raw GET /catalog/international response
 * (already sorted best-first server-side) - reduced here to one
 * best-scored product per protocol_slot for substitution lookups.
 */
function buildInternationalVariant(rawItems, internationalCatalog) {
  const bestBySlot = new Map();
  for (const product of internationalCatalog) {
    const slot = (product?.protocolSlot || "").toLowerCase();
    if (slot && !bestBySlot.has(slot)) {
      bestBySlot.set(slot, product);
    }
  }

  const substituted = rawItems
    .map((item) => substituteWithInternational(item, bestBySlot))
    .map(enrichItem);

  return substituted.sort(
    (a, b) => originRank(a.isDomestic, false) - originRank(b.isDomestic, false)
  );
}

export function buildBoxVariants(items, internationalCatalog = []) {
  const rawItems = Array.isArray(items) ? items : [];
  const enriched = rawItems.map(enrichItem);

  const international = buildInternationalVariant(rawItems, internationalCatalog);
  const french = [...enriched].sort(
    (a, b) => originRank(a.isDomestic, true) - originRank(b.isDomestic, true)
  );
  const value = [...enriched].sort((a, b) => b.valueScore - a.valueScore);

  return { international, value, french };
}
