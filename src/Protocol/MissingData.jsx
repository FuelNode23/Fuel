import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function MissingData({ flags }) {
  const { t } = useLanguage();
  if (!flags || flags.length === 0) return null;

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title">{t("Missing Data")}</h2>
      <div className="warning-list">
        {flags.map((flag, index) => (
          <div className="warning-card" key={index}>
            <span className="warning-card__icon" aria-hidden="true">⚠</span>
            <span className="warning-card__text">{flag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
