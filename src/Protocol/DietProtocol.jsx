import "./ProtocolComponents.css";

const MEAL_LABELS = {
  pre_training_meal: "Pre-Training Meal",
  pre_training_snack: "Pre-Training Snack",
  recovery_window: "Recovery Window",
  main_meal: "Main Meal",
};

function prettifyKey(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function MealCard({ mealKey, meal }) {
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
        <h3 className="meal-card__title">{MEAL_LABELS[mealKey] || prettifyKey(mealKey)}</h3>
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
            <dt>Base</dt>
            <dd>{base_type}</dd>
          </div>
        )}
        {protein_source && (
          <div className="detail-row">
            <dt>Protein source</dt>
            <dd>{protein_source}</dd>
          </div>
        )}
        {fibre && (
          <div className="detail-row">
            <dt>Fibre</dt>
            <dd className="detail-row__capitalize">{fibre}</dd>
          </div>
        )}
        {constraints && (
          <div className="detail-row">
            <dt>Constraints</dt>
            <dd>{constraints}</dd>
          </div>
        )}
        <div className="detail-row">
          <dt>Product pairing</dt>
          <dd>{protocol_product_pairing || "No product pairing for this slot."}</dd>
        </div>
      </dl>

      {rationale && (
        <p className="meal-card__rationale">
          <strong>Why:</strong> {rationale}
        </p>
      )}
    </div>
  );
}

export default function DietProtocol({ dietProtocol }) {
  if (!dietProtocol || Object.keys(dietProtocol).length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title">Diet Protocol</h2>
        <p className="protocol-empty">No diet protocol available.</p>
      </section>
    );
  }

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title">Diet Protocol</h2>
      <div className="card-grid card-grid--meals">
        {Object.entries(dietProtocol).map(([mealKey, meal]) => (
          <MealCard key={mealKey} mealKey={mealKey} meal={meal} />
        ))}
      </div>
    </section>
  );
}
