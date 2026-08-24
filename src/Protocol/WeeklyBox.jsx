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

// Identifies a canonical box item for staging/matching purposes - slot
// alone isn't unique (a real generated box can have two items sharing a
// slot), and in the International/French views the item on screen may be
// a client-side substitute rather than what's actually saved (see
// boxVariants.js's substituteByOrigin), so this always resolves back to
// the real underlying product_name via _originalProductName when present.
function canonicalName(item) {
  return item?._originalProductName || item?.product_name || "";
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
 * Lets an athlete browse real catalog alternatives for one box item and
 * stage a pick - nothing is sent to the backend from here. The original
 * product is always listed first and shown as the current choice until
 * the athlete picks something else; picking is purely local state
 * (onStage), so browsing costs nothing and a column-level Cancel can
 * always discard it for free. The actual swap only happens when the
 * athlete clicks "Save changes" at the column level (see WeeklyBox's
 * handleSaveChanges).
 */
function ProductEditPicker({ item, pendingChoice, onStage, t }) {
  const [open, setOpen] = useState(false);
  const [alternatives, setAlternatives] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const isOriginalSelected = !pendingChoice;

  return (
    <div className="box-card__swap">
      <button type="button" className="science-card__toggle" onClick={handleToggle} aria-expanded={open}>
        {open ? t("Hide alternatives") : t("Choose a different product")}
      </button>

      {open && (
        <div className="box-card__swap-list">
          {loading && <p className="box-card__swap-hint">{t("Loading alternatives...")}</p>}
          {error && (
            <p className="box-card__swap-hint">{t("Couldn't load alternatives. Try again in a moment.")}</p>
          )}

          {!loading && !error && (
            <button
              type="button"
              className={`box-card__swap-option${isOriginalSelected ? " box-card__swap-option--selected" : ""}`}
              onClick={() => onStage(null)}
            >
              <span className="box-card__swap-option-text">
                <span className="box-card__swap-option-name">{item.product_name}</span>
                <span className="box-card__swap-option-brand">
                  {item.brand}
                  {item.brand_origin ? ` · ${item.brand_origin}` : ""}
                </span>
              </span>
              {isOriginalSelected && <span className="box-card__swap-option-status">{t("Current")}</span>}
            </button>
          )}

          {!loading && !error && alternatives && alternatives.length === 0 && (
            <p className="box-card__swap-hint">{t("No other product found for this slot yet.")}</p>
          )}

          {!loading &&
            !error &&
            alternatives &&
            alternatives.slice(0, 6).map((product) => {
              const isSelected = pendingChoice?.id === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  className={`box-card__swap-option${isSelected ? " box-card__swap-option--selected" : ""}`}
                  onClick={() => onStage(product)}
                >
                  <span className="box-card__swap-option-text">
                    <span className="box-card__swap-option-name">{product.productName}</span>
                    <span className="box-card__swap-option-brand">
                      {product.brand}
                      {product.brandOrigin ? ` · ${product.brandOrigin}` : ""}
                    </span>
                  </span>
                  {isSelected && <span className="box-card__swap-option-status">{t("Selected")}</span>}
                </button>
              );
            })}
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

function ProductCard({ item, showValueBadge, scienceCard, isEditing, pendingChoice, onStage, t }) {
  // What's actually shown on the card - the staged pick if the athlete
  // made one, otherwise the original, untouched item. item itself is
  // never mutated, so "keep original" in the picker always has the real
  // original to fall back to.
  const displayItem = pendingChoice
    ? {
        ...item,
        product_name: pendingChoice.productName,
        brand: pendingChoice.brand,
        brand_origin: pendingChoice.brandOrigin,
        why_this_product: null,
        storage_note: null,
      }
    : item;

  return (
    <div className={`card box-card${pendingChoice ? " box-card--pending" : ""}`}>
      <div className="box-card__header">
        <h4 className="box-card__name">{displayItem?.product_name || t("Unnamed product")}</h4>
        <RatingDots dots={scoreToDots(item.valueScore)} t={t} />
      </div>
      <p className="box-card__brand">
        {displayItem?.brand || t("Unknown brand")}
        {displayItem?.brand_origin ? ` · ${displayItem.brand_origin}` : ""}
      </p>

      <div className="box-card__chips">
        {item?.quantity != null && <span className="pill">{item.quantity}</span>}
        {item?.protocol_slot && <span className="pill pill--slot">{item.protocol_slot}</span>}
        {pendingChoice && <span className="pill pill--pending">{t("Pending")}</span>}
      </div>

      <p className="box-card__storage">{displayItem?.storage_note || t("No special storage instructions.")}</p>

      {showValueBadge && (
        <span className="badge badge--muted" title={t("Reference estimate, not a live price")}>
          {item.priceEstimated ? "~" : ""}
          {t("{score} pts/€", { score: item.valueScore })}
        </span>
      )}

      <ProductScience item={item} scienceCard={scienceCard} t={t} />
      {isEditing && <ProductEditPicker item={item} pendingChoice={pendingChoice} onStage={onStage} t={t} />}
    </div>
  );
}

/**
 * The protocol response returns one product per protocol_slot, not
 * multiple candidates to choose between, so the three variants below
 * reorder/tag that same list rather than producing three different
 * product sets — see src/utils/boxVariants.js for the exact logic.
 *
 * Product replacement is entirely user-initiated and staged, never
 * automatic: choosing a box leaves its products untouched, and only
 * clicking "Edit" on the selected box opens the replacement picker per
 * item. Picks made there (onStage) only update local pendingChanges -
 * nothing is sent to the backend until "Save changes"; "Cancel" discards
 * pendingChanges and exits edit mode with nothing changed. Editing is
 * only offered on the already-selected column and resets if the athlete
 * switches to a different one, since editing a box you're not choosing
 * doesn't make sense.
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

  const [isEditing, setIsEditing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([]); // [{ slot, currentProductName, product }]
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Switching which box is selected always exits any in-progress edit,
  // discarding whatever wasn't saved - editing a box that's no longer
  // the chosen one wouldn't make sense.
  useEffect(() => {
    setIsEditing(false);
    setPendingChanges([]);
    setSaveError(false);
  }, [selectedVariant]);

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

  const handleStartEdit = () => {
    setIsEditing(true);
    setPendingChanges([]);
    setSaveError(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPendingChanges([]);
    setSaveError(false);
  };

  const findPendingChoice = (item) => {
    const slot = item?.protocol_slot;
    const name = canonicalName(item);
    return pendingChanges.find((pc) => pc.slot === slot && pc.currentProductName === name)?.product || null;
  };

  // product === null means "back to the original" - just drop any staged
  // entry for this item rather than keeping a no-op pending change around.
  const handleStage = (item, product) => {
    const slot = item?.protocol_slot;
    const name = canonicalName(item);
    setPendingChanges((prev) => {
      const filtered = prev.filter((pc) => !(pc.slot === slot && pc.currentProductName === name));
      return product ? [...filtered, { slot, currentProductName: name, product }] : filtered;
    });
  };

  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setSaveError(false);
    try {
      // Sequential, not Promise.all - each swap targets the athlete's
      // one saved protocol row, and there's no value in racing writes to
      // the same record for what's normally a handful of items at most.
      for (const change of pendingChanges) {
        const updatedItem = await swapBoxItem(change.slot, change.currentProductName, change.product.id);
        onItemSwapped?.(updatedItem, change.currentProductName);
      }
      setPendingChanges([]);
      setIsEditing(false);
    } catch {
      // Leave pendingChanges and edit mode as-is so nothing already
      // chosen is lost - the athlete can retry Save changes or Cancel.
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

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
          const isEditingThisColumn = isSelected && isEditing;

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
                    isEditing={isEditingThisColumn}
                    pendingChoice={isEditingThisColumn ? findPendingChoice(item) : null}
                    onStage={(product) => handleStage(item, product)}
                    t={t}
                  />
                ))}
              </div>

              {isEditingThisColumn && saveError && (
                <p className="box-column__save-error">
                  {t("Couldn't save your changes. Please try again.")}
                </p>
              )}

              <div className="box-column__footer">
                <span className="protocol-empty">{t("{count} products", { count: variantItems.length })}</span>
                <div className="box-column__footer-actions">
                  {isEditingThisColumn ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        {t("Cancel")}
                      </button>
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleSaveChanges}
                        disabled={saving}
                      >
                        {saving ? t("Saving...") : t("Save changes")}
                      </button>
                    </>
                  ) : (
                    <>
                      {isSelected && (
                        <button type="button" className="btn btn--ghost" onClick={handleStartEdit}>
                          {t("Edit")}
                        </button>
                      )}
                      <button
                        type="button"
                        className={`btn ${isSelected ? "btn--primary" : "btn--ghost"}`}
                        onClick={() => onSelectVariant?.(variant.key)}
                      >
                        {isSelected ? t("Selected ✓") : t("Choose this box")}
                      </button>
                    </>
                  )}
                </div>
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
