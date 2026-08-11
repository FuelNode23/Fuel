import { useLanguage } from "../i18n/LanguageContext.jsx";
import LanguageToggle from "./LanguageToggle.jsx";

export default function Nav() {
  const { t } = useLanguage();

  return (
    <nav className="fn-nav">
      <div className="fn-nav-inner">
        <div className="fn-nav-spacer" />
        <div className="fn-nav-links">
          <a href="#how" className="fn-nav-link">{t("How it works")}</a>
          <a href="#delivery" className="fn-nav-link">{t("Delivery")}</a>
          <button type="button" className="fn-nav-link fn-nav-button">
            {t("Finish onboarding")}
          </button>
        </div>
        <div className="fn-nav-actions">
          <LanguageToggle />
          <button type="button" className="fn-menu-button" aria-label={t("Menu")}>
            <span className="fn-menu-bar" />
            <span className="fn-menu-bar" />
            <span className="fn-menu-bar" />
          </button>
        </div>
      </div>
    </nav>
  );
}
