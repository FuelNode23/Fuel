import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { completePendingOnboarding } from "../api/client.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import GeneratingOverlay from "../components/GeneratingOverlay.jsx";
import logo from "../assets/image.png";
import "./Login.css";

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // See Login.jsx — same "resume a pending onboarding submission" wait,
  // same fancy overlay instead of a plain disabled button for up to a minute.
  const [resumingOnboarding, setResumingOnboarding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("Password must be at least 8 characters long."));
      return;
    }

    setSubmitting(true);

    try {
      await register(email, password, fullName);

      // register() already persists a session, so if the person came from
      // onboarding, finish that submission now instead of making them log
      // in again just to redo the same request.
      if (sessionStorage.getItem("pendingOnboarding")) {
        setResumingOnboarding(true);
      }
      const resumed = await completePendingOnboarding(navigate);
      if (!resumed) navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Registration failed. Please try again.")
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

      {/* Right pane: registration details */}
      <div className="login-form-pane">
        <div className="login-glow login-glow-a" aria-hidden="true" />
        <div className="login-glow login-glow-b" aria-hidden="true" />

        <div className="form-card">
          <h1>{t("Create your account")}</h1>
          <p className="form-card__subtitle">
            {t("Join FuelNode and get your first weekly box built around you.")}
          </p>

          {error && <div className="alert-error">{error}</div>}

          {/*
            autoComplete is switched off deliberately — same reasoning as
            Login.jsx: browsers were filling saved credentials on mount, so the
            fields looked pre-populated before the user typed anything. The
            password input uses "new-password" because Chrome ignores "off" on
            password fields, and the name attributes avoid the usual
            "name"/"email"/"password" heuristics. Values are read from React
            state in handleSubmit, so the names are cosmetic.
          */}
          <form onSubmit={handleSubmit} autoComplete="off">
            <label>
              {t("Full Name")}
              <input
                type="text"
                name="fn-reg-name"
                placeholder={t("Enter your full name")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck="false"
                required
              />
            </label>

            <label>
              {t("Email")}
              <input
                type="email"
                name="fn-reg-email"
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
                name="fn-reg-pass"
                placeholder={t("Enter your password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? t("Creating account...") : t("Sign Up")}
            </button>
          </form>

          <p className="form-card__footer-link">
            {t("Already have an account?")}{" "}
            <Link to="/login">{t("Log in")}</Link>
          </p>

          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
}