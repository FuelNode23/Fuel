import { Icon } from "./icons.jsx";
import OnboardingFlow from "../pages/OnboardingFlow.jsx";

export default function Cta() {
  return (
    <section className="fn-section">
      <div className="fn-cta-card">
        <h2 className="fn-section-title">Accéder à FuelNode</h2>
        <p className="fn-section-subtitle">
          Un onboarding court, un protocole exploitable immédiatement, et
          une box qui suit votre semaine d'entraînement.
        </p>
        <a className="fn-btn fn-btn-primary fn-btn-lg" href="/onboarding">
          Tester FuelNode
          <Icon.ArrowRight className="fn-icon-sm" />
        </a>
      </div>
    </section>
  );
}
