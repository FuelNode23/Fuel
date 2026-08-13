import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icons.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./Account.css";

/**
 * Sign-in gate reached after picking a subscription plan. There's no
 * magic-link/SMS/OAuth backend in src/api/client.js (that's email+password
 * via AuthContext, see Login.jsx) — every action here is a dummy status
 * that just simulates success and continues to the athlete dashboard, per
 * the requested Subscription -> Account -> Athlete dashboard sequence.
 * Swap handleContinue for a real magic-link/OAuth call once one exists.
 */
export default function Account() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const category = searchParams.get("category");

  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleContinue = () => {
    sessionStorage.setItem("dummyAuthenticated", "true");
    if (plan) sessionStorage.setItem("selectedPlan", plan);
    if (category) sessionStorage.setItem("selectedBoxVariant", category);
    navigate("/athlete-dashboard");
  };

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
            aria-selected={method === "sms"}
            className={`account-tab${method === "sms" ? " account-tab--active" : ""}`}
            onClick={() => setMethod("sms")}
          >
            <Icon.Phone width={14} height={14} />
            {t("SMS")}
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
          </>
        ) : (
          <>
            <p className="account-field-label">{t("Magic link by SMS")}</p>
            <p className="account-field-hint">
              {t("Receive a secure link by text message.")}
            </p>
            <input type="tel" className="account-input" placeholder={t("+33 6 12 34 56 78")} />
          </>
        )}

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
          {t("I accept the")} <strong>{t("Terms of use")}</strong> {t("and")} <strong>{t("Privacy policy")}</strong>.
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
      </div>
    </div>
  );
}
