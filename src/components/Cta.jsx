import { Icon } from "./Icons.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function Cta() {
  const { t } = useLanguage();

  return (
    <section className="fn-section">
      <div className="fn-cta-card">
        <h2 className="fn-section-title">{t("Access FuelNode")}</h2>
        <p className="fn-section-subtitle">
          {t(
            "A short onboarding, an immediately usable protocol, and a box that follows your training week."
          )}
        </p>
        <a className="fn-btn fn-btn-primary fn-btn-lg" href="/onboarding">
          {t("Try FuelNode")}
          <Icon.ArrowRight className="fn-icon-sm" />
        </a>
      </div>
    </section>
  );
}
