import { deliveryPoints } from "./data.js";

export default function Delivery() {
  return (
    <section id="delivery" className="fn-section">
      <div className="fn-delivery-card">
        <div className="fn-section-header">
          <h2 className="fn-section-title">Livraison pensée pour la performance</h2>
          <p className="fn-section-subtitle">
            Une exécution physique fiable, structurée et compatible avec
            votre semaine d'entraînement.
          </p>
        </div>

        <div className="fn-delivery-grid">
          {deliveryPoints.map(({ icon: PointIcon, label }) => (
            <div className="fn-delivery-point" key={label}>
              <div className="fn-delivery-icon-wrap">
                <PointIcon className="fn-icon-sm fn-icon-cyan" />
              </div>
              <p className="fn-delivery-label">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
