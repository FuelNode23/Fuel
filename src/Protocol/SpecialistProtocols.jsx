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
          <div className="card specialist-card" key={protocol?.protocol_name || index}>
            <div className="specialist-card__header">
              <h3 className="specialist-card__title">{protocol?.protocol_name || t("Untitled Protocol")}</h3>
              <span className="badge badge--active">{t("Active")}</span>
            </div>

            {protocol?.duration && (
              <span className="badge badge--muted">{protocol.duration}</span>
            )}

            {protocol?.trigger_reason && (
              <p className="specialist-card__rationale">
                <strong>{t("Why:")}</strong> {protocol.trigger_reason}
              </p>
            )}
            {protocol?.modifications_to_core && (
              <p className="specialist-card__instructions">
                <strong>{t("How:")}</strong> {protocol.modifications_to_core}
              </p>
            )}

            {protocol?.additional_products?.length > 0 && (
              <div>
                <span className="athlete-stat-tile__label">{t("Added to your box")}</span>
                <div className="athlete-stat-tile__pills">
                  {protocol.additional_products.map((p) => (
                    <span className="pill" key={p}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {protocol?.removed_products?.length > 0 && (
              <div>
                <span className="athlete-stat-tile__label">{t("Removed from your box")}</span>
                <div className="athlete-stat-tile__pills">
                  {protocol.removed_products.map((p) => (
                    <span className="pill pill--removed" key={p}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
