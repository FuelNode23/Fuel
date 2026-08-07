/**
 * The backend's /onboarding response uses its own JSON shape (camelCase,
 * arrays of meals/phases, etc). Some Protocol child components were built
 * expecting a different internal shape (e.g. DietProtocol expects an
 * object keyed by meal slug, with snake_case field names). Rather than
 * rewriting those components, these adapters translate backend JSON ->
 * exactly what each component's props already expect.
 *
 * Add one function per component here as mismatches are found, and call
 * it from Protocol.jsx when passing that prop.
 */

/**
 * "Pre-Training Meal" -> "pre_training_meal"
 * "During Training" -> "during_training"
 */
function slugify(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * "carbsG" -> "carbs_g" (so DietProtocol's / FuelingProtocol's
 * prettifyKey / " G" suffix stripping renders it the way each
 * component was designed to display it).
 */
function camelToSnakeKeys(obj) {
  if (!obj || typeof obj !== "object") return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/([A-Z])/g, "_$1").toLowerCase(),
      value,
    ])
  );
}

/**
 * DietProtocol expects:
 *   { pre_training_meal: { timing, targets, base_type, protein_source,
 *                           fibre, constraints, protocol_product_pairing,
 *                           rationale }, ... }
 *
 * Backend sends:
 *   [ { meal, timing, targets, base, protein, fibre, constraints,
 *       productPairing } ]
 *
 * (No `rationale` field exists in the backend response — that part of
 * the card just won't render, since DietProtocol already treats it as
 * optional.)
 */
export function adaptDietProtocol(dietProtocolArray) {
  if (!Array.isArray(dietProtocolArray)) return dietProtocolArray;

  const result = {};
  dietProtocolArray.forEach((item) => {
    const key = slugify(item.meal);
    if (!key) return;
    result[key] = {
      timing: item.timing,
      targets: camelToSnakeKeys(item.targets),
      base_type: item.base,
      protein_source: item.protein,
      fibre: item.fibre,
      constraints: item.constraints,
      protocol_product_pairing: item.productPairing,
    };
  });
  return result;
}

/**
 * FuelingProtocol expects an object keyed by stage slug
 * (pre_training / during_training / post_training / race_day). Beyond
 * `hydration`, `instructions`, and `rationale` (which get special
 * treatment), every other field is rendered generically via
 * prettifyKey — so most fields don't strictly need renaming to display
 * SOMETHING reasonable. A couple of keys do get nicer labels if named
 * exactly right (see FIELD_LABELS in FuelingProtocol.jsx), so those are
 * explicitly renamed below; everything else just gets converted from
 * camelCase to snake_case.
 *
 * Backend sends:
 *   [ { phase, timing, recommendation, product, applicable,
 *       maxCarbsPerHourG, gelFrequency, heatTriggerC, priority, ratio } ]
 *
 * Note: the backend has no "Race Day" phase in this sample response —
 * FuelingProtocol already handles a missing stage by rendering "Not
 * applicable for this protocol." for that card, so this is fine as-is.
 */
const FUELING_FIELD_RENAMES = {
  maxCarbsPerHourG: "carbohydrates_per_hour_g",
  gelFrequency: "gel_frequency",
};

export function adaptFuelingProtocol(fuelingProtocolArray) {
  if (!Array.isArray(fuelingProtocolArray)) return fuelingProtocolArray;

  const result = {};
  fuelingProtocolArray.forEach((item) => {
    const { phase, ...fields } = item;
    const key = slugify(phase);
    if (!key) return;

    const stage = {};
    Object.entries(fields).forEach(([fieldKey, fieldValue]) => {
      const renamedKey =
        FUELING_FIELD_RENAMES[fieldKey] ||
        fieldKey.replace(/([A-Z])/g, "_$1").toLowerCase();
      stage[renamedKey] = fieldValue;
    });

    result[key] = stage;
  });
  return result;
}

