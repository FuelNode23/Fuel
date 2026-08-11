import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./LanguageToggle.css";

/**
 * Global EN/FR switch. Both options are always visible with the active one
 * highlighted, so the current language is clear at a glance rather than
 * only showing the language you'd switch *to*. Used on every page (Nav,
 * AccountBar, Login/Register, Onboarding) so language stays in sync
 * everywhere via LanguageContext.
 */
export default function LanguageToggle({ className = "" }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={`lang-toggle ${className}`.trim()}
      role="group"
      aria-label={t("English") + " / " + t("French")}
    >
      <button
        type="button"
        className={"lang-toggle__option" + (language === "en" ? " lang-toggle__option--active" : "")}
        aria-pressed={language === "en"}
        aria-label={t("English")}
        title={t("English")}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={"lang-toggle__option" + (language === "fr" ? " lang-toggle__option--active" : "")}
        aria-pressed={language === "fr"}
        aria-label={t("French")}
        title={t("French")}
        onClick={() => setLanguage("fr")}
      >
        FR
      </button>
    </div>
  );
}
