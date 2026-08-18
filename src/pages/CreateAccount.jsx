import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import apiClient, { saveGeneratedProtocol, DRAFT_TOKEN_KEY } from "../api/client.js";
import LanguageToggle from "../components/LanguageToggle.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import "./Onboarding.css";

/**
 * Last step before Subscription - sets a real password for the draft
 * session started back at IdentityGate, then persists everything that's
 * been held client-side since: the onboarding answers
 * (PUT /athletes/profile) and the already-generated protocol
 * (POST /protocol/save-generated, no second Claude call). Both are read
 * from sessionStorage's "protocolHandoff", set once by OnboardingFlow's
 * submitOnboarding and never cleared since - the same key Protocol.jsx
 * reads on mount/refresh.
 *
 * Natural spot for a later TOTP enrollment step, once scheduled.
 */
export default function CreateAccount() {
  const { user, loading: authLoading, completeRegistration } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Runs the "already handled" checks exactly once, the first time we know
  // the real answer (not on every `user` change) - completeRegistration
  // below sets `user` too, and re-running this on that transition would
  // yank the page away to /subscription mid-submit, before the profile and
  // protocol saves that follow it get a chance to run.
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      navigate(`/subscription${location.search}`, { replace: true });
      return;
    }
    if (!sessionStorage.getItem(DRAFT_TOKEN_KEY)) {
      navigate("/onboarding", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      if (password.length < 8) {
        setError(t("Password must be at least 8 characters long."));
        return;
      }
      if (password !== confirmPassword) {
        setError(t("Passwords do not match."));
        return;
      }
    }

    setSubmitting(true);
    try {
      // A real session already exists if this is a retry after registration
      // succeeded but a save below it failed - the draft token is gone by
      // then, so skip straight to retrying the saves with the real one.
      if (!user) {
        await completeRegistration(password);
      }

      const stored = sessionStorage.getItem("protocolHandoff");
      const handoff = stored ? JSON.parse(stored) : null;

      if (handoff?.userData) {
        await apiClient.put("/athletes/profile", handoff.userData);
      }
      if (handoff?.onboardingResult) {
        await saveGeneratedProtocol(handoff.onboardingResult);
      }

      navigate(`/subscription${location.search}`);
    } catch (err) {
      setError(
        err.response?.data?.message || t("Something went wrong. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="ob-page" />;
  }

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
          <h1 className="ob-title">{t("One last step")}</h1>
          <p className="ob-helper-text">
            {t(
              "Set a password to save your protocol and weekly box, and move on to your plan."
            )}
          </p>

          <div className="ob-fields">
            <div className="ob-field">
              <label className="ob-label" htmlFor="create-account-password">
                {t("Password")}
              </label>
              <input
                id="create-account-password"
                className="ob-input"
                type="password"
                value={password}
                placeholder={t("Enter a password")}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="ob-field">
              <label className="ob-label" htmlFor="create-account-confirm">
                {t("Confirm password")}
              </label>
              <input
                id="create-account-confirm"
                className="ob-input"
                type="password"
                value={confirmPassword}
                placeholder={t("Re-enter your password")}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </div>

          {error && <p className="ob-error">{error}</p>}
        </div>

        <div className="ob-footer">
          <button
            type="submit"
            className="ob-continue"
            disabled={submitting || !password || !confirmPassword}
          >
            {submitting ? t("Saving...") : t("Create account & continue")}
          </button>
        </div>
      </form>

      <CopyrightFooter />
    </div>
  );
}
