import { useEffect, useRef, useState } from "react";
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

// France's official, free, no-key-required address search (Base Adresse
// Nationale). citycode is Paris's INSEE commune code - it covers all 20
// arrondissements and restricts every suggestion to real Paris addresses
// at the source, matching the business's Paris-only delivery area, rather
// than showing all-of-France results and rejecting them after the fact.
const PARIS_CITYCODE = "75056";
const PARIS_POSTAL_CODE = /^750(0[1-9]|1[0-9]|20)$/;

// La Poste's own open data (data-fair platform) - free, no API key, no
// account, same open-data spirit as the BAN address API above. Filters to
// real "Relais poste" pickup points (not full post offices) within Paris's
// postal-code range; adresse/libelle_du_site are stored upper-case at the
// source, matched as-is rather than transformed, since this is a real
// address a courier needs to read correctly.
const LAPOSTE_LOCKERS_URL = "https://data.laposte.fr/data-fair/api/v1/datasets/laposte-poincont2/lines";
const LAPOSTE_BASE_FILTER = 'caracteristique_du_site:"Relais poste" AND code_postal:[75000 TO 75021]';

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
  const [deliveryMethod, setDeliveryMethod] = useState("home"); // "home" | "locker"
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [lockerQuery, setLockerQuery] = useState("");
  const [lockerResults, setLockerResults] = useState([]);
  const [lockerLoading, setLockerLoading] = useState(false);
  const [addressLine1, setAddressLine1] = useState(user?.addressLine1 || "");
  const [addressLine2, setAddressLine2] = useState(user?.addressLine2 || "");
  const [city, setCity] = useState(user?.city || "");
  const [postalCode, setPostalCode] = useState(user?.postalCode || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const addressBoxRef = useRef(null);

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

  // Live address search against the BAN API, restricted to Paris, debounced
  // so it doesn't fire on every keystroke. Only relevant for the
  // home-delivery path - locker pickup has no free-text address to search.
  useEffect(() => {
    if (deliveryMethod !== "home" || !showSuggestions || addressLine1.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }
    let cancelled = false;
    setAddressLoading(true);
    const timer = setTimeout(() => {
      fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(addressLine1)}&citycode=${PARIS_CITYCODE}&limit=5`
      )
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setAddressSuggestions(data.features || []);
        })
        .catch(() => {
          if (!cancelled) setAddressSuggestions([]);
        })
        .finally(() => {
          if (!cancelled) setAddressLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressLine1, deliveryMethod, showSuggestions]);

  // Closes the suggestions dropdown on an outside click - standard
  // combobox behavior, separate from the search effect above.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addressBoxRef.current && !addressBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (feature) => {
    const props = feature.properties;
    setAddressLine1(props.name || props.label);
    setCity(props.city || "Paris");
    setPostalCode(props.postcode || "");
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Live locker search against La Poste's open data, debounced the same way
  // as the address search above. Runs with an empty query too, so switching
  // to "locker" shows a real default set immediately rather than an empty
  // list waiting for input.
  useEffect(() => {
    if (deliveryMethod !== "locker") return;
    let cancelled = false;
    setLockerLoading(true);
    const timer = setTimeout(() => {
      // A single wildcard spanning the whole typed phrase (e.g. "*PARIS SAINT*")
      // is invalid Lucene syntax once it contains a space - the API rejects the
      // whole query ("all shards failed"), which read as "no results" rather
      // than a visible error. Each word instead gets its own wildcard clause,
      // required to match somewhere across either text field (site name or
      // street address), so word order/field placement doesn't matter -
      // "paris saint" finds a site named "PARIS SAINT CHARLES..." even though
      // neither word alone lives in the address field for that record.
      const words = lockerQuery
        .trim()
        .toUpperCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.replace(/[^A-Z0-9ÀÂÉÈÊËÎÏÔÙÛÜÇ-]/g, ""))
        .filter(Boolean);
      const qs = words.length
        ? `${LAPOSTE_BASE_FILTER} AND ${words
            .map((word) => `(adresse:*${word}* OR libelle_du_site:*${word}*)`)
            .join(" AND ")}`
        : LAPOSTE_BASE_FILTER;
      const params = new URLSearchParams({ qs, size: "12" });
      fetch(`${LAPOSTE_LOCKERS_URL}?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setLockerResults(data.results || []);
        })
        .catch(() => {
          if (!cancelled) setLockerResults([]);
        })
        .finally(() => {
          if (!cancelled) setLockerLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [deliveryMethod, lockerQuery]);

  const amount = planInfo ? pricing?.[plan] : null;
  const priceLabel = amount != null ? `€${amount.toFixed(2)}` : "…";

  const isValid = Boolean(
    phoneNumber.trim() &&
      (deliveryMethod === "locker"
        ? selectedLocker
        : addressLine1.trim() && city.trim() && PARIS_POSTAL_CODE.test(postalCode.trim()))
  );

  const handleContinueToPayment = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const deliveryDetails =
        deliveryMethod === "locker"
          ? {
              addressLine1: selectedLocker.adresse,
              addressLine2: t("Locker pickup - {name}", { name: selectedLocker.libelle_du_site }),
              city: "Paris",
              postalCode: selectedLocker.code_postal,
            }
          : {
              addressLine1: addressLine1.trim(),
              addressLine2: addressLine2.trim(),
              city: city.trim(),
              postalCode: postalCode.trim(),
            };

      await updateContactDetails({
        phoneNumber: phoneNumber.trim(),
        ...deliveryDetails,
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
            <h2 className="checkout-summary__section-title">{t("Delivery method")}</h2>
            <p className="checkout-summary__hint">
              {t("FuelNode currently delivers within Paris only.")}
            </p>
            <div className="checkout-summary__method-toggle">
              <button
                type="button"
                className={`checkout-summary__method-btn${
                  deliveryMethod === "home" ? " checkout-summary__method-btn--active" : ""
                }`}
                onClick={() => setDeliveryMethod("home")}
              >
                {t("Deliver to my address")}
              </button>
              <button
                type="button"
                className={`checkout-summary__method-btn${
                  deliveryMethod === "locker" ? " checkout-summary__method-btn--active" : ""
                }`}
                onClick={() => setDeliveryMethod("locker")}
              >
                {t("Pick up at a locker")}
              </button>
            </div>

            {deliveryMethod === "home" ? (
              <>
                <div className="checkout-summary__address-wrap" ref={addressBoxRef}>
                  <label className="checkout-summary__field">
                    {t("Address")}
                    <input
                      type="text"
                      value={addressLine1}
                      placeholder={t("Start typing a Paris address...")}
                      onChange={(e) => {
                        setAddressLine1(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      autoComplete="off"
                      required
                    />
                  </label>
                  {showSuggestions && (addressLoading || addressSuggestions.length > 0) && (
                    <ul className="checkout-summary__suggestions">
                      {addressLoading && (
                        <li className="checkout-summary__suggestions-status">{t("Searching...")}</li>
                      )}
                      {!addressLoading &&
                        addressSuggestions.map((feature) => (
                          <li key={feature.properties.id}>
                            <button type="button" onClick={() => handleSelectSuggestion(feature)}>
                              {feature.properties.label}
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

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
                {postalCode.trim() && !PARIS_POSTAL_CODE.test(postalCode.trim()) && (
                  <p className="checkout-summary__field-error">
                    {t("FuelNode currently delivers within Paris only (75001-75020).")}
                  </p>
                )}

                <p className="checkout-summary__country">{t("France")}</p>
              </>
            ) : (
              <>
                <label className="checkout-summary__field">
                  {t("Search by street or neighborhood")}{" "}
                  <span className="checkout-summary__optional">({t("optional")})</span>
                  <input
                    type="text"
                    value={lockerQuery}
                    placeholder={t("e.g. Picpus, Batignolles...")}
                    onChange={(e) => setLockerQuery(e.target.value)}
                  />
                </label>

                <div className="checkout-summary__lockers">
                  {lockerLoading && (
                    <p className="checkout-summary__suggestions-status">{t("Searching...")}</p>
                  )}
                  {!lockerLoading && lockerResults.length === 0 && (
                    <p className="checkout-summary__suggestions-status">
                      {t("No pickup points found - try a different street name.")}
                    </p>
                  )}
                  {!lockerLoading &&
                    lockerResults.map((locker) => (
                      <label
                        key={locker._id}
                        className={`checkout-summary__locker${
                          selectedLocker?._id === locker._id ? " checkout-summary__locker--active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="locker"
                          value={locker._id}
                          checked={selectedLocker?._id === locker._id}
                          onChange={() => setSelectedLocker(locker)}
                        />
                        <span className="checkout-summary__locker-text">
                          <strong>{locker.libelle_du_site}</strong>
                          <span>
                            {locker.adresse}, {locker.code_postal} Paris
                          </span>
                        </span>
                      </label>
                    ))}
                </div>
                <p className="checkout-summary__hint">
                  {t("Live pickup-point data from La Poste - available Relais Poste locations across Paris.")}
                </p>
              </>
            )}

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
