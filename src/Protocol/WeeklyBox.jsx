import { useEffect, useMemo, useState } from "react";
import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildBoxVariants, scoreToDots } from "../utils/boxVariants";
import { Icon } from "../components/Icons.jsx";
import apiClient, { getCatalogBySlot, swapBoxItem } from "../api/client.js";

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

/**
 * Lets an athlete replace one box item with a real catalog alternative
 * sharing the same protocol_slot - alternatives are fetched on demand
 * (not up front for every card) and cached in local state per open, since
 * a real swap changes what "current" means and the list should reflect
 * that on the next open. Persists via swapBoxItem (see client.js) - a
 * real edit to the athlete's saved protocol, not just a local reorder
 * like the International/French box views already do.
 */
function ProductSwapPicker({ item, onSwapped, t }) {
  const [open, setOpen] = useState(false);
  const [alternatives, setAlternatives] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swappingId, setSwappingId] = useState(null);
  const [error, setError] = useState(false);

  const slot = item?.protocol_slot;
  if (!slot) return null;

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (!next || alternatives !== null) return;

    setLoading(true);
    setError(false);
    getCatalogBySlot(slot)
      .then((data) => {
        const currentName = (item?.product_name || "").trim().toLowerCase();
        const options = (Array.isArray(data) ? data : []).filter(
          (p) => (p?.productName || "").trim().toLowerCase() !== currentName
        );
        setAlternatives(options);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  const handlePick = (product) => {
    setSwappingId(product.id);
    swapBoxItem(slot, item?.product_name || "", product.id)
      .then((updatedItem) => {
        onSwapped?.(updatedItem);
        setOpen(false);
        setAlternatives(null);
      })
      .catch(() => setError(true))
      .finally(() => setSwappingId(null));
  };

  return (
    <div className="box-card__swap">
      <button
        type="button"
        className="science-card__toggle"
        onClick={handleToggle}
        aria-expanded={open}
      >
        {open ? t("Hide alternatives") : t("Swap for an equivalent")}
      </button>

      {open && (
        <div className="box-card__swap-list">
          {loading && <p className="box-card__swap-hint">{t("Loading alternatives...")}</p>}
          {error && (
            <p className="box-card__swap-hint">{t("Couldn't load alternatives. Try again in a moment.")}</p>
          )}
          {!loading && !error && alternatives && alternatives.length === 0 && (
            <p className="box-card__swap-hint">{t("No other product found for this slot yet.")}</p>
          )}
          {!loading &&
            !error &&
            alternatives &&
            alternatives.slice(0, 6).map((product) => (
              <button
                key={product.id}
                type="button"
                className="box-card__swap-option"
                disabled={swappingId != null}
                onClick={() => handlePick(product)}
              >
                <span className="box-card__swap-option-text">
                  <span className="box-card__swap-option-name">{product.productName}</span>
                  <span className="box-card__swap-option-brand">
                    {product.brand}
                    {product.brandOrigin ? ` · ${product.brandOrigin}` : ""}
                  </span>
                </span>
                {swappingId === product.id && (
                  <span className="box-card__swap-option-status">{t("Applying...")}</span>
                )}
              </button>
            ))}
        </div>
      )}
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

function ProductCard({ item, showValueBadge, scienceCard, onItemSwapped, t }) {
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
      <ProductSwapPicker item={item} onSwapped={onItemSwapped} t={t} />
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
  onItemSwapped,
}) {
  const { t } = useLanguage();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [internationalCatalog, setInternationalCatalog] = useState([]);
  const [frenchCatalog, setFrenchCatalog] = useState([]);

  // Powers the International/French views' real product substitutions
  // (see buildBoxVariants/substituteByOrigin in utils/boxVariants.js). A
  // failed/empty fetch just leaves that view showing the same re-sorted
  // box, same as before this existed - never blocks render.
  useEffect(() => {
    let cancelled = false;

    apiClient
      .get("/catalog/international")
      .then(({ data }) => {
        if (!cancelled) setInternationalCatalog(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    apiClient
      .get("/catalog/french")
      .then(({ data }) => {
        if (!cancelled) setFrenchCatalog(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const variants = useMemo(
    () => buildBoxVariants(items, internationalCatalog, frenchCatalog),
    [items, internationalCatalog, frenchCatalog]
  );

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
                    onItemSwapped={onItemSwapped}
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
