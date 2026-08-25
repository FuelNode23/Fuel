import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AccountBar from "../components/AccountBar.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import { Icon } from "../components/Icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { getSubscription } from "../api/client.js";
import "../Protocol/ProtocolComponents.css";
import "./AthleteDashboard.css";

// Mirrors PaymentStatus (backend entity) - only ACTIVE/PAST_DUE/CANCELED
// need a friendly label here, PENDING/NONE both already read as "Pending"
// via the fallback below.
const PAYMENT_STATUS_LABELS = {
  ACTIVE: "Active",
  PAST_DUE: "Payment failed",
  CANCELED: "Canceled",
};

// Matches the plan keys Subscriptions.jsx writes to sessionStorage —
// duplicated here (not imported) to keep this dummy page independent of
// the live plan catalog once that becomes a real endpoint.
const PLAN_LABELS = {
  free: "Free — protocol only",
  amateur: "Amateur — 8 products weekly",
  performance: "Performance — 10 products weekly",
  elite: "Elite — 17 products / 2 weeks",
};

// Same variant-key -> label mapping as Subscriptions.jsx (see its comment).
const CATEGORY_LABELS = {
  international: "International",
  value: "Best value",
  french: "French brands",
};

// Static preview pool — pulled from an actual weekly_box_contents sample
// response, not fabricated. No box/subscription is active yet, so this is
// a preview only, not this athlete's real box.
const PREVIEW_BOX_PRODUCTS = [
  ["High Sodium Hydration", "Gel 100", "Malto Antioxydant"],
  ["Nrgy Unit Drink 45", "Plant Recovery Drink", "Ultra Energy Bar"],
  ["Gel 160", "Nrgy Unit Gel"],
];

// No routing/mapping backend exists yet — static placeholder suggestions.
const BEST_ROUTES = [
  { name: "The Green Diagonal of Paris", distance: "8 KM" },
  { name: "The Royal Loop of Parc de Sceaux", distance: "8 KM" },
  { name: "The Buttes-Chaumont Circuit", distance: "8 KM" },
  { name: "The Green Lung of the Bois", distance: "10 KM" },
];

const EVERY_PLAN_TOGGLES = [
  "Push notifications",
  "Email notifications",
  "Pre-cutoff inactivity reminders",
  "Post-delivery feedback prompts",
  "1-hour post-race feedback prompts",
];

function NotificationToggle({ label, t }) {
  const [on, setOn] = useState(true);
  return (
    <div className="hub-toggle-row">
      <span>{t(label)}</span>
      <button
        type="button"
        className={`hub-toggle ${on ? "hub-toggle--on" : "hub-toggle--off"}`}
        onClick={() => setOn((prev) => !prev)}
      >
        {on ? t("Yes") : t("No")}
      </button>
    </div>
  );
}

/**
 * Dummy status page — there's no real authenticated athlete-hub endpoint
 * wired up yet (see Account.jsx's handleContinue), so every field below is
 * either a static placeholder or read from sessionStorage breadcrumbs left
 * by Subscriptions.jsx / Account.jsx. Swap for a real GET /athlete/hub
 * (or similar) once that endpoint exists.
 */
