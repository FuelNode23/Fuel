/**
 * POST /protocol/generate-with-profile (and responseJson on
 * GET /protocol/latest and /history, once parsed) return Claude's
 * generated JSON directly, in the exact snake_case shape defined by the
 * backend's system prompt (main/resources/prompts/protocol-system.txt):
 *
 * {
 *   protocol_version, generated_date, language, athlete_summary,
 *   macro_targets: { bmr_kcal, tdee_kcal, protein_g_per_day,
 *                     carbs_rest_day_g, carbs_easy_day_g, carbs_hard_day_g,
 *                     carbs_long_effort_g, fat_g_per_day },
 *   diet_protocol: { pre_training_meal, pre_training_snack,
 *                     recovery_window, main_meal } (each: timing, targets,
 *                     base_type, protein_source, fibre, constraints,
 *                     protocol_product_pairing, rationale),
 *   fueling_protocol: { pre_training, during_training, post_training,
 *                        race_day } (fields vary per stage; hydration/
 *                        instructions/rationale get special treatment
 *                        in FuelingProtocol.jsx),
 *   active_specialist_protocols: [ string ] (protocol names only — no
 *                                  rationale/instructions from the model),
 *   weekly_box_contents: [ { product_name, brand, brand_origin, quantity,
 *                             protocol_slot, why_this_product,
 *                             storage_note } ],
 *   box_total_products, box_french_brand_percentage,
 *   assembly_notes: string,
 *   science_cards: [ { product_name, layer_0, layer_1, layer_2 } ],
 *   protocol_changelog: string,
 *   assumptions_made: [ string ],
 *   missing_data_flags: [ string ]
 * }
 *
 * This already matches what every Protocol child component expects —
 * DietProtocol/FuelingProtocol/MacroTargets/etc. were built directly
 * against these exact snake_case field names. So most of what's below
 * is a defensive pass-through (guards against a field being missing or
 * null, which the prompt itself allows for), not a real translation.
 * The one genuine gap is active_specialist_protocols: the component
 * wants objects, the model gives plain strings.
 */

export function adaptDietProtocol(dietProtocol) {
  return dietProtocol || {};
}

export function adaptFuelingProtocol(fuelingProtocol) {
  return fuelingProtocol || {};
}

export function adaptMacroTargets(macroTargets) {
  return macroTargets || {};
}

export function adaptScienceCards(scienceCards) {
  return Array.isArray(scienceCards) ? scienceCards : [];
}

/**
 * Model returns plain protocol-name strings; SpecialistProtocols needs
 * { name, active, rationale, instructions }. Handles both shapes in
 * case a future prompt revision starts returning richer objects.
 */
export function adaptSpecialistProtocols(activeSpecialistProtocols) {
  if (!Array.isArray(activeSpecialistProtocols)) return [];
  return activeSpecialistProtocols.map((entry) =>
    typeof entry === "string" ? { name: entry, active: true } : entry
  );
}

export function adaptWeeklyBoxItems(weeklyBoxContents) {
  return Array.isArray(weeklyBoxContents) ? weeklyBoxContents : [];
}

export function adaptAssemblyNotes(assemblyNotes) {
  if (Array.isArray(assemblyNotes)) return assemblyNotes.join(" ");
  return assemblyNotes || "";
}
