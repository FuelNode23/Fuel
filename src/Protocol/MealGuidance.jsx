import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { Icon } from "../components/Icons.jsx";
import {
  MEAL_SLOT_META,
  WINDOW_TO_SESSION_STAGE,
  getSourceExamples,
  formatMealTiming,
} from "../data/mealGuidanceContent";

function MealCard({ window, sources, sessionFuelingPlan, t }) {
  const meta = MEAL_SLOT_META[window.window_name] || { title: window.window_name, blurb: "" };
  const targets = window.targets || {};
  const timing = formatMealTiming(window.timing);

  // Real backend text, when this window plausibly lines up with one of
  // session_fueling_plan's 3 stages (see mealGuidanceContent.js) — falls
  // back to the static per-slot blurb otherwise, never fabricated.
  const sessionStage = WINDOW_TO_SESSION_STAGE[window.window_name];
  const realExplanation = sessionStage && sessionFuelingPlan?.[sessionStage]?.plain_explanation;
  const blurb = realExplanation || t(meta.blurb);

  // "Generic recommendation" combines base_type with any constraints
  // (e.g. "sans gluten") — both real fields on the same window.
  const recommendation = [window.base_type, window.constraints].filter(Boolean).join(" — ");

  return (
    <div className="card meal-guidance-card">
      <div>
        <h3 className="meal-card__title">{t(meta.title)}</h3>
        {window.timing && (
          <p className="meal-guidance-card__timing">
            {timing.start ? t("Between {start} and {end}", { start: timing.start, end: timing.end }) : timing.raw}
          </p>
        )}
        {timing.detail && <p className="meal-guidance-card__timing-detail">{timing.detail}</p>}
      </div>

      {(targets.carbs_g != null || targets.protein_g != null || targets.fat_g != null) && (
        <div className="meal-guidance-card__box">
          <span className="meal-guidance-card__box-label">{t("Nutrition target")}</span>
          <p>
            {[
              targets.carbs_g != null && t("{g}g carbs", { g: targets.carbs_g }),
              targets.protein_g != null && t("{g}g proteins", { g: targets.protein_g }),
              targets.fat_g != null && t("{g}g fats", { g: targets.fat_g }),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      )}

      {blurb && (
        <div className="meal-guidance-card__box">
          <p>{blurb}</p>
        </div>
      )}

      {recommendation && (
        <div className="meal-guidance-card__box">
          <span className="meal-guidance-card__box-label">{t("Generic recommendation")}</span>
          <p>{recommendation}</p>
        </div>
      )}

      {(window.protein_source ||
        sources.carbs.length > 0 ||
        sources.proteins.length > 0 ||
        sources.fats.length > 0) && (
        <div className="meal-guidance-card__box meal-guidance-card__sources">
          <span className="meal-guidance-card__box-label">{t("Source examples")}</span>
          {sources.carbs.length > 0 && (
            <p>
              <strong>{t("Carbs:")}</strong> {sources.carbs.join(", ")}
            </p>
          )}
          {/* Real per-athlete protein_source text, preferred over the
              static example list when the backend provided one. */}
          <p>
            <strong>{t("Proteins:")}</strong> {window.protein_source || sources.proteins.join(", ")}
          </p>
          {sources.fats.length > 0 && (
            <p>
              <strong>{t("Fats:")}</strong> {sources.fats.join(", ")}
            </p>
          )}
        </div>
      )}

      {window.protocol_product_pairing && (
        <div className="meal-guidance-card__box">
          <span className="meal-guidance-card__box-label">{t("Product pairing")}</span>
          <p>{window.protocol_product_pairing}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Replaces the old field-dump DietProtocol component. Renders
 * protocol.meal_timing_windows (real backend array — timing/targets/
 * base_type/constraints/protein_source/protocol_product_pairing all come
 * straight from the response). MEAL_SLOT_META supplies the display title
 * + fallback framing sentence per window_name (a closed set of 4, not a
 * guess — see src/data/mealGuidanceContent.js); that fallback is replaced
 * by protocol.session_fueling_plan's real plain_explanation wherever a
 * window plausibly matches one of its 3 stages (see
 * WINDOW_TO_SESSION_STAGE). "Source examples" carbs/fats stay a static
 * reference list filtered against the athlete's restrictions/diet — no
 * such field exists in the response — but proteins prefers the window's
 * own real protein_source text when present.
 */
export default function MealGuidance({ mealTimingWindows, userData, sessionFuelingPlan, onDiscoverBox }) {
  const { t } = useLanguage();

  if (!mealTimingWindows || mealTimingWindows.length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title section-title-icon">
          <Icon.Wind width={18} height={18} />
          {t("Meal guidance")}
        </h2>
        <p className="protocol-empty">{t("No diet protocol available.")}</p>
      </section>
    );
  }

  const sources = getSourceExamples(userData?.restrictions, userData?.diet_pattern);

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title section-title-icon">
        <Icon.Wind width={18} height={18} />
        {t("Meal guidance")}
      </h2>
      <div className="card-grid card-grid--meals">
        {mealTimingWindows.map((window) => (
          <MealCard
            key={window.window_name}
            window={window}
            sources={sources}
            sessionFuelingPlan={sessionFuelingPlan}
            t={t}
          />
        ))}
      </div>

      <div className="meal-guidance-cta">
        <div>
          <h3 className="meal-guidance-cta__title">{t("Ready to review your weekly box?")}</h3>
          <p className="meal-guidance-cta__subtitle">
            {t("Discover the 3 session-box options, compare their fueling logic, and choose your usual assortment.")}
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={onDiscoverBox}>
          {t("Discover my box")}
          <Icon.ArrowRight width={16} height={16} />
        </button>
      </div>
    </section>
  );
}
