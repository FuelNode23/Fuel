import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import apiClient, { DRAFT_TOKEN_KEY, saveGeneratedProtocol } from "../api/client.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import logo from "../assets/image.png";
import "./Login.css";
import "./Account.css";

// Draft tokens are unverified-on-the-client JWTs (see IdentityGate/AuthService) -
// decoding the payload here is only ever used to pre-fill a display field,
// never to authorize anything, so no signature check is needed.
function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Sign-in gate reached after picking a subscription plan - this is now
 * where a first-time visitor actually creates their account (password +
 * mobile number), replacing the old separate CreateAccount.jsx step that
 * used to run right before Subscriptions. Same shell/theme as Login.jsx
 * (split hero pane + glass form-card) rather than Account.jsx's own
 * earlier dark-card look. The Email tab (magic link) and OAuth buttons
 * are still the dummy placeholders they always were - no magic-link/OAuth
 * backend exists (see the original comment this replaced). The Sign-In
 * tab is real, in both directions: it always opens on plain login (not
 * registration) regardless of session state, with "New here? Sign up"
 * as an explicit opt-in for a draft session that hasn't set a password
 * yet, or a plain login for a visitor who already has an account.
 */
export default function Account() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading, login, completeRegistration } = useAuth();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const category = searchParams.get("category");

  const [method, setMethod] = useState("signin");
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Sign-In tab state - always opens on "login"; "New here? Sign up"
  // switches to "register" explicitly, it's never the default.
  const [signInMode, setSignInMode] = useState("login"); // "login" | "register"
  const [manualEmail, setManualEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInSubmitting, setSignInSubmitting] = useState(false);

  // A real session already knows its own email. Failing that, a draft
  // session (identity captured, registration not yet completed) carries
  // it as the draft token's `sub` claim. Neither exists only if this page
  // is reached with no prior context at all, e.g. a direct URL visit.
  const knownEmail = user?.email || decodeJwtPayload(sessionStorage.getItem(DRAFT_TOKEN_KEY) || "")?.sub || "";
  const signInEmail = knownEmail || manualEmail;

  const handleContinue = () => {
    sessionStorage.setItem("dummyAuthenticated", "true");
    if (plan) sessionStorage.setItem("selectedPlan", plan);
    if (category) sessionStorage.setItem("selectedBoxVariant", category);
    navigate("/athlete-dashboard");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInError("");
    setSignInSubmitting(true);
    try {
      await login(signInEmail, signInPassword);
      handleContinue();
    } catch (err) {
      setSignInError(
        err.response?.data?.message || t("Login failed. Please check your credentials.")
      );
    } finally {
      setSignInSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSignInError("");

    if (password.length < 8) {
      setSignInError(t("Password must be at least 8 characters long."));
      return;
    }
    if (password !== confirmPassword) {
      setSignInError(t("Passwords do not match."));
      return;
    }

    setSignInSubmitting(true);
    try {
      // A real session already existing here means this is a retry after
      // registration itself succeeded but a save below failed - the draft
      // token is gone by then, so skip straight to retrying the saves.
      if (!user) {
        await completeRegistration(password, mobileNumber.trim() || undefined);
      }

      // Onboarding's answers and the already-generated protocol were only
      // ever held client-side until now (see OnboardingFlow/IdentityGate) -
      // this is the first moment they're persisted for real, no second
      // Claude call, so the box already reviewed is exactly what's saved.
      const stored = sessionStorage.getItem("protocolHandoff");
      const handoff = stored ? JSON.parse(stored) : null;

      if (handoff?.userData) {
        await apiClient.put("/athletes/profile", handoff.userData);
      }
      if (handoff?.onboardingResult) {
        await saveGeneratedProtocol(handoff.onboardingResult);
      }

      handleContinue();
    } catch (err) {
      setSignInError(
        err.response?.data?.message || t("Something went wrong. Please try again.")
      );
    } finally {
      setSignInSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="login-page" />;
  }

  return (
    <div className="login-page">
      <div className="login-lang-toggle">
        <LanguageToggle />
      </div>

      {/* Left pane: same hero photo as Login.jsx/Register.jsx */}
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

      {/* Right pane: account gate */}
      <div className="login-form-pane">
        <div className="login-glow login-glow-a" aria-hidden="true" />
        <div className="login-glow login-glow-b" aria-hidden="true" />

        <div className="form-card">
          <button type="button" className="back-link" onClick={() => navigate("/subscription")}>
            <Icon.ArrowLeft width={16} height={16} />
            {t("Back")}
          </button>

          <div className="account-card__top">
            <div className="badge badge--active">
              <Icon.Shield width={12} height={12} style={{ marginRight: 4 }} />
              {t("Account")}
            </div>
          </div>

          <h1>{t("Sign in to open your account")}</h1>
          <p className="form-card__subtitle">
            {t(
              "Your Fuelnode account is protected. Sign in here to access your subscription, contact details, and legal documents."
            )}
          </p>

          <div className="account-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={method === "email"}
              className={`account-tab${method === "email" ? " account-tab--active" : ""}`}
              onClick={() => setMethod("email")}
            >
              <Icon.Mail width={14} height={14} />
              {t("Email")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={method === "signin"}
              className={`account-tab${method === "signin" ? " account-tab--active" : ""}`}
              onClick={() => setMethod("signin")}
            >
              <Icon.User width={14} height={14} />
              {t("Sign-In")}
            </button>
          </div>

          {method === "email" ? (
            <>
              <p className="account-field-label">{t("Magic link by email")}</p>
              <p className="account-field-hint">
                {t("Receive a secure link. Fuelnode does not create or store passwords.")}
              </p>
              <input
                type="email"
                placeholder={t("you@example.com")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button type="button" onClick={handleContinue}>
                {t("Send magic link")}
              </button>

              <label className="account-terms">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                {t("I accept the")} <strong>{t("Terms of use")}</strong> {t("and")}{" "}
                <strong>{t("Privacy policy")}</strong>.
              </label>

              <div className="account-divider">{t("OR CONTINUE WITH")}</div>

              <button type="button" className="account-oauth" onClick={handleContinue}>
                <Icon.User width={16} height={16} />
                {t("Continue with Google")}
              </button>
              <button type="button" className="account-oauth" onClick={handleContinue}>
                <Icon.Apple width={16} height={16} />
                {t("Continue with Apple")}
              </button>
              <button type="button" className="account-oauth" disabled>
                <Icon.Shield width={16} height={16} />
                {t("Continue with Yahoo")}
              </button>
              <p className="account-oauth-note">
                {t("Yahoo is only available through a configured custom OAuth/OIDC provider.")}
              </p>
            </>
          ) : signInMode === "login" ? (
            <form onSubmit={handleSignIn}>
              <label>
                {t("Email")}
                <input
                  type="email"
                  value={signInEmail}
                  disabled={Boolean(knownEmail)}
                  placeholder={t("you@example.com")}
                  onChange={(e) => setManualEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <label>
                {t("Password")}
                <input
                  type="password"
                  value={signInPassword}
                  placeholder={t("Enter your password")}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              {signInError && <div className="alert-error">{signInError}</div>}

              <button type="submit" disabled={signInSubmitting}>
                {signInSubmitting ? t("Signing in...") : t("Sign in")}
              </button>

              {!user && (
                <button
                  type="button"
                  className="account-switch-link"
                  onClick={() => {
                    setSignInMode("register");
                    setSignInError("");
                  }}
                >
                  {t("New here? Sign up")}
                </button>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <label>
                {t("Email")}
                <input
                  type="email"
                  value={signInEmail}
                  disabled={Boolean(knownEmail)}
                  placeholder={t("you@example.com")}
                  onChange={(e) => setManualEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <label>
                {t("Password")}
                <input
                  type="password"
                  value={password}
                  placeholder={t("Enter a password")}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
              <label>
                {t("Confirm password")}
                <input
                  type="password"
                  value={confirmPassword}
                  placeholder={t("Re-enter your password")}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
              <label>
                {t("Mobile number")}
                <input
                  type="tel"
                  value={mobileNumber}
                  placeholder={t("+33 6 12 34 56 78")}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  autoComplete="tel"
                />
              </label>

              {signInError && <div className="alert-error">{signInError}</div>}

              <button type="submit" disabled={signInSubmitting}>
                {signInSubmitting ? t("Creating account...") : t("Register")}
              </button>

              <button
                type="button"
                className="account-switch-link"
                onClick={() => {
                  setSignInMode("login");
                  setSignInError("");
                }}
              >
                {t("Already have an account? Sign in")}
              </button>
            </form>
          )}

          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
}
