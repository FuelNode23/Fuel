
import image from "../assets/image.png";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="fn-footer">
      <div className="fn-footer-inner">
        <div className="fn-footer-brand">
          <img
            src={image}
            alt="FuelNode"
            className="fn-footer-logo"
          />
        </div>

        <div className="fn-footer-links">
          <a href="/terms">{t("Terms & Conditions")}</a>
          <a href="/privacy">{t("Privacy Policy")}</a>
          <a href="mailto:customer@fuelnode.fr">
            customer@fuelnode.fr
          </a>
        </div>
      </div>

      <p className="fn-footer-copyright">
        &copy; {new Date().getFullYear()} FuelNode. {t("All rights reserved.")}
      </p>
    </footer>
  );
}