/**
 * MacroTargets renders any key generically, but a fixed list of exact
 * snake_case keys get polished labels/units (see FIELD_META in
 * MacroTargets.jsx) — e.g. "bmr_kcal" -> "BMR (kcal)" instead of a
 * generic prettified fallback. This maps the backend's camelCase keys
 * to those exact FIELD_META keys so every metric gets its intended
 * label, not just the generic fallback.
 *
 * Backend sends:
 *   { bmrKcal, tdeeKcal, proteinPerDayG, fatPerDayG, restDayCarbsG,
 *     easyDayCarbsG, hardDayCarbsG, longEffortCarbsG }
 */
const MACRO_FIELD_RENAMES = {
  bmrKcal: "bmr_kcal",
  tdeeKcal: "tdee_kcal",
  proteinPerDayG: "protein_g_per_day",
  fatPerDayG: "fat_g_per_day",
  restDayCarbsG: "carbs_rest_day_g",
  easyDayCarbsG: "carbs_easy_day_g",
  hardDayCarbsG: "carbs_hard_day_g",
  longEffortCarbsG: "carbs_long_effort_g",
};

export function adaptMacroTargets(macroTargets) {
  if (!macroTargets || typeof macroTargets !== "object") return macroTargets;
  return Object.fromEntries(
    Object.entries(macroTargets).map(([key, value]) => [
      MACRO_FIELD_RENAMES[key] || key.replace(/([A-Z])/g, "_$1").toLowerCase(),
      value,
    ])
  );
}

/**
 * ScienceCards expects:
 *   [ { product_name, layer_0, layer_1, layer_2 } ]
 *
 * Backend sends:
 *   [ { product, quickExplanation, howItWorks, researchBrandContext } ]
 */
export function adaptScienceCards(scienceCardsArray) {
  if (!Array.isArray(scienceCardsArray)) return scienceCardsArray;
  return scienceCardsArray.map((card) => ({
    product_name: card.product,
    layer_0: card.quickExplanation,
    layer_1: card.howItWorks,
    layer_2: card.researchBrandContext,
  }));
}

/**
 * SpecialistProtocols expects an array of OBJECTS:
 *   [ { name, active, rationale, instructions } ]
 *
 * Backend sends an array of plain STRINGS (protocol names only):
 *   [ "Gut Training", "Fatigue Resistance" ]
 *
 * There's no rationale/instructions data in the backend response for
 * these — SpecialistProtocols already treats both as optional, so those
 * lines just won't render. `active: true` is set for all of them since
 * the backend field is literally named activeSpecialistProtocols.
 */
export function adaptSpecialistProtocols(specialistProtocolsArray) {
  if (!Array.isArray(specialistProtocolsArray)) return specialistProtocolsArray;
  return specialistProtocolsArray.map((name) => ({
    name,
    active: true,
  }));
}

/**
 * WeeklyBox's `items` expects:
 *   [ { product_name, brand, brand_origin, quantity, protocol_slot,
 *       why_this_product, storage_note } ]
 *
 * Backend's weeklyBox.products sends:
 *   [ { name, tag, brand, country, quantity, description, storage } ]
 *   (storage is only present on some items)
 */
export function adaptWeeklyBoxItems(productsArray) {
  if (!Array.isArray(productsArray)) return productsArray;
  return productsArray.map((product) => ({
    product_name: product.name,
    brand: product.brand,
    brand_origin: product.country,
    quantity: product.quantity,
    protocol_slot: product.tag,
    why_this_product: product.description,
    storage_note: product.storage,
  }));
}

/**
 * WeeklyBox's `assemblyNotes` renders as a single string. Backend sends
 * an array of separate note strings, so join them into one paragraph.
 */
export function adaptAssemblyNotes(assemblyNotesArray) {
  if (Array.isArray(assemblyNotesArray)) return assemblyNotesArray.join(" ");
  return assemblyNotesArray;
}