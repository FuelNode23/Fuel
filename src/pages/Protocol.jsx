import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountBar from "../components/AccountBar.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";

import LoadingState from "../Protocol/LoadingState";
import ErrorState from "../Protocol/ErrorState";
import AthleteSummary from "../Protocol/AthleteSummary";
import MacroTargets from "../Protocol/MacroTargets";
import DietProtocol from "../Protocol/DietProtocol";
import FuelingProtocol from "../Protocol/FuelingProtocol";

import {
  adaptDietProtocol,
  adaptFuelingProtocol,
  adaptMacroTargets,
  adaptScienceCards,
  adaptSpecialistProtocols,
  adaptWeeklyBoxItems,
  adaptAssemblyNotes,
} from "../api/Protocoladapters";

import "./Protocol.css";

/**
 * OnboardingFlow's single POST /protocol/generate-with-profile call
 * returns Claude's generated protocol JSON directly (snake_case, see
 * Protocoladapters.js for the full confirmed shape and backend
 * main/resources/prompts/protocol-system.txt for the source schema).
 * That shape already matches what every Protocol child component
 * expects, so most props are passed straight through; the adapters in
 * Protocoladapters.js only cover genuine gaps (e.g.
 * active_specialist_protocols being plain strings instead of objects)
 * and defend against a field being missing or null, which the prompt
 * itself allows for.
 *
 * Data handoff: the result is passed via navigate() state (fresh) or
 * sessionStorage "protocolHandoff" (survives a hard refresh, since
 * location.state does not).
 */
export default function Protocol() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [protocol, setProtocol] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error" | "empty"
  const [errorMessage, setErrorMessage] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);

  const handleBack = () => navigate(-1);

  const handleViewWeeklyBox = () => {
    const weeklyBoxHandoff = {
      items: adaptWeeklyBoxItems(protocol.weekly_box_contents),
      totalProducts: protocol.box_total_products,
      frenchBrandPercentage: protocol.box_french_brand_percentage,
      assemblyNotes: adaptAssemblyNotes(protocol.assembly_notes),
    };
    sessionStorage.setItem("weeklyBoxHandoff", JSON.stringify(weeklyBoxHandoff));
    navigate("/weeklybox", { state: weeklyBoxHandoff });
  };

  const loadHandoff = () => {
    setStatus("loading");
    setErrorMessage("");

    // Prefer fresh router state (just came from onboarding this session).
    let handoff = location.state;

    // Fall back to sessionStorage (e.g. user refreshed the /protocol page).
    if (!handoff) {
      const stored = sessionStorage.getItem("protocolHandoff");
      if (stored) {
        try {
          handoff = JSON.parse(stored);
        } catch {
          handoff = null;
        }
      }
    }

    if (!handoff) {
      setProtocol(null);
      setStatus("empty");
      return;
    }

    if (handoff.saveFailed) {
      // Onboarding's POST /onboarding failed server-side, so there's no
      // generated protocol to show. userData was still preserved on the
      // onboarding side, so nothing the user entered is lost.
      setSaveFailed(true);
      setProtocol(null);
      setStatus("error");
      setErrorMessage(
        t(
          "We couldn't save your profile, so your personalized protocol hasn't been generated yet. Your answers are safe — please try again."
        )
      );
      return;
    }

    if (!handoff.onboardingResult) {
      setProtocol(null);
      setStatus("empty");
      return;
    }

    setProtocol(handoff.onboardingResult);
    setStatus("success");
  };

  useEffect(() => {
    loadHandoff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="protocol-page">
        <AccountBar />
        <LoadingState />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="protocol-page">
        <AccountBar />
        <ErrorState
          message={errorMessage}
          onRetry={saveFailed ? () => navigate("/onboarding") : loadHandoff}
          onBack={handleBack}
        />
        <CopyrightFooter />
      </div>
    );
  }

  if (status === "empty" || !protocol) {
    return (
      <div className="protocol-page">
        <AccountBar />
        <div className="protocol-page__empty">
          {t("No protocol available. Please complete onboarding first.")}
        </div>
        <CopyrightFooter />
      </div>
    );
  }

  return (
    <div className="protocol-page">
      <AccountBar />
      <div className="protocol-page__inner">
        <header className="protocol-page__header">
          <h1 className="protocol-page__title">{protocol.title || t("Your Nutrition Protocol")}</h1>
          <p className="protocol-page__subtitle">
            {t("Personalized fueling, recovery, and product guidance based on your onboarding profile.")}
          </p>
        </header>

        <AthleteSummary
          summary={protocol.athlete_summary}
          generatedDate={protocol.generated_date}
          language={protocol.language}
          version={protocol.protocol_version}
        />

        <MacroTargets macroTargets={adaptMacroTargets(protocol.macro_targets)} />

        <DietProtocol dietProtocol={adaptDietProtocol(protocol.diet_protocol)} />

        <FuelingProtocol fuelingProtocol={adaptFuelingProtocol(protocol.fueling_protocol)} />



        <section className="protocol-section">
          <h2 className="protocol-section__title">{t("Weekly Box")}</h2>
          <p className="protocol-empty">
            {protocol.box_total_products
              ? t("Your {count}-product box is ready, assembled around this protocol.", {
                  count: protocol.box_total_products,
                })
              : t("Your personalized product box is ready.")}
          </p>
          <button type="button" className="btn btn--primary" onClick={handleViewWeeklyBox}>
            {t("View your weekly box →")}
          </button>
        </section>
      </div>

      <CopyrightFooter />
    </div>
  );
}
