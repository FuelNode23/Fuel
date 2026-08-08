import "./ProtocolComponents.css";

export default function WeeklyBox({ items, totalProducts, frenchBrandPercentage, assemblyNotes }) {
  if (!items || items.length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title">Weekly Box</h2>
        <p className="protocol-empty">No box contents available.</p>
      </section>
    );
  }

  return (
    <section className="protocol-section">
      <div className="section-header">
        <h2 className="protocol-section__title">Weekly Box</h2>
        <div className="section-header__stats">
          {totalProducts != null && (
            <span className="badge badge--muted">{totalProducts} products</span>
          )}
          {frenchBrandPercentage != null && (
            <span className="badge badge--muted">{frenchBrandPercentage}% French brands</span>
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
              <h3 className="product-card__name">{item?.product_name || "Unnamed product"}</h3>
              <p className="product-card__brand">
                {item?.brand || "Unknown brand"}
                {item?.brand_origin ? ` · ${item.brand_origin}` : ""}
              </p>

              <dl className="meal-card__details">
                <div className="detail-row">
                  <dt>Quantity</dt>
                  <dd>{item?.quantity ?? "—"}</dd>
                </div>
                <div className="detail-row">
                  <dt>Protocol slot</dt>
                  <dd>{item?.protocol_slot || "Not specified"}</dd>
                </div>
                <div className="detail-row">
                  <dt>Why this product</dt>
                  <dd>{item?.why_this_product || "No details provided."}</dd>
                </div>
                <div className="detail-row">
                  <dt>Storage</dt>
                  <dd>{item?.storage_note || "No special storage instructions."}</dd>
                </div>
              </dl>
            </div>
          </div>
        ))}
      </div>

      {assemblyNotes && (
        <p className="protocol-note">
          <strong>Assembly notes:</strong> {assemblyNotes}
        </p>
      )}
    </section>
  );
}
