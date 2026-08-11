import { Icon } from "./Icons.jsx";
import { heroBadges, boxItems, heroPanel } from "./Data.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import image from "../assets/image.png";

export default function Hero() {
  const { t } = useLanguage();

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
                {t("The right fuel, at the right time,")}
                <br />
                <span className="fn-accent">{t("every week")}</span>
              </h1>
              <p className="fn-hero-subtitle">
                {t(
                  "FuelNode turns your data into precise nutrition protocols and weekly boxes assembled with precision."
                )}
              </p>
            </div>
            <div className="fn-hero-actions">
              <a className="fn-btn fn-btn-primary" href="/onboarding">
                {t("Try FuelNode")}
                <Icon.ArrowRight className="fn-icon-sm" />
              </a>
              <a className="fn-btn fn-btn-secondary" href="#how">
                {t("See how it works")}
              </a>
            </div>
            <div className="fn-badges">
              {heroBadges.map(({ icon: BadgeIcon, label }) => (
                <div className="fn-badge" key={label}>
                  <BadgeIcon className="fn-icon-sm fn-icon-cyan" />
                  <span>{t(label)}</span>
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
  const { t } = useLanguage();

  return (
    <div className="fn-hero-panel-wrap">
      <div className="fn-panel-glow" aria-hidden="true" />
      <div className="fn-panel">
        <div className="fn-panel-header">
          <div className="fn-panel-header-left">
            <Icon.Activity className="fn-icon-sm fn-icon-lime" />
            <span className="fn-panel-title">{t(heroPanel.session)}</span>
          </div>
          <span className="fn-panel-tag">{t(heroPanel.weekTag)}</span>
        </div>

        <div className="fn-panel-stats">
          {heroPanel.stats.map(({ icon: StatIcon, label, value }) => (
            <div className="fn-stat-card" key={label}>
              <StatIcon className="fn-icon-sm fn-icon-cyan fn-icon-center" />
              <p className="fn-stat-label">{t(label)}</p>
              <p className="fn-stat-value">{value}</p>
            </div>
          ))}
        </div>

        <div className="fn-panel-macros">
          {heroPanel.macros.map(({ label, value, tone }) => (
            <div className="fn-macro-card" key={label}>
              <p className="fn-stat-label">{t(label)}</p>
              <p className={`fn-macro-value ${tone}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="fn-box-card">
          <div className="fn-box-card-header">
            <div className="fn-box-card-header-left">
              <Icon.Box className="fn-icon-sm fn-icon-lime" />
              <span className="fn-panel-title">{t("Weekly box")}</span>
            </div>
            <span className="fn-box-count">{t("{count} items", { count: boxItems.length })}</span>
          </div>
          <div className="fn-box-items">
            {boxItems.map((item) => (
              <div className="fn-box-item" key={item}>
                {t(item)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
