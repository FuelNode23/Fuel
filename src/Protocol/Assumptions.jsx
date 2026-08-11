import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function Assumptions({ assumptions }) {
  const { t } = useLanguage();
  if (!assumptions || assumptions.length === 0) return null;

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title">{t("Assumptions Made")}</h2>
      <ul className="checklist">
        {assumptions.map((item, index) => (
          <li className="checklist__item" key={index}>
            <span className="checklist__icon" aria-hidden="true">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
