import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import LanguageToggle from "./LanguageToggle.jsx";
import "./AccountBar.css";

function formatLastLogin(isoString, language) {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(language === "fr" ? "fr-FR" : undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Floating "welcome back" indicator + logout + language toggle, shown on
 * every authenticated page. Renders nothing when signed out, so it's safe
 * to drop into a page unconditionally (e.g. both the auth gate and the
 * question wizard in OnboardingFlow) without extra checks at the call site.
 */
export default function AccountBar() {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const firstName = user.fullName?.split(" ")[0] || user.fullName;
  const lastLoginText = formatLastLogin(user.lastLoginAt, language);

  return (
    <div className="account-bar">
      <div className="account-bar__greeting">
        <span className="account-bar__welcome">{t("Welcome, {name}", { name: firstName })}</span>
        {lastLoginText && (
          <span className="account-bar__last-login">
            {t("Last login: {value}", { value: lastLoginText })}
          </span>
        )}
      </div>
      <LanguageToggle />
      <button type="button" className="account-bar__logout" onClick={handleLogout}>
        {t("Log out")}
      </button>
    </div>
  );
}
