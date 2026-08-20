import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AccountBar from "../components/AccountBar.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { saveSubscription, getSubscriptionPricing } from "../api/client.js";
import "./Subscriptions.css";

/**
 * Tier names/features/box sizes are still static placeholder content -
 * there is no plans-catalog endpoint. Prices are NOT: PLANS.price below is
 * only the fallback shown before GET /subscription/pricing resolves (or if
 * it 404s because the athlete has no generated protocol yet). Once it
 * resolves, the real per-tier total - computed server-side from the
 * athlete's actual box plus real catalog products - overrides it. See
 * dynamicPrice() below and UserSubscriptionService.computePricing().
 */
const PLANS = [
  {
    key: "free",
    name: "Free",
    description: "Keep Fuelnode protocol access without any physical box delivery.",
    tierStat: "Protocol only",
    price: "€0",
    priceSuffix: "",
    cadence: "No delivery",
    boxCount: "0 products",
    note: "Protocol only.",
    includedLabel: "No physical box",
    features: ["Protocol only", "Protocol refresh every 24 hours", "No box delivery"],
    cta: "Continue with Free",
    ctaStyle: "ghost",
  },
  {
    key: "amateur",
    name: "Amateur",
    badge: "Base protocol box",
    description: "Core 8-product protocol base box.",
    tierStat: "8-product base",
    price: "€24.90 / week",
    priceSuffix: " / week",
    cadence: "Weekly",
    boxCount: "8 products",
    note: "Core 8-product protocol base box.",
    includedLabel: "Everything in Free, plus:",
    features: ["Unlimited protocol access*", "Core 8-product protocol base box", "Weekly delivery"],
    cta: "Choose Amateur",
    ctaStyle: "primary",
  },
  {
    key: "performance",
    name: "Performance",
    badge: "Most popular",
    description: "Same 8-product Amateur base box + 2 support products.",
    tierStat: "8 + 2 support",
    price: "€34.90 / week",
    priceSuffix: " / week",
    cadence: "Weekly",
    boxCount: "10 products",
    note: "Same 8-product Amateur base box + 2 support products.",
    includedLabel: "Everything in Amateur, plus:",
    features: ["The 8-product Amateur base box", "2 support products", "Unlimited protocol access*"],
    cta: "Choose Performance",
    ctaStyle: "primary",
  },
  {
    key: "elite",
    name: "Elite",
    badge: "Premium choice",
    description: "Same 8-product Amateur base box + 9 premium products as a 14-day fueling block.",
    tierStat: "8 + 9 premium",
    price: "€64.90 / 2 weeks",
    priceSuffix: " / 2 weeks",
    cadence: "Every 2 weeks",
    boxCount: "17 products",
    note: "Same 8-product Amateur base box + 9 premium products as a 14-day fueling block.",
    includedLabel: "Everything in Performance, plus:",
    features: ["The 8-product Amateur base box", "9 extra premium products", "Unlimited protocol access*"],
    cta: "Choose Elite",
    ctaStyle: "primary",
  },
];

/** Formats a real per-tier total the same way the static fallback reads
 *  ("€24.90 / week"), or returns the static plan.price if pricing hasn't
 *  loaded (still fetching, or the athlete has no generated box yet). */
function dynamicPrice(plan, pricing) {
  const amount = pricing?.[plan.key];
  if (amount == null) return plan.price;
  return `€${amount.toFixed(2)}${plan.priceSuffix}`;
}

// Maps the lowercase variant keys WeeklyBox.jsx stores (see
// src/utils/boxVariants.js) to their proper display labels, so they go
// through t() as real dictionary entries instead of raw English keys.
const CATEGORY_LABELS = {
  international: "International",
  value: "Best value",
  french: "French brands",
};

const EVERY_PLAN_INCLUDES = [
  "AI protocol access",
  "Personalised nutritional content",
  "Newsletters",
  "Race recommendations",
];

