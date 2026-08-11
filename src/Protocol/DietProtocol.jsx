import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const MEAL_LABELS = {
  pre_training_meal: "Pre-Training Meal",
  pre_training_snack: "Pre-Training Snack",
  recovery_window: "Recovery Window",
  main_meal: "Main Meal",
};

function prettifyKey(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function MealCard({ mealKey, meal, t }) {
  if (!meal) return null;
  const {
    timing,
    targets,
    base_type,
    protein_source,
    fibre,
    constraints,
    protocol_product_pairing,
    rationale,
  } = meal;

  return (
    <div className="card meal-card">
      <div className="meal-card__header">
        <h3 className="meal-card__title">{t(MEAL_LABELS[mealKey]) || prettifyKey(mealKey)}</h3>
        {timing && <span className="meal-card__timing">{timing}</span>}
      </div>

      {targets && Object.keys(targets).length > 0 && (
        <div className="meal-card__targets">
          {Object.entries(targets).map(([tKey, tValue]) => (
            <span className="pill" key={tKey}>
              {prettifyKey(tKey).replace(" G", "")}: {tValue ?? "—"}
              {typeof tValue === "number" ? "g" : ""}
            </span>
          ))}
        </div>
      )}

      <dl className="meal-card__details">
        {base_type && (
          <div className="detail-row">
            <dt>{t("Base")}</dt>
            <dd>{base_type}</dd>
          </div>
        )}
        {protein_source && (
          <div className="detail-row">
            <dt>{t("Protein source")}</dt>
            <dd>{protein_source}</dd>
          </div>
        )}
        {fibre && (
          <div className="detail-row">
            <dt>{t("Fibre")}</dt>
            <dd className="detail-row__capitalize">{fibre}</dd>
          </div>
        )}
        {constraints && (
          <div className="detail-row">
            <dt>{t("Constraints")}</dt>
            <dd>{constraints}</dd>
          </div>
        )}
        <div className="detail-row">
          <dt>{t("Product pairing")}</dt>
          <dd>{protocol_product_pairing || t("No product pairing for this slot.")}</dd>
        </div>
      </dl>

      {rationale && (
        <p className="meal-card__rationale">
          <strong>{t("Why:")}</strong> {rationale}
        </p>
      )}
    </div>
  );
}

export default function DietProtocol({ dietProtocol }) {
  const { t } = useLanguage();

  if (!dietProtocol || Object.keys(dietProtocol).length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title">{t("Diet Protocol")}</h2>
        <p className="protocol-empty">{t("No diet protocol available.")}</p>
      </section>
    );
  }

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title">{t("Diet Protocol")}</h2>
      <div className="card-grid card-grid--meals">
        {Object.entries(dietProtocol).map(([mealKey, meal]) => (
          <MealCard key={mealKey} mealKey={mealKey} meal={meal} t={t} />
        ))}
      </div>
    </section>
  );
}
