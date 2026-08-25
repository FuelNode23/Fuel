import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { sendOtp, startOnboarding } from "../api/client.js";
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
 * startOnboarding), switches to an inline sign-in instead of sending the
 * visitor to a separate page - AuthContext's existing login()/verifyOtp()
 * already trigger the wizard's own profile pre-fill effect once `user` is
 * set, so a genuinely-returning visitor picks up right where they left off.
 * Password and email-code are offered as peers here (existingMode), not
 * just password: an account created via OTP-only sign-in (see
 * EmailOtpService) has no real password anyone could type in, so it would
 * otherwise be a dead end for exactly those visitors.
 */
export default function IdentityGate({ onSuccess }) {
  const { login, verifyOtp } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState("identity"); // "identity" | "existing-account"
  // Only meaningful once mode is "existing-account".
  const [existingMode, setExistingMode] = useState("password"); // "password" | "otp-request" | "otp-verify"
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetExistingModeState = () => {
    setPassword("");
    setOtpCode("");
    setError("");
  };

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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await sendOtp(email);
      setExistingMode("otp-verify");
    } catch (err) {
      setError(
        err.response?.data?.message || t("Could not send the code right now. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await verifyOtp(email, otpCode);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || t("Incorrect code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const isExisting = mode === "existing-account";

  const handleSubmit =
    !isExisting
      ? handleIdentitySubmit
      : existingMode === "password"
        ? handleLoginSubmit
        : existingMode === "otp-request"
          ? handleSendOtp
          : handleVerifyOtp;

  const helperText = !isExisting
    ? t(
        "Just your email and name to begin — no password needed yet. You'll only create one when you're ready to subscribe."
      )
    : existingMode === "password"
      ? t("An account with this email already exists. Enter your password to continue.")
      : existingMode === "otp-request"
        ? t("An account with this email already exists. We'll send a 6-digit code to sign you in instead.")
        : t("Enter the 6-digit code we sent to {email}.", { email });

  const submitLabel = !isExisting
    ? submitting
      ? t("Starting...")
      : t("Continue")
    : existingMode === "password"
      ? submitting
        ? t("Logging in...")
        : t("Log in")
      : existingMode === "otp-request"
        ? submitting
          ? t("Sending...")
          : t("Send code")
        : submitting
          ? t("Verifying...")
          : t("Verify & continue");

  const submitDisabled =
    submitting ||
    (!isExisting
      ? !email.trim() || !fullName.trim()
      : existingMode === "password"
        ? !password
        : existingMode === "otp-verify"
          ? otpCode.length !== 6
          : false);

  return (
    <div className="ob-page">
      <div className="ob-bg-glow">
        <div className="ob-bg-glow-top" />
      </div>

      <div className="ob-topbar">
        <span />
        <LanguageToggle />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="ob-content">
          <div className="ob-brand">FuelNode</div>
          <h1 className="ob-title">{isExisting ? t("Welcome back") : t("Let's get started")}</h1>
          <p className="ob-helper-text">{helperText}</p>

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

                {existingMode === "password" && (
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
                )}

                {existingMode === "otp-verify" && (
                  <div className="ob-field">
                    <label className="ob-label" htmlFor="identity-login-otp">
                      {t("Code")}
                    </label>
                    <input
                      id="identity-login-otp"
                      className="ob-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder={t("000000")}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      autoFocus
                      required
                    />
                  </div>
                )}

                {existingMode === "password" && (
                  <button
                    type="button"
                    className="ob-auth-switch"
                    onClick={() => {
                      resetExistingModeState();
                      setExistingMode("otp-request");
                    }}
                  >
                    {t("No password? Sign in with an email code instead")}
                  </button>
                )}

                {existingMode === "otp-request" && (
                  <button
                    type="button"
                    className="ob-auth-switch"
                    onClick={() => {
                      resetExistingModeState();
                      setExistingMode("password");
                    }}
                  >
                    {t("Use my password instead")}
                  </button>
                )}

                {existingMode === "otp-verify" && (
                  <button
                    type="button"
                    className="ob-auth-switch"
                    onClick={() => {
                      resetExistingModeState();
                      setExistingMode("otp-request");
                    }}
                  >
                    {t("Send a new code")}
                  </button>
                )}

                <button
                  type="button"
                  className="ob-auth-switch"
                  onClick={() => {
                    setMode("identity");
                    setExistingMode("password");
                    resetExistingModeState();
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
          <button type="submit" className="ob-continue" disabled={submitDisabled}>
            {submitLabel}
          </button>
        </div>
      </form>

      <CopyrightFooter />
    </div>
  );
}
