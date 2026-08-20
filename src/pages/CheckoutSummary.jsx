import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AccountBar from "../components/AccountBar.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { getSubscriptionPricing, createCheckoutSession } from "../api/client.js";
import "../Protocol/ProtocolComponents.css";
import "./Weeklybox.css";
import "./Subscriptions.css";
import "./CheckoutSummary.css";

// Static plan display info - deliberately not importing Subscriptions.jsx's
// full PLANS array (features/descriptions aren't relevant to a summary),
// same "each page keeps its own small copy" convention that page already
// uses for CATEGORY_LABELS.
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

/**
 * Reached from Subscriptions.jsx after picking a paid plan - a real order
 * review before Stripe Checkout, not just a redirect straight to payment.
 * Saves the address/phone here (via AuthContext.updateContactDetails, the
 * same PUT the athlete-hub Contact details card uses) *before* creating
 * the Checkout Session, so StripeCheckoutService already has a real
 * address for the Stripe Customer by the time it runs - see that
 * service's resolveStripeCustomerId.
 */
export default function CheckoutSummary() {
  const navigate = useNavigate();
  const { user, updateContactDetails } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const plan = searchParams.get("plan");
  const category = searchParams.get("category");
  const planInfo = PLAN_INFO[plan];

  const [pricing, setPricing] = useState(null);
  const [addressLine1, setAddressLine1] = useState(user?.addressLine1 || "");
  const [addressLine2, setAddressLine2] = useState(user?.addressLine2 || "");
  const [city, setCity] = useState(user?.city || "");
  const [postalCode, setPostalCode] = useState(user?.postalCode || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // `user` starts null until AuthProvider's own effect populates it from
  // localStorage - useState's initializer above only runs on first render,
  // so a direct page load/refresh here would otherwise leave every field
  // stuck empty even once `user` catches up (same gotcha AthleteDashboard's
  // phone field has).
  useEffect(() => {
    setAddressLine1(user?.addressLine1 || "");
    setAddressLine2(user?.addressLine2 || "");
    setCity(user?.city || "");
    setPostalCode(user?.postalCode || "");
    setPhoneNumber(user?.phoneNumber || "");
  }, [user]);

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

  const amount = planInfo ? pricing?.[plan] : null;
  const priceLabel = amount != null ? `€${amount.toFixed(2)}` : "…";

  const isValid = Boolean(
    addressLine1.trim() && city.trim() && postalCode.trim() && phoneNumber.trim()
  );

  const handleContinueToPayment = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      await updateContactDetails({
        phoneNumber: phoneNumber.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
      });
      const { url } = await createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      setError(
        err.response?.data?.message || t("Could not start checkout. Please try again.")
      );
      setSubmitting(false);
    }
  };

  // Reached directly with no/unrecognized plan (e.g. a stale bookmark) -
  // nothing to summarize, so send back to plan selection instead of
  // showing a broken page.
  if (!planInfo) {
    navigate("/subscription", { replace: true });
    return null;
  }

  return (
    <div className="subscriptions-page">
      <AccountBar />
      <div className="subscriptions-page__container">
        <button type="button" className="back-link" onClick={() => navigate("/subscription")}>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <path
              d="M12 4l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("Back to plans")}
        </button>

        <div className="eyebrow">
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <path
              d="M10 2l1.8 4.6L16.5 8l-4.7 1.4L10 14l-1.8-4.6L3.5 8l4.7-1.4z"
              fill="currentColor"
            />
          </svg>
          {t("Review your order")}
        </div>

        <h1 className="page-title">{t("Confirm delivery details")}</h1>
        <p className="page-subtitle">
          {t("Tell us where to send your box and how to reach you, then continue to payment.")}
        </p>

        <div className="checkout-summary__layout">
          <form className="card checkout-summary__form" onSubmit={handleContinueToPayment}>
            <h2 className="checkout-summary__section-title">{t("Delivery address")}</h2>

            <label className="checkout-summary__field">
              {t("Address")}
              <input
                type="text"
                value={addressLine1}
                placeholder={t("Street and number")}
                onChange={(e) => setAddressLine1(e.target.value)}
                autoComplete="address-line1"
                required
              />
            </label>

            <label className="checkout-summary__field">
              {t("Address line 2")} <span className="checkout-summary__optional">({t("optional")})</span>
              <input
                type="text"
                value={addressLine2}
                placeholder={t("Apartment, suite, etc.")}
                onChange={(e) => setAddressLine2(e.target.value)}
                autoComplete="address-line2"
              />
            </label>

            <div className="checkout-summary__row">
              <label className="checkout-summary__field">
                {t("City")}
                <input
                  type="text"
                  value={city}
                  placeholder={t("Paris")}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                  required
                />
              </label>
              <label className="checkout-summary__field">
                {t("Postal code")}
                <input
                  type="text"
                  value={postalCode}
                  placeholder={t("75001")}
                  onChange={(e) => setPostalCode(e.target.value)}
                  autoComplete="postal-code"
                  required
                />
              </label>
            </div>

            <p className="checkout-summary__country">{t("France")}</p>

            <h2 className="checkout-summary__section-title">{t("Contact number")}</h2>
            <label className="checkout-summary__field">
              {t("Mobile number")}
              <input
                type="tel"
                value={phoneNumber}
                placeholder={t("+33 6 12 34 56 78")}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
                required
              />
            </label>

            {error && (
              <div className="subscriptions-page__hint-banner subscriptions-page__hint-banner--error">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn--primary" disabled={!isValid || submitting}>
              {submitting ? t("Redirecting to payment...") : t("Continue to payment")}
            </button>
          </form>

          <aside className="card checkout-summary__summary">
            <h2 className="checkout-summary__section-title">{t("Order summary")}</h2>
            <div className="checkout-summary__summary-row">
              <span>{t("{plan} Plan", { plan: t(planInfo.name) })}</span>
              <span className="checkout-summary__summary-price">{priceLabel}</span>
            </div>
            <div className="checkout-summary__summary-row checkout-summary__summary-row--muted">
              <span>{t("Billed")}</span>
              <span>{t(planInfo.cadence)}</span>
            </div>
            {category && (
              <div className="checkout-summary__summary-row checkout-summary__summary-row--muted">
                <span>{t("Box")}</span>
                <span>{t(CATEGORY_LABELS[category] || category)}</span>
              </div>
            )}
            <p className="checkout-summary__summary-note">
              {t("You'll enter payment details on the next, secure page.")}
            </p>
          </aside>
        </div>

        <CopyrightFooter />
      </div>
    </div>
  );
}
