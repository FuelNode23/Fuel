import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import LoadingState from "../Protocol/LoadingState";
import ErrorState from "../Protocol/ErrorState";
import AthleteSummary from "../Protocol/AthleteSummary";
import MacroTargets from "../Protocol/MacroTargets";
import DietProtocol from "../Protocol/DietProtocol";
import FuelingProtocol from "../Protocol/FuelingProtocol";
import SpecialistProtocols from "../Protocol/SpecialistProtocols";
import WeeklyBox from "../Protocol/WeeklyBox";
import ScienceCards from "../Protocol/ScienceCards";
import Assumptions from "../Protocol/Assumptions";
import MissingData from "../Protocol/MissingData";
import {
  adaptDietProtocol,
  adaptFuelingProtocol,
  adaptMacroTargets,
  adaptScienceCards,
  adaptSpecialistProtocols,
  adaptWeeklyBoxItems,
  adaptAssemblyNotes,
} from "../api/protocolAdapters";

import "./Protocol.css";

/**
 * The backend's /onboarding response is real JSON (camelCase), shaped
 * like this (see the sample response you shared):
 *
 * {
 *   title, generated, language,
 *   athleteSummary: string,
 *   macroTargets: { bmrKcal, tdeeKcal, proteinPerDayG, fatPerDayG,
 *                   restDayCarbsG, easyDayCarbsG, hardDayCarbsG,
 *                   longEffortCarbsG },
 *   dietProtocol: [ { meal, timing, targets, base, protein, fibre,
 *                      constraints, productPairing } ],
 *   fuelingProtocol: [ { phase, timing, recommendation, product, ... } ],
 *   activeSpecialistProtocols: [ string ],
 *   weeklyBox: { totalProducts, frenchBrandsPercent, products: [ {...} ] },
 *   assemblyNotes: [ string ],
 *   scienceCards: [ { product, quickExplanation, howItWorks,
 *                      researchBrandContext } ],
 *   protocolChangelog: [ string ],
 *   assumptionsMade: [ string ],
 *   missingData: [ string ]
 * }
 *
 * All nine child component shapes are now confirmed (see
 * protocolAdapters.js for the full list of field-name/structure
 * mismatches between this JSON and what each component expects).
 * AthleteSummary, Assumptions, MissingData, and ErrorState/LoadingState
 * matched already and are passed straight through. Everything else goes
 * through an adapter before being passed down.
 *
 * There's also no `protocolVersion`-equivalent field in this response
 * (there's `protocolChangelog` instead) — `version` below is left
 * unset; wire it up if AthleteSummary needs something there.
 *
 * Data handoff unchanged: OnboardingFlow's single POST /onboarding call
 * gets this JSON back and passes it via navigate() state (fresh) or
 * sessionStorage "protocolHandoff" (survives a hard refresh, since
 * location.state does not).
 */
export default function Protocol() {
  const location = useLocation();
  const navigate = useNavigate();

  const [protocol, setProtocol] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error" | "empty"
  const [errorMessage, setErrorMessage] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);

  const handleBack = () => navigate(-1);

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
        "We couldn't save your profile, so your personalized protocol hasn't been generated yet. Your answers are safe — please try again."
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
        <LoadingState />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="protocol-page">
        <ErrorState
          message={errorMessage}
          onRetry={saveFailed ? () => navigate("/onboarding") : loadHandoff}
          onBack={handleBack}
        />
      </div>
    );
  }

  if (status === "empty" || !protocol) {
    return (
      <div className="protocol-page">
        <div className="protocol-page__empty">
          No protocol available. Please complete onboarding first.
        </div>
      </div>
    );
  }

  return (
    <div className="protocol-page">
      <div className="protocol-page__inner">
        <header className="protocol-page__header">
          <h1 className="protocol-page__title">{protocol.title || "Your Nutrition Protocol"}</h1>
          <p className="protocol-page__subtitle">
            Personalized fueling, recovery, and product guidance based on your onboarding profile.
          </p>
        </header>

        <AthleteSummary
          summary={protocol.athleteSummary}
          generatedDate={protocol.generated}
          language={protocol.language}
          version={undefined}
        />

        <MacroTargets macroTargets={adaptMacroTargets(protocol.macroTargets)} />

        <DietProtocol dietProtocol={adaptDietProtocol(protocol.dietProtocol)} />

        <FuelingProtocol fuelingProtocol={adaptFuelingProtocol(protocol.fuelingProtocol)} />

        <SpecialistProtocols protocols={adaptSpecialistProtocols(protocol.activeSpecialistProtocols)} />

        <WeeklyBox
          items={adaptWeeklyBoxItems(protocol.weeklyBox?.products)}
          totalProducts={protocol.weeklyBox?.totalProducts}
          frenchBrandPercentage={protocol.weeklyBox?.frenchBrandsPercent}
          assemblyNotes={adaptAssemblyNotes(protocol.assemblyNotes)}
        />

        <ScienceCards cards={adaptScienceCards(protocol.scienceCards)} />

        <Assumptions assumptions={protocol.assumptionsMade} />

        <MissingData flags={protocol.missingData} />
      </div>
    </div>
  );
}