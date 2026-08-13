import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { Icon } from "./Icons.jsx";
import LanguageToggle from "./LanguageToggle.jsx";
import "./AccountBar.css";

// How long the "See you again!" goodbye modal stays up before it
// auto-dismisses and sends the (now signed-out) user on to the dashboard.
const GOODBYE_DISPLAY_MS = 1800;

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
  const location = useLocation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [goodbyeOpen, setGoodbyeOpen] = useState(false);

  // Once the goodbye modal is showing, the session is already cleared -
  // this just gives the user a beat to read the message before landing on
  // the dashboard, then auto-dismisses instead of requiring another click.
  useEffect(() => {
    if (!goodbyeOpen) return;
    const timer = setTimeout(() => {
      setGoodbyeOpen(false);
      navigate("/dashboard");
    }, GOODBYE_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [goodbyeOpen, navigate]);

  // Signed out and no goodbye message to show: nothing left to render.
  // (goodbyeOpen briefly outlives `user`, which logout() already cleared,
  // so the modal below can still finish its moment on screen.)
  if (!user && !goodbyeOpen) return null;

  const onWeeklyBoxPage = location.pathname === "/weeklybox";

  const handleLogoutClick = () => setConfirmOpen(true);
  const handleCancelLogout = () => setConfirmOpen(false);

  const handleConfirmLogout = () => {
    setConfirmOpen(false);
    logout(); // clears the session + sweeps cookies, see AuthContext
    setGoodbyeOpen(true);
  };

  const firstName = user?.fullName?.split(" ")[0] || user?.fullName;
  const lastLoginText = user ? formatLastLogin(user.lastLoginAt, language) : null;

  return (
    <>
      {user && (
        <div className="account-bar">
          <div className="account-bar__greeting">
            <span className="account-bar__welcome">
              {t("Welcome, {name}", { name: firstName })}
            </span>
            {lastLoginText && (
              <span className="account-bar__last-login">
                {t("Last login: {value}", { value: lastLoginText })}
              </span>
            )}
          </div>
          {!onWeeklyBoxPage && (
            <button
              type="button"
              className="account-bar__nav-link"
              onClick={() => navigate("/weeklybox")}
            >
              <Icon.Package width={14} height={14} />
              {t("Weekly box")}
            </button>
          )}
          <LanguageToggle />
          <button type="button" className="account-bar__logout" onClick={handleLogoutClick}>
            {t("Log out")}
          </button>
        </div>
      )}

      {confirmOpen && (
        <div className="logout-modal-overlay" role="dialog" aria-modal="true">
          <div className="logout-modal-card">
            <h2 className="logout-modal-title">{t("Log out of FuelNode?")}</h2>
            <p className="logout-modal-text">
              {t("You'll need to sign in again to see your protocol and weekly box.")}
            </p>
            <div className="logout-modal-actions">
              <button type="button" className="logout-modal-cancel" onClick={handleCancelLogout}>
                {t("Cancel")}
              </button>
              <button type="button" className="logout-modal-confirm" onClick={handleConfirmLogout}>
                {t("Yes, log out")}
              </button>
            </div>
          </div>
        </div>
      )}

      {goodbyeOpen && (
        <div className="logout-modal-overlay" role="dialog" aria-modal="true">
          <div className="logout-modal-card logout-modal-card--goodbye">
            <h2 className="logout-modal-title">{t("See you again!")}</h2>
            <p className="logout-modal-text">
              {t("You've been logged out safely. Come back soon.")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
