import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function SpecialistProtocols({ protocols }) {
  const { t } = useLanguage();

  if (!protocols || protocols.length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title">{t("Specialist Protocols")}</h2>
        <p className="protocol-empty">{t("No specialist protocols are active.")}</p>
      </section>
    );
  }

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title">{t("Specialist Protocols")}</h2>
      <div className="card-grid card-grid--specialist">
        {protocols.map((protocol, index) => (
          <div className="card specialist-card" key={protocol?.name || index}>
            <div className="specialist-card__header">
              <h3 className="specialist-card__title">{protocol?.name || t("Untitled Protocol")}</h3>
              {protocol?.active && <span className="badge badge--active">{t("Active")}</span>}
            </div>
            {protocol?.rationale && (
              <p className="specialist-card__rationale">
                <strong>{t("Why:")}</strong> {protocol.rationale}
              </p>
            )}
            {protocol?.instructions && (
              <p className="specialist-card__instructions">
                <strong>{t("How:")}</strong> {protocol.instructions}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
