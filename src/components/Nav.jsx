import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import LanguageToggle from "./LanguageToggle.jsx";
import logo from "../assets/fuelnode-logo.png";

export default function Nav() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <nav className="fn-nav">
      <div className="fn-nav-inner">
        <button type="button" className="fn-nav-logo" onClick={() => navigate("/landing")} aria-label="FuelNode">
          <img src={logo} alt="" className="fn-nav-logo__image" />
          <span className="fn-nav-logo__wordmark">
            Fuel<span className="fn-nav-logo__wordmark-accent">Node</span>
          </span>
        </button>
        <div className="fn-nav-links">
          <a href="#how" className="fn-nav-link">{t("How it works")}</a>
          <a href="#delivery" className="fn-nav-link">{t("Delivery")}</a>
          <button type="button" className="fn-nav-link fn-nav-button">
            {t("Finish onboarding")}
          </button>
        </div>
        <div className="fn-nav-actions">
          <button
            type="button"
            className="fn-nav-signin"
            onClick={() => navigate("/login")}
          >
            {t("Sign In")}
          </button>
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
