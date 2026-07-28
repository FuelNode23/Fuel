import { Icon } from "./icons.jsx";
import { heroBadges, boxItems, heroPanel } from "./data.js";
import image from "../assets/image.png";

export default function Hero() {
  return (
    <section className="fn-hero">
      <div className="fn-container">
        <div className="fn-hero-grid">
          <div className="fn-hero-copy">
            <div className="fn-logo-wrap">
              <img src={image} alt="FuelNode" className="fn-logo" />
            </div>
            <div className="fn-hero-heading-group">
              <h1 className="fn-hero-title">
                Le bon carburant, au bon moment,
                <br />
                <span className="fn-accent">chaque semaine</span>
              </h1>
              <p className="fn-hero-subtitle">
                FuelNode transforme vos données en protocoles nutritionnels
                précis et en box hebdomadaires assemblées avec précision.
              </p>
            </div>
            <div className="fn-hero-actions">
              <a className="fn-btn fn-btn-primary" href="/onboarding">
                Tester FuelNode
                <Icon.ArrowRight className="fn-icon-sm" />
              </a>
              <a className="fn-btn fn-btn-secondary" href="#how">
                Voir comment ça marche
              </a>
            </div>
            <div className="fn-badges">
              {heroBadges.map(({ icon: BadgeIcon, label }) => (
                <div className="fn-badge" key={label}>
                  <BadgeIcon className="fn-icon-sm fn-icon-cyan" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <HeroPanel />
        </div>
      </div>
    </section>
  );
}

function HeroPanel() {
  return (
    <div className="fn-hero-panel-wrap">
      <div className="fn-panel-glow" aria-hidden="true" />
      <div className="fn-panel">
        <div className="fn-panel-header">
          <div className="fn-panel-header-left">
            <Icon.Activity className="fn-icon-sm fn-icon-lime" />
            <span className="fn-panel-title">{heroPanel.session}</span>
          </div>
          <span className="fn-panel-tag">{heroPanel.weekTag}</span>
        </div>

        <div className="fn-panel-stats">
          {heroPanel.stats.map(({ icon: StatIcon, label, value }) => (
            <div className="fn-stat-card" key={label}>
              <StatIcon className="fn-icon-sm fn-icon-cyan fn-icon-center" />
              <p className="fn-stat-label">{label}</p>
              <p className="fn-stat-value">{value}</p>
            </div>
          ))}
        </div>

        <div className="fn-panel-macros">
          {heroPanel.macros.map(({ label, value, tone }) => (
            <div className="fn-macro-card" key={label}>
              <p className="fn-stat-label">{label}</p>
              <p className={`fn-macro-value ${tone}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="fn-box-card">
          <div className="fn-box-card-header">
            <div className="fn-box-card-header-left">
              <Icon.Box className="fn-icon-sm fn-icon-lime" />
              <span className="fn-panel-title">Box hebdomadaire</span>
            </div>
            <span className="fn-box-count">{boxItems.length} articles</span>
          </div>
          <div className="fn-box-items">
            {boxItems.map((item) => (
              <div className="fn-box-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
