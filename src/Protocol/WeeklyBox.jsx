import { useMemo, useState } from "react";
import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildBoxVariants, scoreToDots } from "../utils/boxVariants";
import { Icon } from "../components/Icons.jsx";

const VARIANTS = [
  {
    key: "international",
    label: "International",
    description: "A box matched to your protocol, with non-French brands.",
  },
  {
    key: "value",
    label: "Best value",
    description: "A box matched to your protocol, optimized for the best value.",
  },
  {
    key: "french",
    label: "French brands",
    description: "A box matched to your protocol, centered on French-origin brands.",
  },
];

// "Ambitious for your load" is a heuristic, not a backend field — the
// protocol response has no signal for "box size vs. training volume".
// These thresholds are explicit and easy to tune; they compare the
// onboarding answer sessions_per_week (see src/api/Questions.js) against
// the box's product count.
const LIGHT_LOAD_SESSIONS_PER_WEEK = 4;
const BUSY_WEEK_BOX_SIZE = 6;

function findScienceCard(scienceCards, productName) {
  if (!Array.isArray(scienceCards) || !productName) return null;
  const normalized = productName.trim().toLowerCase();
  return (
    scienceCards.find((card) => (card?.product_name || "").trim().toLowerCase() === normalized) || null
  );
}

/** Expandable "why this product" panel — reuses the protocol's science_cards
 *  layers when the AI generated one for this product, falling back to the
 *  box item's own why_this_product line when it didn't. */
function ProductScience({ item, scienceCard, t }) {
  const [expanded, setExpanded] = useState(false);
  const headline = scienceCard?.layer_0 || item?.why_this_product;
  if (!headline && !scienceCard?.layer_1 && !scienceCard?.layer_2) return null;

  return (
    <div className="box-card__science">
      {expanded && (
        <div className="box-card__science-body">
          {headline && <p className="box-card__science-line">{headline}</p>}
          {scienceCard?.layer_1 && <p className="box-card__science-line">{scienceCard.layer_1}</p>}
          {scienceCard?.layer_2 && (
            <p className="box-card__science-line box-card__science-line--deep">{scienceCard.layer_2}</p>
          )}
        </div>
      )}
      <button
        type="button"
        className="science-card__toggle"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        {expanded ? t("Show less") : t("Discover the product science")}
      </button>
    </div>
  );
}

function RatingDots({ dots, t }) {
  return (
    <span
      className="box-card__dots"
      role="img"
      aria-label={t("{filled} out of 4 value rating", { filled: dots })}
      title={t("Reference value rating, not a live score")}
    >
      {[0, 1, 2, 3].map((i) => (
        <Icon.Zap
          key={i}
          width={12}
          height={12}
          className={`box-card__dot${i < dots ? " box-card__dot--filled" : ""}`}
        />
      ))}
    </span>
  );
}

function ProductCard({ item, showValueBadge, scienceCard, t }) {
  return (
    <div className="card box-card">
      <div className="box-card__header">
        <h4 className="box-card__name">{item?.product_name || t("Unnamed product")}</h4>
        <RatingDots dots={scoreToDots(item.valueScore)} t={t} />
      </div>
      <p className="box-card__brand">
        {item?.brand || t("Unknown brand")}
        {item?.brand_origin ? ` · ${item.brand_origin}` : ""}
      </p>

      <div className="box-card__chips">
        {item?.quantity != null && <span className="pill">{item.quantity}</span>}
        {item?.protocol_slot && <span className="pill pill--slot">{item.protocol_slot}</span>}
      </div>

      <p className="box-card__storage">{item?.storage_note || t("No special storage instructions.")}</p>

      {showValueBadge && (
        <span className="badge badge--muted" title={t("Reference estimate, not a live price")}>
          {item.priceEstimated ? "~" : ""}
          {t("{score} pts/€", { score: item.valueScore })}
        </span>
      )}

      <ProductScience item={item} scienceCard={scienceCard} t={t} />
    </div>
  );
}

