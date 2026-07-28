import { steps } from "./data.js";

export default function HowItWorks() {
  return (
    <section id="how" className="fn-section">
      <div className="fn-container">
        <div className="fn-section-header">
          <h2 className="fn-section-title">Comment fonctionne FuelNode</h2>
          <p className="fn-section-subtitle">
            Un moteur de nutrition de précision adapté à votre profil, à
            votre effort et à vos conditions.
          </p>
        </div>

        <div className="fn-steps-grid">
          {steps.map(({ icon: StepIcon, n, title, body }) => (
            <div className="fn-step-card" key={n}>
              <div className="fn-step-icon-wrap">
                <StepIcon className="fn-icon-md fn-icon-lime" />
              </div>
              <span className="fn-step-number">{n}</span>
              <h3 className="fn-step-title">{title}</h3>
              <p className="fn-step-body">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
