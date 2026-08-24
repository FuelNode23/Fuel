import { lookupProductReference } from "../data/productCatalog";

/**
 * Derives the three weekly-box "views" an athlete can switch between —
 * International, Best value, French brands — from the single flat item
 * list the protocol response already returns (weekly_box_contents). The
 * backend/AI generation step returns one product per protocol_slot, not
 * multiple candidate products per slot, so "value" is the one pure
 * re-order of that same set of items, ranked by a nutrition-per-euro
 * score (see src/data/productCatalog.js — reference estimates, not live
 * pricing, since the protocol response has no price/nutrition fields at
 * all).
 * International and French each substitute for real: any item of the
 * *other* origin gets swapped for a real catalog product of the target
 * origin (GET /catalog/international or /catalog/french, passed in by
 * the caller) sharing the same protocol_slot, when one exists - see
 * substituteByOrigin. An unmatched slot, or an item with unspecified
 * origin, keeps its original item rather than inventing a substitute -
 * this is also why an all-French box's "International" view (or an
 * all-international box's "French brands" view) can still show some
 * items unchanged: not every slot has a real alternate in the other
 * origin.
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
 * Swaps an item confirmed to be the *other* origin for a real
 * targetOrigin catalog product sharing the same protocol_slot, when one
 * exists. Never invents a product - items with no match at that slot,
 * items already matching targetOrigin, or items with unspecified origin
 * (classifyOrigin returns null) all pass through unchanged; only a
 * confirmed opposite-origin item is a candidate for substitution. Drops
 * why_this_product/storage_note on a swap, since that text was written
 * by Claude for the original product and may not hold for the
 * substitute; the UI's own fallbacks take over cleanly instead of
 * carrying over a claim that's no longer verified.
 *
 * An item the athlete explicitly picked via WeeklyBox.jsx's edit flow
 * (manually_replaced, set by NutritionProtocolService.swapBoxItem) is
 * never auto-substituted here, regardless of its origin - the whole
 * point of that flow is a deliberate, saved choice, and silently
 * overriding it because it doesn't match a tab's preferred origin would
 * make the edit look like it didn't work depending on which tab the
 * athlete happens to be viewing.
 */
function substituteByOrigin(item, bestBySlot, isTargetDomestic) {
  if (item?.manually_replaced) return item;

  const currentIsDomestic = classifyOrigin(item?.brand_origin);
  const isConfirmedOpposite = isTargetDomestic
    ? currentIsDomestic === false
    : currentIsDomestic === true;
  if (!isConfirmedOpposite) return item;

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
    // The canonical weekly_box_contents item (what's actually saved
    // server-side) still has the *original* product_name - this view is
    // showing a client-side substitute, not what's persisted. Anything
    // that needs to identify the real underlying item (see WeeklyBox.jsx's
    // ProductSwapPicker) must use this, not the displayed product_name,
    // or it'll ask the backend to find a product that was never actually
    // saved.
    _originalProductName: item.product_name,
  };
}

/**
 * originCatalog is the raw GET /catalog/international or /catalog/french
 * response (already sorted best-first server-side) - reduced here to one
 * best-scored product per protocol_slot for substitution lookups.
 */
function buildOriginVariant(rawItems, originCatalog, isTargetDomestic) {
  const bestBySlot = new Map();
  for (const product of originCatalog) {
    const slot = (product?.protocolSlot || "").toLowerCase();
    if (slot && !bestBySlot.has(slot)) {
      bestBySlot.set(slot, product);
    }
  }

  const substituted = rawItems
    .map((item) => substituteByOrigin(item, bestBySlot, isTargetDomestic))
    .map(enrichItem);

  return substituted.sort(
    (a, b) => originRank(a.isDomestic, isTargetDomestic) - originRank(b.isDomestic, isTargetDomestic)
  );
}

export function buildBoxVariants(items, internationalCatalog = [], frenchCatalog = []) {
  const rawItems = Array.isArray(items) ? items : [];
  const enriched = rawItems.map(enrichItem);

  const international = buildOriginVariant(rawItems, internationalCatalog, false);
  const french = buildOriginVariant(rawItems, frenchCatalog, true);
  const value = [...enriched].sort((a, b) => b.valueScore - a.valueScore);

  return { international, value, french };
}
