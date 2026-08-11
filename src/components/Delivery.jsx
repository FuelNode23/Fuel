import { deliveryPoints } from "./Data.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function Delivery() {
  const { t } = useLanguage();

  return (
    <section id="delivery" className="fn-section">
      <div className="fn-delivery-card">
        <div className="fn-section-header">
          <h2 className="fn-section-title">{t("Delivery built for performance")}</h2>
          <p className="fn-section-subtitle">
            {t("Reliable, structured physical execution that fits your training week.")}
          </p>
        </div>

        <div className="fn-delivery-grid">
          {deliveryPoints.map(({ icon: PointIcon, label }) => (
            <div className="fn-delivery-point" key={label}>
              <div className="fn-delivery-icon-wrap">
                <PointIcon className="fn-icon-sm fn-icon-cyan" />
              </div>
              <p className="fn-delivery-label">{t(label)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
