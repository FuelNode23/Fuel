import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function WeeklyBox({ items, totalProducts, frenchBrandPercentage, assemblyNotes }) {
  const { t } = useLanguage();

  if (!items || items.length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title">{t("Weekly Box")}</h2>
        <p className="protocol-empty">{t("No box contents available.")}</p>
      </section>
    );
  }

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

      <div className="card-grid card-grid--box">
        {items.map((item, index) => (
          <div className="card product-card" key={`${item?.product_name || "product"}-${index}`}>
            <div className="product-card__image-placeholder" aria-hidden="true">
              <span>{item?.product_name ? item.product_name.charAt(0) : "?"}</span>
            </div>
            <div className="product-card__body">
              <h3 className="product-card__name">{item?.product_name || t("Unnamed product")}</h3>
              <p className="product-card__brand">
                {item?.brand || t("Unknown brand")}
                {item?.brand_origin ? ` · ${item.brand_origin}` : ""}
              </p>

              <dl className="meal-card__details">
                <div className="detail-row">
                  <dt>{t("Quantity")}</dt>
                  <dd>{item?.quantity ?? "—"}</dd>
                </div>
                <div className="detail-row">
                  <dt>{t("Protocol slot")}</dt>
                  <dd>{item?.protocol_slot || t("Not specified")}</dd>
                </div>
                <div className="detail-row">
                  <dt>{t("Why this product")}</dt>
                  <dd>{item?.why_this_product || t("No details provided.")}</dd>
                </div>
                <div className="detail-row">
                  <dt>{t("Storage")}</dt>
                  <dd>{item?.storage_note || t("No special storage instructions.")}</dd>
                </div>
              </dl>
            </div>
          </div>
        ))}
      </div>

      {assemblyNotes && (
        <p className="protocol-note">
          <strong>{t("Assembly notes:")}</strong> {assemblyNotes}
        </p>
      )}
    </section>
  );
}
