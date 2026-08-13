import { useState } from "react";
import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { Icon } from "../components/Icons.jsx";

const STAGES = [
  { key: "pre_training", title: "Before the session" },
  { key: "during_training", title: "During the session" },
  { key: "post_training", title: "After the session" },
];

// fueling_protocol.products entries are full "Brand + Name" strings (e.g.
// "Authentic Nutrition Flapjack Bar"), while science_cards.product_name is
// just the short product name ("Flapjack Bar") — so this matches by
// substring rather than exact equality.
function findScienceCardsForProducts(scienceCards, products) {
  if (!Array.isArray(scienceCards) || !Array.isArray(products)) return [];
  const haystacks = products.map((p) => (p || "").toLowerCase());
  return scienceCards.filter((card) => {
    const name = (card?.product_name || "").toLowerCase();
    return name && haystacks.some((p) => p.includes(name));
  });
}

function StageCard({ stageKey, title, stage, scienceCards, t }) {
  const [showWhy, setShowWhy] = useState(false);

  if (!stage) {
    return (
      <div className="card session-stage-card fueling-stage-card--empty">
        <h3 className="session-stage-card__title">{t(title)}</h3>
        <p className="protocol-empty">{t("Not applicable for this protocol.")}</p>
      </div>
    );
  }

  const timing = stage.timing || stage.frequency;
  const products = Array.isArray(stage.products) ? stage.products : [];
  const matchedScience = findScienceCardsForProducts(scienceCards, products);

  return (
    <div className="card session-stage-card">
      <div className="session-stage-card__header">
        <h3 className="session-stage-card__title">{t(title)}</h3>
        {timing && <span className="session-stage-card__timing">{timing}</span>}
      </div>

      {products.length > 0 && (
        <div className="session-stage-card__product-box">
          <span className="session-stage-card__product-label">{t("Box product")}</span>
          <span className="session-stage-card__product-value">{products.join(", ")}</span>
        </div>
      )}

      {stage.rationale && (
        <div className="session-stage-card__text-box">
          <p>{stage.rationale}</p>
        </div>
      )}

      {stage.instruction && (
        <div className="session-stage-card__text-box">
          <p>{stage.instruction}</p>
        </div>
      )}

      {matchedScience.length > 0 && (
        <>
          {showWhy && (
            <div className="session-stage-card__science">
              {matchedScience.map((card) => (
                <div key={card.product_name}>
                  {card.layer_1 && <p>{card.layer_1}</p>}
                  {card.layer_2 && <p>{card.layer_2}</p>}
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className="session-stage-card__why"
            onClick={() => setShowWhy((prev) => !prev)}
            aria-expanded={showWhy}
          >
            <Icon.ArrowRight
              width={12}
              height={12}
              style={{ transform: showWhy ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }}
            />
            {t("Why?")}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Replaces the old field-dump FuelingProtocol component. Same underlying
 * data (protocol.fueling_protocol.{pre_training,during_training,
 * post_training}) — timing/frequency, products, rationale and instruction
 * are all real backend fields. "Why?" reveals the matching science_cards
 * entry (also real) instead of duplicating the rationale text.
 */
export default function SessionProtocol({ fuelingProtocol, scienceCards }) {
  const { t } = useLanguage();

  if (!fuelingProtocol || Object.keys(fuelingProtocol).length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title section-title-icon">
          <Icon.Zap width={18} height={18} />
          {t("Session protocol")}
        </h2>
        <p className="protocol-empty">{t("No fueling protocol available.")}</p>
      </section>
    );
  }

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title section-title-icon">
        <Icon.Zap width={18} height={18} />
        {t("Session protocol")}
      </h2>
      <p className="protocol-empty" style={{ marginBottom: "1rem" }}>
        {t("This session protocol matches your usual practice and uses the products from your session box.")}
      </p>
      <div className="card-grid card-grid--fueling">
        {STAGES.map(({ key, title }) => (
          <StageCard
            key={key}
            stageKey={key}
            title={title}
            stage={fuelingProtocol[key]}
            scienceCards={scienceCards}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