/**
 * The protocol response returns one product per protocol_slot, not
 * multiple candidates to choose between, so the three variants below
 * reorder/tag that same list rather than producing three different
 * product sets — see src/utils/boxVariants.js for the exact logic.
 */
export default function WeeklyBox({
  items,
  totalProducts,
  frenchBrandPercentage,
  assemblyNotes,
  scienceCards,
  sessionsPerWeek,
  selectedVariant,
  onSelectVariant,
}) {
  const { t } = useLanguage();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const variants = useMemo(() => buildBoxVariants(items), [items]);

  if (!items || items.length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title">{t("Weekly Box")}</h2>
        <p className="protocol-empty">{t("No box contents available.")}</p>
      </section>
    );
  }

  const boxSize = totalProducts ?? items.length;
  const showLoadBanner =
    !bannerDismissed &&
    sessionsPerWeek != null &&
    Number(sessionsPerWeek) < LIGHT_LOAD_SESSIONS_PER_WEEK &&
    boxSize >= BUSY_WEEK_BOX_SIZE;

  return (
    <section className="protocol-section">
      <div className="section-header">
        <h2 className="protocol-section__title">{t("Weekly Box")}</h2>
        <div className="section-header__stats">
          {totalProducts != null && (
            <span className="badge badge--muted">{t("{count} products", { count: totalProducts })}</span>
          )}
          {frenchBrandPercentage != null && (
            <span className="badge badge--muted">
              {t("{percent}% French brands", { percent: frenchBrandPercentage })}
            </span>
          )}
        </div>
      </div>

      {showLoadBanner && (
        <div className="box-load-banner">
          <div className="box-load-banner__icon" aria-hidden="true">
            <Icon.Zap width={18} height={18} />
          </div>
          <div className="box-load-banner__body">
            <h3 className="box-load-banner__title">
              {t("This box is a little ambitious for your current load")}
            </h3>
            <p>
              {t(
                "Based on your answers, your training volume is still light. The {count}-product weekly box is built for busier weeks, so it gives you more nutrition than your current sessions will actually use.",
                { count: boxSize }
              )}
            </p>
            <p>
              {t(
                "We're still offering it to you, openly: it's a great way to discover the products, find what works for you, and be a step ahead for when you ramp up."
              )}
            </p>
            <p className="box-load-banner__tip">
              {t(
                "Tip: if you raise your training volume in your profile, your box adjusts to your needs automatically."
              )}
            </p>
            <button type="button" className="btn btn--ghost" onClick={() => setBannerDismissed(true)}>
              {t("Got it")}
            </button>
          </div>
        </div>
      )}

      <div className="box-variant-columns">
        {VARIANTS.map((variant) => {
          const variantItems = variants[variant.key] || [];
          const isSelected = selectedVariant === variant.key;

          return (
            <div key={variant.key} className={`box-column${isSelected ? " box-column--selected" : ""}`}>
              <div className="box-column__header">
                <h3 className="box-column__title">{t(variant.label)}</h3>
                <p className="box-column__description">{t(variant.description)}</p>
              </div>

              {variant.key === "value" && (
                <p className="box-column__note">
                  {t(
                    "Value score is a reference estimate (nutrition per euro, by brand/category) for ranking only — it's not a live catalog price."
                  )}
                </p>
              )}

              <div className="box-column__list">
                {variantItems.map((item, index) => (
                  <ProductCard
                    key={`${item?.product_name || "product"}-${index}`}
                    item={item}
                    showValueBadge={variant.key === "value"}
                    scienceCard={findScienceCard(scienceCards, item?.product_name)}
                    t={t}
                  />
                ))}
              </div>

              <div className="box-column__footer">
                <span className="protocol-empty">{t("{count} products", { count: variantItems.length })}</span>
                <button
                  type="button"
                  className={`btn ${isSelected ? "btn--primary" : "btn--ghost"}`}
                  onClick={() => onSelectVariant?.(variant.key)}
                >
                  {isSelected ? t("Selected ✓") : t("Choose this box")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {assemblyNotes && (
        <p className="protocol-note">
          <strong>{t("Assembly notes:")}</strong> {assemblyNotes}
        </p>
      )}
    </section>
  );
}
