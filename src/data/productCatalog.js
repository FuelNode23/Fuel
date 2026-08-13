/**
 * Static reference table used ONLY to rank weekly-box products by nutrition
 * value per euro for the "Best value" box variant (see
 * src/utils/boxVariants.js). The protocol response has no price or
 * per-product nutrition fields (see the confirmed shape documented at the
 * top of src/api/Protocoladapters.js), so there is nothing real to compute
 * a value score from — these numbers are reference estimates, not a live
 * product catalog or real-time pricing feed. They exist to produce a
 * defensible ordering, not to be shown to an athlete as an actual price.
 *
 * Matching is brand-first (AI-written `brand` field, normalized), then
 * falls back to a protocol-slot category guess, then a global default.
 * Every returned entry carries `estimated: true/false` so the UI can flag
 * whichever fallback tier was used.
 */

// Reference estimates per single serving/unit (EUR, kcal, protein g).
// Not sourced from a live pricing feed — see module doc comment above.
const BRAND_REFERENCE = [
  { match: ["maurten"], price_eur: 3.2, kcal: 100, protein_g: 0 },
  { match: ["science in sport", "sis"], price_eur: 1.8, kcal: 87, protein_g: 0 },
  { match: ["gu energy", "gu"], price_eur: 1.6, kcal: 100, protein_g: 0 },
  { match: ["precision fuel", "precision hydration"], price_eur: 1.2, kcal: 10, protein_g: 0 },
  { match: ["clif"], price_eur: 2.1, kcal: 250, protein_g: 9 },
  { match: ["tailwind"], price_eur: 2.5, kcal: 100, protein_g: 0 },
  { match: ["skratch"], price_eur: 1.9, kcal: 80, protein_g: 0 },
  { match: ["overstim"], price_eur: 2.3, kcal: 90, protein_g: 1 },
  { match: ["aptonia"], price_eur: 1.5, kcal: 95, protein_g: 1 },
  { match: ["nutrimuscle"], price_eur: 1.1, kcal: 120, protein_g: 24 },
  { match: ["néovie", "neovie"], price_eur: 1.7, kcal: 105, protein_g: 2 },
  { match: ["isostar"], price_eur: 1.4, kcal: 60, protein_g: 0 },
];

// Fallback when the brand isn't in BRAND_REFERENCE — guessed from keywords
// in protocol_slot / product_name (e.g. "pre_training_gel" -> "gel").
const CATEGORY_REFERENCE = [
  { match: ["gel"], price_eur: 1.8, kcal: 100, protein_g: 0 },
  { match: ["bar", "chew"], price_eur: 2.0, kcal: 220, protein_g: 8 },
  { match: ["drink", "hydration", "electrolyte", "fluid"], price_eur: 1.5, kcal: 40, protein_g: 0 },
  { match: ["recovery", "shake", "protein"], price_eur: 2.2, kcal: 180, protein_g: 20 },
];

const GLOBAL_DEFAULT = { price_eur: 2.0, kcal: 120, protein_g: 5 };

function normalize(text) {
  return (text || "").toLowerCase();
}

function findByKeywords(text, table) {
  const normalized = normalize(text);
  if (!normalized) return null;
  return table.find((entry) => entry.match.some((keyword) => normalized.includes(keyword))) || null;
}

/**
 * Returns { price_eur, kcal, protein_g, estimated } for a weekly-box item.
 * `estimated: true` means no brand match was found and a category/global
 * fallback was used — the UI should flag this rather than presenting it as
 * a confident number.
 */
export function lookupProductReference(item) {
  const brandMatch = findByKeywords(item?.brand, BRAND_REFERENCE);
  if (brandMatch) {
    const { match, ...stats } = brandMatch;
    return { ...stats, estimated: false };
  }

  const categoryMatch =
    findByKeywords(item?.protocol_slot, CATEGORY_REFERENCE) ||
    findByKeywords(item?.product_name, CATEGORY_REFERENCE);
  if (categoryMatch) {
    const { match, ...stats } = categoryMatch;
    return { ...stats, estimated: true };
  }

  return { ...GLOBAL_DEFAULT, estimated: true };
}
