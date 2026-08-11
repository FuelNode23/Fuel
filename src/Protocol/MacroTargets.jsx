import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

// Presentation-only labels/units for known macro_targets keys.
// Any field not listed here still renders, using a prettified version of its key.
const FIELD_META = {
  bmr_kcal: { label: "BMR", unit: "kcal" },
  tdee_kcal: { label: "TDEE", unit: "kcal" },
  protein_g_per_day: { label: "Protein / day", unit: "g" },
  carbs_rest_day_g: { label: "Rest Day Carbs", unit: "g" },
  carbs_easy_day_g: { label: "Easy Day Carbs", unit: "g" },
  carbs_hard_day_g: { label: "Hard Day Carbs", unit: "g" },
  carbs_long_effort_g: { label: "Long Effort Carbs", unit: "g" },
  fat_g_per_day: { label: "Fat / day", unit: "g" },
};

function prettifyKey(key) {
  return key
    .replace(/_g$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MacroTargets({ macroTargets }) {
  const { t } = useLanguage();

  if (!macroTargets || Object.keys(macroTargets).length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title">{t("Macro Targets")}</h2>
        <p className="protocol-empty">{t("No macro targets available.")}</p>
      </section>
    );
  }

  const entries = Object.entries(macroTargets);

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title">{t("Macro Targets")}</h2>
      <div className="card-grid card-grid--metrics">
        {entries.map(([key, value]) => {
          const meta = FIELD_META[key] || { label: prettifyKey(key), unit: "" };
          return (
            <div className="card metric-card" key={key}>
              <span className="metric-card__label">{t(meta.label) || meta.label}</span>
              <span className="metric-card__value">
                {value ?? "—"}
                {value != null && meta.unit ? (
                  <span className="metric-card__unit"> {meta.unit}</span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
