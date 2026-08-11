import { steps } from "./Data.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how" className="fn-section">
      <div className="fn-container">
        <div className="fn-section-header">
          <h2 className="fn-section-title">{t("How FuelNode works")}</h2>
          <p className="fn-section-subtitle">
            {t(
              "A precision nutrition engine adapted to your profile, your effort, and your conditions."
            )}
          </p>
        </div>

        <div className="fn-steps-grid">
          {steps.map(({ icon: StepIcon, n, title, body }) => (
            <div className="fn-step-card" key={n}>
              <div className="fn-step-icon-wrap">
                <StepIcon className="fn-icon-md fn-icon-lime" />
              </div>
              <span className="fn-step-number">{n}</span>
              <h3 className="fn-step-title">{t(title)}</h3>
              <p className="fn-step-body">{t(body)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
