import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AccountBar from "../components/AccountBar.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { getSubscriptionPricing } from "../api/client.js";
import "../Protocol/ProtocolComponents.css";
import "./Subscriptions.css";
import "./CheckoutSummary.css";
import "./OrderConfirmation.css";

// Same small local copies CheckoutSummary.jsx/Subscriptions.jsx already
// keep of these two lookups - not worth sharing given how small they are.
const PLAN_INFO = {
  amateur: { name: "Amateur", cadence: "Weekly" },
  performance: { name: "Performance", cadence: "Weekly" },
  elite: { name: "Elite", cadence: "Every 2 weeks" },
};

const CATEGORY_LABELS = {
  international: "International",
  value: "Best value",
  french: "French brands",
};

// CheckoutSummary.jsx writes this exact prefix into addressLine2 when the
// athlete picked a locker instead of home delivery (see its
// handleContinueToPayment) - reading it back here is how this page tells
// the two cases apart without needing a real "delivery method" field.
const LOCKER_PREFIX = "Locker pickup - ";

/**
 * Landed on straight from Stripe's hosted page once a card is accepted
 * (see StripeCheckoutService's successUrl, which carries plan/category
 * through as query params). Not itself proof of payment - handleWebhookEvent
 * confirms that, asynchronously, usually within a few seconds - this is
 * just a clear "here's what you just ordered" moment instead of dropping
 * back onto the dashboard with a small banner that's easy to miss.
 */
export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const plan = searchParams.get("plan");
  const category = searchParams.get("category");
  const planInfo = PLAN_INFO[plan];

  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getSubscriptionPricing(category)
      .then((data) => {
        if (!cancelled) setPricing(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [category]);

  const amount = plan ? pricing?.[plan] : null;
  const priceLabel = amount != null ? `€${amount.toFixed(2)}` : "…";

  const addressLine2 = user?.addressLine2 || "";
  const isLockerDelivery = addressLine2.startsWith(LOCKER_PREFIX);
  const lockerName = isLockerDelivery ? addressLine2.slice(LOCKER_PREFIX.length) : null;

  return (
    <div className="subscriptions-page">
      <AccountBar />
      <div className="subscriptions-page__container order-confirmation">
        <div className="order-confirmation__badge">
          <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M7 12.5l3 3 7-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="page-title">{t("Subscription confirmed")}</h1>
        <p className="page-subtitle">{t("Your payment was accepted. Here's what you signed up for.")}</p>

        <div className="order-confirmation__layout">
          <div className="card order-confirmation__summary">
            <h2 className="checkout-summary__section-title">{t("Order summary")}</h2>
            <div className="checkout-summary__summary-row">
              <span>{planInfo ? t("{plan} Plan", { plan: t(planInfo.name) }) : t("Your plan")}</span>
              <span className="checkout-summary__summary-price">{priceLabel}</span>
            </div>
            {planInfo && (
              <div className="checkout-summary__summary-row checkout-summary__summary-row--muted">
                <span>{t("Billed")}</span>
                <span>{t(planInfo.cadence)}</span>
              </div>
            )}
            {category && (
              <div className="checkout-summary__summary-row checkout-summary__summary-row--muted">
                <span>{t("Box")}</span>
                <span>{t(CATEGORY_LABELS[category] || category)}</span>
              </div>
            )}
          </div>

          <div className="card order-confirmation__summary">
            <h2 className="checkout-summary__section-title">
              {isLockerDelivery ? t("Pickup point") : t("Delivery address")}
            </h2>
            {isLockerDelivery ? (
              <>
                <p className="order-confirmation__address-name">{lockerName}</p>
                <p className="order-confirmation__address-text">
                  {user?.addressLine1}, {user?.postalCode} {user?.city}
                </p>
              </>
            ) : (
              <p className="order-confirmation__address-text">
                {user?.addressLine1}
                {addressLine2 ? `, ${addressLine2}` : ""}
                <br />
                {user?.postalCode} {user?.city}, {t("France")}
              </p>
            )}
            {user?.phoneNumber && (
              <p className="checkout-summary__hint">{t("Mobile: {phone}", { phone: user.phoneNumber })}</p>
            )}
          </div>
        </div>

        <p className="order-confirmation__note">
          {t("It can take a few seconds for your subscription status to update on your dashboard.")}
        </p>

        <button type="button" className="btn btn--primary" onClick={() => navigate("/athlete-dashboard")}>
          {t("Go to my dashboard")}
        </button>

        <CopyrightFooter />
      </div>
    </div>
  );
}
