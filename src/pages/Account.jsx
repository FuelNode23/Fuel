import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import apiClient, { DRAFT_TOKEN_KEY, saveGeneratedProtocol } from "../api/client.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
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
 * used to run right before Subscriptions. The Email tab (magic link) and
 * OAuth buttons below are still the dummy placeholders they always were -
 * no magic-link/OAuth backend exists (see the original comment this
 * replaced). The Sign-In tab is real, in both directions: registration
 * for a draft session (identity captured via IdentityGate, no password
 * yet), or a plain login for a visitor who already has an account and is
 * re-entering this page rather than continuing straight through.
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

  // Sign-In tab state. Defaults to "register" once auth state resolves and
  // there's no real session yet (see the effect below) - the normal case
  // reaching this page, since real registration now happens here.
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

  // Runs once, right when auth state first resolves (not on every `user`
  // change - completeRegistration/login below also set `user`, and this
  // must not flip signInMode back out from under an in-progress submit).
  useEffect(() => {
    if (authLoading) return;
    setSignInMode(user ? "login" : "register");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

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
    return <div className="account-page" />;
  }

  return (
    <div className="account-page">
      <div className="account-card">
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

        <h1 className="account-card__title">{t("Sign in to open your account")}</h1>
        <p className="account-card__subtitle">
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
              className="account-input"
              placeholder={t("you@example.com")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button type="button" className="btn btn--danger" onClick={handleContinue}>
              <Icon.Mail width={16} height={16} />
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
            <p className="account-field-label">{t("Sign in with your password")}</p>
            <p className="account-field-hint">
              {t("Use the email and password from your FuelNode account.")}
            </p>
            <input
              type="email"
              className="account-input"
              value={signInEmail}
              disabled={Boolean(knownEmail)}
              placeholder={t("you@example.com")}
              onChange={(e) => setManualEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              type="password"
              className="account-input"
              value={signInPassword}
              placeholder={t("Enter your password")}
              onChange={(e) => setSignInPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {signInError && <p className="account-error">{signInError}</p>}

            <button type="submit" className="btn btn--danger" disabled={signInSubmitting}>
              <Icon.User width={16} height={16} />
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
            <p className="account-field-label">{t("Create your password")}</p>
            <p className="account-field-hint">
              {t("Finish setting up the account for this email.")}
            </p>
            <input
              type="email"
              className="account-input"
              value={signInEmail}
              disabled={Boolean(knownEmail)}
              placeholder={t("you@example.com")}
              onChange={(e) => setManualEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              type="password"
              className="account-input"
              value={password}
              placeholder={t("Password")}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <input
              type="password"
              className="account-input"
              value={confirmPassword}
              placeholder={t("Confirm password")}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <input
              type="tel"
              className="account-input"
              value={mobileNumber}
              placeholder={t("Mobile number (e.g. +33 6 12 34 56 78)")}
              onChange={(e) => setMobileNumber(e.target.value)}
              autoComplete="tel"
            />

            {signInError && <p className="account-error">{signInError}</p>}

            <button type="submit" className="btn btn--danger" disabled={signInSubmitting}>
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
      </div>
    </div>
  );
}