export default function Subscriptions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const from = searchParams.get("from");
  const tierHint = searchParams.get("tierHint");
  const category = searchParams.get("category");
  const cameFromWeeklyBox = from === "weekly-box";

  // Real per-tier prices, once loaded - see dynamicPrice(). Stays null (all
  // cards show the static PLANS.price fallback) if the athlete has no
  // generated protocol yet (404) or the request fails.
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

  // No checkout/billing endpoint exists yet, but the plan/box-variant
  // choice itself is real now (POST /api/subscription) - only the payment
  // step ahead of it (Account.jsx, for a visitor who isn't signed in yet)
  // is still a dummy flow. sessionStorage is kept too so the next page has
  // an immediate value to show without waiting on a fetch.
  const handleSelectPlan = async (planKey) => {
    sessionStorage.setItem("selectedPlan", planKey);
    if (category) sessionStorage.setItem("selectedBoxVariant", category);

    try {
      await saveSubscription(planKey, category || null);
    } catch {
      // Save failed (network, expired session, etc.) - sessionStorage still
      // carries the choice through this session, so don't block navigation.
    }

    // A real session already existing here means the visitor signed in
    // right at onboarding's identity gate (see IdentityGate) - Account.jsx
    // exists to establish that first real session for a draft/anonymous
    // visitor, which is already done, so sending them there would just be
    // asking them to sign in a second time for nothing. Go straight to the
    // athlete hub instead, same destination Account.jsx's own
    // handleContinue lands on.
    if (user) {
      sessionStorage.setItem("dummyAuthenticated", "true");
      navigate("/athlete-dashboard");
      return;
    }

    const params = new URLSearchParams({ plan: planKey });
    if (category) params.set("category", category);
    navigate(`/account?${params.toString()}`);
  };

  return (
    <div className="subscriptions-page">
      <AccountBar />
      <div className="subscriptions-page__container">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate(cameFromWeeklyBox ? "/weeklybox" : "/account")}
        >
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
          {cameFromWeeklyBox ? t("Back to weekly box") : t("Back to account")}
        </button>

        <div className="eyebrow">
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <path
              d="M10 2l1.8 4.6L16.5 8l-4.7 1.4L10 14l-1.8-4.6L3.5 8l4.7-1.4z"
              fill="currentColor"
            />
          </svg>
          {t("Choose your plan")}
        </div>

        <h1 className="page-title">{t("Pick the Fuelnode rhythm you want to continue with")}</h1>
        <p className="page-subtitle">
          {t(
            "After your protocol and weekly box selection, choose how Fuelnode should continue. Free keeps protocol access with no delivery. Paid tiers add a recurring box delivery cadence depending on the tier."
          )}
        </p>

        {tierHint && (
          <div className="subscriptions-page__hint-banner">
            {t("Recommended for your {category} box: {tier}.", {
              category: category ? t(CATEGORY_LABELS[category] || category) : t("chosen"),
              tier: PLANS.find((p) => p.key === tierHint)?.name || tierHint,
            })}
          </div>
        )}

        <div className="subscriptions-page__layout">
          <div className="plan-grid">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`card plan-card${plan.key === tierHint ? " plan-card--recommended" : ""}`}
              >
                <div className="plan-card__top">
                  <div>
                    <div className="plan-card__name-row">
                      <h3 className="plan-card__name">{t(plan.name)}</h3>
                      {plan.badge && <span className="badge badge--active">{t(plan.badge)}</span>}
                    </div>
                    <p className="plan-card__description">{t(plan.description)}</p>
                  </div>
                  <div className="plan-card__tier-stat">
                    <span className="plan-card__stat-label">{t("Tier")}</span>
                    <span className="plan-card__stat-value">{t(plan.tierStat)}</span>
                  </div>
                </div>

                <div className="plan-card__stats">
                  <div className="plan-card__tier-stat">
                    <span className="plan-card__stat-label">{t("Price")}</span>
                    <span className="plan-card__stat-value">{dynamicPrice(plan, pricing)}</span>
                  </div>
                  <div className="plan-card__tier-stat">
                    <span className="plan-card__stat-label">{t("Cadence")}</span>
                    <span className="plan-card__stat-value">{t(plan.cadence)}</span>
                  </div>
                  <div className="plan-card__tier-stat">
                    <span className="plan-card__stat-label">{t("Box")}</span>
                    <span className="plan-card__stat-value">{t(plan.boxCount)}</span>
                  </div>
                </div>

                <p className="plan-card__note">{t(plan.note)}</p>

                <p className="plan-card__included-label">{t(plan.includedLabel)}</p>
                <span className="plan-card__included-sublabel">{t("Included")}</span>
                <ul className="plan-card__features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{t(feature)}</li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`btn ${plan.ctaStyle === "primary" ? "btn--primary" : "btn--ghost"}`}
                  onClick={() => handleSelectPlan(plan.key)}
                >
                  {t(plan.cta)}
                </button>

                {plan.key !== "free" && (
                  <>
                    <span className="plan-card__footnote">
                      🛡 {t("Cancel before each cutoff — full refund")}
                    </span>
                    <button type="button" className="btn btn--ghost">
                      {t("Show box details →")}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <aside className="subscriptions-sidebar">
            <div className="subscriptions-sidebar__card">
              <p className="subscriptions-sidebar__label">{t("What stays included on every plan")}</p>
              <ul className="plan-card__features">
                {EVERY_PLAN_INCLUDES.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
            </div>
            <div className="subscriptions-sidebar__card">
              <p className="subscriptions-sidebar__tip">
                {t(
                  "Choose your tier now. If you pick a paid plan, you can continue to payment later from your athlete hub. *For paid subscribers, protocol updates are available every 5 minutes to keep the experience stable."
                )}
              </p>
            </div>
          </aside>
        </div>

        <CopyrightFooter />
      </div>
    </div>
  );
}
