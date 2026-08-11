import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const STAGE_LABELS = {
  pre_training: "Pre-Training",
  during_training: "During Training",
  post_training: "Post-Training",
  race_day: "Race Day",
};

const FIELD_LABELS = {
  timing: "Timing",
  carbohydrates_g: "Carbohydrates",
  carbohydrates_per_hour_g: "Carbohydrates / hour",
  protein_g: "Protein",
  ratio: "Ratio",
  format: "Format",
  gel_frequency: "Gel frequency",
  instructions: "Instructions",
  rationale: "Rationale",
};

function prettifyKey(key) {
  return key.replace(/_g$/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderValue(key, value) {
  if (value == null) return "—";
  if (/_g$/.test(key) && typeof value === "number") return `${value}g`;
  return String(value);
}

function HydrationBlock({ hydration, t }) {
  if (!hydration || Object.keys(hydration).length === 0) return null;
  return (
    <div className="detail-row">
      <dt>{t("Hydration")}</dt>
      <dd>
        <ul className="fueling-stage__sublist">
          {hydration.per_hour_ml != null && (
            <li>{t("{value}ml per hour", { value: hydration.per_hour_ml })}</li>
          )}
          {hydration.electrolyte_trigger && <li>{hydration.electrolyte_trigger}</li>}
          {hydration.notes && <li>{hydration.notes}</li>}
        </ul>
      </dd>
    </div>
  );
}

function FuelingStageCard({ stageKey, stage, t }) {
  const label = t(STAGE_LABELS[stageKey]) || prettifyKey(stageKey);

  if (!stage) {
    return (
      <div className="card fueling-stage-card fueling-stage-card--empty">
        <h3 className="fueling-stage-card__title">{label}</h3>
        <p className="protocol-empty">{t("Not applicable for this protocol.")}</p>
      </div>
    );
  }

  const { hydration, instructions, rationale, ...rest } = stage;

  return (
    <div className="card fueling-stage-card">
      <h3 className="fueling-stage-card__title">{label}</h3>
      <dl className="meal-card__details">
        {Object.entries(rest).map(([key, value]) => (
          <div className="detail-row" key={key}>
            <dt>{t(FIELD_LABELS[key]) || prettifyKey(key)}</dt>
            <dd>{renderValue(key, value)}</dd>
          </div>
        ))}
        <HydrationBlock hydration={hydration} t={t} />
        {instructions && (
          <div className="detail-row">
            <dt>{t("Instructions")}</dt>
            <dd>{instructions}</dd>
          </div>
        )}
      </dl>
      {rationale && (
        <p className="meal-card__rationale">
          <strong>{t("Why:")}</strong> {rationale}
        </p>
      )}
    </div>
  );
}

export default function FuelingProtocol({ fuelingProtocol }) {
  const { t } = useLanguage();

  if (!fuelingProtocol || Object.keys(fuelingProtocol).length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title">{t("Fueling Protocol")}</h2>
        <p className="protocol-empty">{t("No fueling protocol available.")}</p>
      </section>
    );
  }

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title">{t("Fueling Protocol")}</h2>
      <div className="card-grid card-grid--fueling">
        {Object.entries(fuelingProtocol).map(([stageKey, stage]) => (
          <FuelingStageCard key={stageKey} stageKey={stageKey} stage={stage} t={t} />
        ))}
      </div>
    </section>
  );
}
