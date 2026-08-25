import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { completePendingOnboarding, sendOtp } from "../api/client.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { Icon } from "../components/Icons.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import GeneratingOverlay from "../components/GeneratingOverlay.jsx";
import logo from "../assets/fuelnode-logo.png";
import "./Login.css";
// account-tabs/account-field-label/account-otp-input/etc. - reusing the
// email-OTP pattern Account.jsx already built rather than inventing a
// second one. Every one of those classes is scoped as ".form-card .account-*",
// not ".account-page .account-*", so it applies here too with no changes.
import "./Account.css";

export default function Login() {
  const { login, verifyOtp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [method, setMethod] = useState("password"); // "password" | "otp"

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

  // OTP tab state - "request" (enter email, send code) -> "verify" (enter
  // code). Shares `email` with the password tab so switching methods
  // doesn't make someone retype an address they already entered.
  const [otpStep, setOtpStep] = useState("request");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  // Shared by both methods once persistSession has run (see AuthContext) -
  // admins skip the whole athlete post-login path (pending-onboarding
  // resume, landing page) straight to the panel they logged in to manage;
  // everyone else resumes a pending onboarding submission if one exists,
  // or lands on /landing.
  const completeLogin = async (authData) => {
    if (authData.role === "ADMIN") {
      navigate("/admin");
      return;
    }
    if (sessionStorage.getItem("pendingOnboarding")) {
      setResumingOnboarding(true);
    }
    const resumed = await completePendingOnboarding(navigate);
    if (!resumed) navigate("/landing");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const authData = await login(email, password);
      await completeLogin(authData);
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

  const handleSendCode = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSubmitting(true);
    try {
      await sendOtp(email);
      setOtpStep("verify");
    } catch (err) {
      setOtpError(
        err.response?.data?.message || t("Could not send the code right now. Please try again.")
      );
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSubmitting(true);
    try {
      // A correct code is sufficient by itself (see EmailOtpService) - an
      // account already existing for this email logs straight in, same as
      // Account.jsx's Email tab.
      const authData = await verifyOtp(email, otpCode);
      await completeLogin(authData);
    } catch (err) {
      setOtpError(
        err.response?.data?.message || t("Something went wrong. Please try again.")
      );
    } finally {
      setOtpSubmitting(false);
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

          <div className="account-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={method === "password"}
              className={`account-tab${method === "password" ? " account-tab--active" : ""}`}
              onClick={() => setMethod("password")}
            >
              <Icon.Shield width={14} height={14} />
              {t("Password")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={method === "otp"}
              className={`account-tab${method === "otp" ? " account-tab--active" : ""}`}
              onClick={() => setMethod("otp")}
            >
              <Icon.Mail width={14} height={14} />
              {t("One-time code")}
            </button>
          </div>

          {method === "password" ? (
            <>
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
            </>
          ) : otpStep === "request" ? (
            <form onSubmit={handleSendCode}>
              <p className="account-field-hint">
                {t("We'll send a 6-digit code to your email. No password needed.")}
              </p>
              <label>
                {t("Email")}
                <input
                  type="email"
                  placeholder={t("Enter your email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </label>
              {otpError && <div className="alert-error">{otpError}</div>}
              <button type="submit" disabled={otpSubmitting}>
                {otpSubmitting ? t("Sending...") : t("Send code")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <p className="account-field-label">{t("Enter your code")}</p>
              <p className="account-field-hint">
                {t("We sent a 6-digit code to {email}.", { email })}
              </p>
              <input
                type="text"
                className="account-otp-input"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder={t("000000")}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoFocus
                required
              />
              {otpError && <div className="alert-error">{otpError}</div>}
              <button type="submit" disabled={otpCode.length !== 6 || otpSubmitting}>
                {otpSubmitting ? t("Verifying...") : t("Verify & continue")}
              </button>
              <button
                type="button"
                className="account-switch-link"
                onClick={() => {
                  setOtpStep("request");
                  setOtpCode("");
                  setOtpError("");
                }}
              >
                {t("Use a different email")}
              </button>
            </form>
          )}

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