export default function AthleteDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user, updateContactDetails } = useAuth();

  // Stripe Checkout's success_url/cancel_url land back here with this param
  // (see StripeCheckoutService) - cleared from the URL once read so it
  // doesn't linger through a later refresh/share of this link. Payment
  // confirmation itself is webhook-driven, not this redirect, so "success"
  // here means "Stripe accepted the card", not "our paymentStatus is
  // ACTIVE yet" - the fetch below picks that up once the webhook lands.
  const checkoutResult = searchParams.get("checkout");
  useEffect(() => {
    if (!checkoutResult) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("checkout");
        return next;
      },
      { replace: true }
    );
  }, [checkoutResult, setSearchParams]);

  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "saved" | "error"
  const [saveError, setSaveError] = useState("");

  // `user` starts null and only populates once AuthProvider's own effect
  // reads localStorage - useState's initial value above only ever runs on
  // the very first render, so a direct page load/refresh here would
  // otherwise leave phoneNumber stuck empty even once `user` catches up.
  useEffect(() => {
    setPhoneNumber(user?.phoneNumber || "");
  }, [user]);

  const handleSaveContactDetails = async () => {
    setSaveStatus("saving");
    setSaveError("");
    try {
      await updateContactDetails({ phoneNumber });
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err.response?.data?.message || t("Could not save your details."));
    }
  };

  // Starts from this session's own sessionStorage breadcrumb (set the
  // moment a plan is picked, before any network round trip) so the choice
  // shows immediately; the fetch below then overwrites it with the real
  // saved subscription, which is what makes it survive a refresh, a new
  // device, or a cleared session - not just this one tab.
  const [selectedPlan, setSelectedPlan] = useState(sessionStorage.getItem("selectedPlan"));
  const [selectedBoxVariant, setSelectedBoxVariant] = useState(
    sessionStorage.getItem("selectedBoxVariant")
  );
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getSubscription()
      .then((data) => {
        if (cancelled) return;
        setSelectedPlan(data.plan);
        setSelectedBoxVariant(data.boxVariant);
        setPaymentStatus(data.paymentStatus);
      })
      .catch(() => {
        // No saved subscription yet (404) or the request failed - keep
        // whatever sessionStorage already had.
      });
    return () => {
      cancelled = true;
    };
  }, [checkoutResult]);

  const planLabel = selectedPlan ? t(PLAN_LABELS[selectedPlan] || selectedPlan) : t("No active plan");
  const paymentStatusLabel = paymentStatus
    ? t(PAYMENT_STATUS_LABELS[paymentStatus] || "Pending")
    : t("Pending");
  // Only a real, confirmed-paid subscription (see PaymentStatus.java) -
  // NONE covers both "free plan" and "paid plan, checkout abandoned",
  // both of which still have real payment left to complete.
  const isActiveSubscriber = paymentStatus === "ACTIVE";

  return (
    <div className="athlete-dashboard">
      <AccountBar />
      <div className="athlete-dashboard__container">
        <button type="button" className="back-link" onClick={() => navigate("/account")}>
          <Icon.ArrowLeft width={16} height={16} />
          {t("Back")}
        </button>

        <div className="badge badge--active" style={{ marginTop: 8 }}>
          <Icon.Shield width={12} height={12} style={{ marginRight: 4 }} />
          {t("Account")}
        </div>

        <div className="athlete-dashboard__header-row">
          <div className="athlete-dashboard__header-text">
            <h1 className="page-title" style={{ marginTop: 12 }}>
              {t("{name}, your athlete hub", { name: user?.fullName || t("Athlete") })}
            </h1>
            <p className="page-subtitle">
              {t(
                "Your onboarding data now lives here as a working athlete profile. Update it anytime to steer your protocol, your event logic, and your next box."
              )}
            </p>
          </div>
          <button
            type="button"
            className="btn btn--primary athlete-dashboard__update-btn"
            onClick={() => navigate("/onboarding")}
          >
            <Icon.RefreshCw width={14} height={14} />
            {t("Update my protocol")}
          </button>
        </div>

        {/* "success" no longer lands here directly - Stripe's successUrl now
            goes to /order-confirmed first (see StripeCheckoutService), which
            owns that moment with a real order summary instead of this small
            banner. checkoutResult/its effects stay in place regardless,
            since "cancel" still redirects straight back to this page. */}
        {checkoutResult === "cancel" && (
          <div className="hub-card__note" style={{ marginTop: "1rem" }}>
            {t("Checkout was canceled - your plan selection is saved, no payment was made.")}
          </div>
        )}

        <div className="hub-grid">
          {/* Row 1 */}
          <div className="card hub-card hub-card--third">
            <div className="hub-card__eyebrow">
              <Icon.User width={13} height={13} />
              {t("Athlete hub")}
            </div>
            <h3 className="hub-card__title">{user?.fullName || t("Athlete")}</h3>
            <p className="hub-card__text">
              {t(
                "Your profile is live. Keep it up to date here, review your protocol, and activate a recurring box whenever you want Fuelnode to turn this profile into weekly execution."
              )}
            </p>
            <div className="hub-card__stats">
              <div className="hub-card__stat">
                <span className="hub-card__stat-label">{t("Plan")}</span>
                <span className="hub-card__stat-value">{planLabel}</span>
              </div>
              <div className="hub-card__stat">
                <span className="hub-card__stat-label">{t("Status")}</span>
                <span className="hub-card__stat-value">{paymentStatusLabel}</span>
              </div>
              <div className="hub-card__stat">
                <span className="hub-card__stat-label">{t("Profile updated")}</span>
                <span className="hub-card__stat-value">{t("Updated today")}</span>
              </div>
            </div>
            <button type="button" className="btn btn--primary" onClick={() => navigate("/protocol")}>
              {t("Go to dashboard")}
            </button>
          </div>

          <div className="card hub-card hub-card--third">
            <div className="hub-card__eyebrow">
              <Icon.CalendarCheck width={13} height={13} />
              {t("Race calendar")}
            </div>
            <h3 className="hub-card__title">{t("No race saved yet")}</h3>
            <p className="hub-card__text">
              {t(
                "Add a race to unlock event-specific logic, race assortments, and the dedicated event protocol flow."
              )}
            </p>
            <button type="button" className="btn btn--ghost">
              {t("Add a race")}
            </button>
          </div>

          <div className="card hub-card hub-card--third">
            <div className="hub-card__eyebrow">
              <Icon.MapPin width={13} height={13} />
              {t("Best routes for you")}
            </div>
            <p className="hub-card__text">
              {t("Routes picked from your sport, your distances, and your race goals.")}
            </p>
            <ul className="hub-route-list">
              {BEST_ROUTES.map((route) => (
                <li key={route.name}>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {route.name}
                  </span>
                  <span className="pill">{route.distance}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Row 2 */}
          <div className="card hub-card hub-card--half">
            <div className="hub-card__eyebrow">
              <Icon.ShoppingBag width={13} height={13} />
              {t("Current subscription")}
            </div>
            <h3 className="hub-card__title">{planLabel}</h3>
            <p className="hub-card__text">
              {isActiveSubscriber
                ? t("You're subscribed - your weekly box is active.")
                : t("Your selected plan is saved. Continue to payment when you're ready.")}
            </p>
            <div className="hub-card__stats">
              <div className="hub-card__stat">
                <span className="hub-card__stat-label">{t("Plan")}</span>
                <span className="hub-card__stat-value">{planLabel}</span>
              </div>
              <div className="hub-card__stat">
                <span className="hub-card__stat-label">{t("Status")}</span>
                <span className="hub-card__stat-value">{paymentStatusLabel}</span>
              </div>
              <div className="hub-card__stat">
                <span className="hub-card__stat-label">{t("Profile updated")}</span>
                <span className="hub-card__stat-value">{t("Updated today")}</span>
              </div>
            </div>
            {/* Already paid - never re-invite back into checkout/plan
                selection (see Login.jsx's completeLogin, which already
                routes an active subscriber here instead of onboarding/
                payment; this card must not undo that once they arrive). */}
            {isActiveSubscriber ? (
              <p className="hub-card__note">{t("Subscribed ✓ - manage your box from here anytime.")}</p>
            ) : (
              <>
                <p className="hub-card__note">{t("Complete your subscription to unlock your weekly box.")}</p>
                <div className="hub-card__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => {
                      const params = new URLSearchParams({ plan: selectedPlan });
                      if (selectedBoxVariant) params.set("category", selectedBoxVariant);
                      navigate(`/checkout-summary?${params.toString()}`);
                    }}
                  >
                    {t("Continue with subscription")}
                  </button>
                  <span className="hub-card__warning">
                    {t("Please complete both email and phone before continuing.")}
                  </span>
                </div>
                <button type="button" className="btn btn--ghost" onClick={() => navigate("/subscription")}>
                  {t("Choose a plan")}
                </button>
              </>
            )}
          </div>

          <div className="card hub-card hub-card--half">
            <div className="hub-card__eyebrow">
              <Icon.Package width={13} height={13} />
              {t("Preview box")}
            </div>
            <h3 className="hub-card__title">{t("What your box could look like")}</h3>
            <p className="hub-card__text">
              {t(
                "Even without an active subscription, your profile can preview the kind of products Fuelnode would bias toward right now."
              )}
              {selectedBoxVariant && ` (${t(CATEGORY_LABELS[selectedBoxVariant] || selectedBoxVariant)})`}
            </p>
            <div className="hub-chip-rows">
              {PREVIEW_BOX_PRODUCTS.map((row, i) => (
                <div className="hub-chip-row" key={i}>
                  {row.map((name) => (
                    <span className="pill" key={name}>
                      {name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Row 3 */}
          <div className="card hub-card hub-card--half">
            <div className="hub-card__eyebrow">
              <Icon.Truck width={13} height={13} />
              {t("Delivery & pickup preferences")}
            </div>
            <h3 className="hub-card__title">{t("Delivery Preferences")}</h3>
            <p className="hub-card__note">{t("Choose where to collect your Fuelnode box.")}</p>
            <button type="button" className="btn btn--ghost">
              {t("Manage preferences")}
            </button>
          </div>

          <div className="card hub-card hub-card--half">
            <div className="hub-card__eyebrow">
              <Icon.MessageSquare width={13} height={13} />
              {t("Post-delivery feedback")}
            </div>
            <h3 className="hub-card__title">{t("Rate your products")}</h3>
            <p className="hub-card__text">
              {t("Tell us what worked for training, taste, and digestion.")}
            </p>
            <button type="button" className="btn btn--ghost">
              {t("Open feedback form")}
            </button>
          </div>

          {/* Row 4 */}
          <div className="card hub-card hub-card--half">
            <div className="hub-card__eyebrow">
              <Icon.Mail width={13} height={13} />
              {t("Customer details")}
            </div>
            <h3 className="hub-card__title">{t("Contact details")}</h3>
            <div className="hub-field-grid">
              <div className="hub-field">
                <span className="hub-field-label">{t("Email")}</span>
                <input
                  type="email"
                  className="account-input"
                  value={user?.email || ""}
                  disabled
                />
              </div>
              <div className="hub-field">
                <span className="hub-field-label">{t("Phone")}</span>
                <input
                  type="tel"
                  className="account-input"
                  value={phoneNumber}
                  placeholder={t("+33 6 12 34 56 78")}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setSaveStatus("idle");
                  }}
                />
              </div>
              <div className="hub-field">
                <span className="hub-field-label">{t("Smart locker")}</span>
                <span className="hub-field-static">{t("Zone to confirm · smart locker pickup Friday")}</span>
              </div>
              <div className="hub-field">
                <span className="hub-field-label">{t("Next billing date")}</span>
                <span className="hub-field-static">{t("No due date")}</span>
              </div>
            </div>
            {saveStatus === "error" && <p className="account-error">{saveError}</p>}
            <button
              type="button"
              className="btn btn--primary"
              disabled={saveStatus === "saving"}
              onClick={handleSaveContactDetails}
            >
              {saveStatus === "saving"
                ? t("Saving...")
                : saveStatus === "saved"
                  ? t("Saved ✓")
                  : t("Save my contact details")}
            </button>
          </div>

          <div className="card hub-card hub-card--half">
            <div className="hub-card__eyebrow">
              <Icon.Bell width={13} height={13} />
              {t("Notifications")}
            </div>
            <h3 className="hub-card__title">{t("High-signal reminders only")}</h3>
            <div className="hub-toggle-list">
              {EVERY_PLAN_TOGGLES.map((label) => (
                <NotificationToggle key={label} label={label} t={t} />
              ))}
            </div>
          </div>

          {/* Row 6 */}
          <div className="card hub-card hub-card--half">
            <div className="hub-card__eyebrow">
              <Icon.CalendarCheck width={13} height={13} />
              {t("Race calendar")}
            </div>
            <h3 className="hub-card__title">{t("Upcoming races")}</h3>
            <p className="hub-card__note">
              {t(
                "Add a race to unlock event-specific logic, race assortments, and the dedicated event protocol flow."
              )}
            </p>
            <div className="hub-card__note hub-card__note--highlight">
              <strong>{t("What's your next race? Add it to lock your protocol onto it.")}</strong>
              <div style={{ marginTop: 8 }}>
                <button type="button" className="btn btn--ghost">
                  + {t("Add your next race →")}
                </button>
              </div>
            </div>
          </div>

          <div className="card hub-card hub-card--half">
            <div className="hub-card__eyebrow">
              <Icon.Pause width={13} height={13} />
              {t("Pause subscription")}
            </div>
            <h3 className="hub-card__title">{t("Pause subscription")}</h3>
            <p className="hub-card__text">
              {t(
                "Manage subscription continuity here. Pause requests are recorded operationally and sent to the team."
              )}
            </p>
            <p className="hub-card__text">
              {t("For the next box, the modification window closes Thursday at noon.")}
            </p>
            <button type="button" className="btn btn--ghost">
              {t("Request a pause")}
            </button>
          </div>
        </div>

        <div className="athlete-dashboard__legal">
          <span>{t("Terms of use")}</span>
          <span>{t("Privacy policy")}</span>
          <span>{t("Health disclaimer")}</span>
        </div>

        <CopyrightFooter />
      </div>
    </div>
  );
}
