import "./CopyrightFooter.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function CopyrightFooter() {
  const { t } = useLanguage();

  return (
    <footer className="copyright-footer">
      <p>&copy; {new Date().getFullYear()} FuelNode. {t("All rights reserved.")}</p>
    </footer>
  );
}
