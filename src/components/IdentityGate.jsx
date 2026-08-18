import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { startOnboarding } from "../api/client.js";
import LanguageToggle from "./LanguageToggle.jsx";
import CopyrightFooter from "./CopyrightFooter.jsx";
import "../pages/Onboarding.css";

/**
 * First screen of onboarding - collects email + full name only, no
 * password. Establishes a draft session (client.js's startOnboarding /
 * backend AuthService - see the deferred-auth design there) rather than a
 * real one: AuthContext's `user` stays null the whole time this succeeds.
 * onSuccess just tells OnboardingFlow a draft token now exists in
 * sessionStorage, so it can proceed into the question wizard.
 *
 * If this email already has a real, completed account (409 from
 * startOnboarding), switches to an inline login instead of sending the
 * visitor to a separate page - AuthContext's existing login() already
 * triggers the wizard's own profile pre-fill effect once `user` is set, so
 * a genuinely-returning visitor picks up right where they left off.
 */
export default function IdentityGate({ onSuccess }) {
  const { login } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState("identity"); // "identity" | "existing-account"
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleIdentitySubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await startOnboarding(email.trim(), fullName.trim());
      onSuccess();
    } catch (err) {
      if (err.response?.status === 409) {
        setMode("existing-account");
      } else {
        setError(
          err.response?.data?.message ||
            t("Something went wrong. Please check your email and try again.")
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || t("Login failed. Please check your credentials.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isExisting = mode === "existing-account";

  return (
    <div className="ob-page">
      <div className="ob-bg-glow">
        <div className="ob-bg-glow-top" />
      </div>

      <div className="ob-topbar">
        <span />
        <LanguageToggle />
      </div>

      <form onSubmit={isExisting ? handleLoginSubmit : handleIdentitySubmit}>
        <div className="ob-content">
          <div className="ob-brand">FuelNode</div>
          <h1 className="ob-title">{isExisting ? t("Welcome back") : t("Let's get started")}</h1>
          <p className="ob-helper-text">
            {isExisting
              ? t("An account with this email already exists. Enter your password to continue.")
              : t(
                  "Just your email and name to begin — no password needed yet. You'll only create one when you're ready to subscribe."
                )}
          </p>

          <div className="ob-fields">
            {isExisting ? (
              <>
                <div className="ob-field">
                  <label className="ob-label" htmlFor="identity-login-email">
                    {t("Email")}
                  </label>
                  <input
                    id="identity-login-email"
                    className="ob-input"
                    type="email"
                    value={email}
                    disabled
                  />
                </div>
                <div className="ob-field">
                  <label className="ob-label" htmlFor="identity-login-password">
                    {t("Password")}
                  </label>
                  <input
                    id="identity-login-password"
                    className="ob-input"
                    type="password"
                    value={password}
                    placeholder={t("Enter your password")}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button
                  type="button"
                  className="ob-auth-switch"
                  onClick={() => {
                    setMode("identity");
                    setError("");
                    setPassword("");
                  }}
                >
                  {t("Use a different email")}
                </button>
              </>
            ) : (
              <>
                <div className="ob-field">
                  <label className="ob-label" htmlFor="identity-name">
                    {t("Full name")}
                  </label>
                  <input
                    id="identity-name"
                    className="ob-input"
                    type="text"
                    value={fullName}
                    placeholder={t("Enter your full name")}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="ob-field">
                  <label className="ob-label" htmlFor="identity-email">
                    {t("Email")}
                  </label>
                  <input
                    id="identity-email"
                    className="ob-input"
                    type="email"
                    value={email}
                    placeholder={t("Enter your email")}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </>
            )}
          </div>

          {error && <p className="ob-error">{error}</p>}
        </div>

        <div className="ob-footer">
          <button
            type="submit"
            className="ob-continue"
            disabled={
              submitting ||
              (isExisting ? !password : !email.trim() || !fullName.trim())
            }
          >
            {submitting
              ? isExisting
                ? t("Logging in...")
                : t("Starting...")
              : isExisting
                ? t("Log in")
                : t("Continue")}
          </button>
        </div>
      </form>

      <CopyrightFooter />
    </div>
  );
}
