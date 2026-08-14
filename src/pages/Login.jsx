import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { completePendingOnboarding, ONBOARDING_DRAFT_KEY } from "../api/client.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import GeneratingOverlay from "../components/GeneratingOverlay.jsx";
import logo from "../assets/image.png";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Whether a pending onboarding submission (stashed under sessionStorage's
  // "pendingOnboarding" key) will be resumed after this login succeeds —
  // that resume call can take up to a minute (it's the same protocol
  // generation call Finish makes), so it gets the same fancy wait screen
  // instead of just sitting on a disabled button.
  const [resumingOnboarding, setResumingOnboarding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      if (sessionStorage.getItem("pendingOnboarding")) {
        setResumingOnboarding(true);
      }
      const resumed = await completePendingOnboarding(navigate);
      if (resumed) return;

      if (sessionStorage.getItem(ONBOARDING_DRAFT_KEY)) {
        // Came here via the onboarding topbar's "Log in" button (not
        // Finish) — no submission to make, just send them back to pick up
        // the wizard where they left off. OnboardingFlow reads and clears
        // this key itself once `user` is set.
        navigate("/onboarding");
        return;
      }

      navigate("/landing");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Login failed. Please check your credentials.")
      );
    } finally {
      setSubmitting(false);
      setResumingOnboarding(false);
    }
  };

  return (
    <div className="login-page">
      {resumingOnboarding && <GeneratingOverlay />}

      <div className="login-lang-toggle">
        <LanguageToggle />
      </div>

      {/* Left pane: full-height hero photo, same art direction as the landing page */}
      <div className="login-image-pane">
        <div className="login-image-pane__image" />
        <div className="login-image-pane__overlay" />
        <div className="login-image-pane__brand">
          <img src={logo} alt="FuelNode" className="login-image-pane__logo" />
          <h1 className="login-image-pane__title">
            {t("The right fuel,")}
            <br />
            <span className="login-accent">{t("at the right time")}</span>
          </h1>
          <p className="login-image-pane__sub">
            {t(
              "Precise nutrition protocols and weekly boxes, built around your training."
            )}
          </p>
        </div>
      </div>

      {/* Right pane: login details */}
      <div className="login-form-pane">
        <div className="login-glow login-glow-a" aria-hidden="true" />
        <div className="login-glow login-glow-b" aria-hidden="true" />

        <div className="form-card">
          <h1>{t("Log in")}</h1>
          <p className="form-card__subtitle">
            {t("Welcome back. Enter your details to continue.")}
          </p>

          {error && <div className="alert-error">{error}</div>}

          {/*
            autoComplete is switched off deliberately: browsers were filling in
            saved credentials on mount, so the fields looked pre-populated
            before the user typed anything. The password input uses
            "new-password" because Chrome ignores "off" on password fields in
            anything it recognises as a sign-in form, and the name attributes
            avoid the usual "email"/"password" heuristics. Values are read from
            React state in handleSubmit, so the names are cosmetic.
          */}
          <form onSubmit={handleSubmit} autoComplete="off">
            <label>
              {t("Email")}
              <input
                type="email"
                name="fn-login-email"
                placeholder={t("Enter your email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                required
              />
            </label>

            <label>
              {t("Password")}
              <input
                type="password"
                name="fn-login-pass"
                placeholder={t("Enter your password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? t("Logging in...") : t("Log in")}
            </button>
          </form>

          <p className="form-card__footer-link">
            {t("Don't have an account?")}{" "}
            <Link to="/register">{t("Sign up")}</Link>
          </p>

          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
}