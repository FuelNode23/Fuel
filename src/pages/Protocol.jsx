import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountBar from "../components/AccountBar.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";

import LoadingState from "../Protocol/LoadingState";
import ErrorState from "../Protocol/ErrorState";
import AthleteFuelingCard from "../Protocol/AthleteFuelingCard";
import SessionProtocol from "../Protocol/SessionProtocol";
import RaceDayProtocol from "../Protocol/RaceDayProtocol";
import MealGuidance from "../Protocol/MealGuidance";
import SpecialistProtocols from "../Protocol/SpecialistProtocols";
import Assumptions from "../Protocol/Assumptions";
import MissingData from "../Protocol/MissingData";

import {
  adaptFuelingProtocol,
  adaptMealTimingWindows,
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
  // Onboarding's raw answers, kept alongside protocol so the weekly-box page
  // can read sessions_per_week (not part of the generated protocol JSON).
  const [userData, setUserData] = useState(null);

  const handleBack = () => navigate(-1);

  const handleViewWeeklyBox = () => {
    const weeklyBoxHandoff = {
      items: adaptWeeklyBoxItems(protocol.weekly_box_contents),
      totalProducts: protocol.box_total_products,
      frenchBrandPercentage: protocol.box_french_brand_percentage,
      assemblyNotes: adaptAssemblyNotes(protocol.assembly_notes),
      scienceCards: adaptScienceCards(protocol.science_cards),
      sessionsPerWeek: userData?.sessions_per_week ?? null,
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
    setUserData(handoff.userData || null);
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
        <button type="button" className="back-link" onClick={handleBack}>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <path
              d="M12 4l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("Back")}
        </button>

        <AthleteFuelingCard protocol={protocol} userData={userData} />

        <SessionProtocol
          fuelingProtocol={adaptFuelingProtocol(protocol.fueling_protocol)}
          scienceCards={adaptScienceCards(protocol.science_cards)}
        />

        <RaceDayProtocol raceDay={protocol.fueling_protocol?.race_day} />

        <MealGuidance
          mealTimingWindows={adaptMealTimingWindows(protocol.diet_protocol)}
          userData={userData}
          sessionFuelingPlan={protocol.session_fueling_plan}
          onDiscoverBox={handleViewWeeklyBox}
        />

        <SpecialistProtocols protocols={adaptSpecialistProtocols(protocol.active_specialist_protocols)} />

        <Assumptions assumptions={protocol.assumptions_made} />

        <MissingData flags={protocol.missing_data_flags} />
      </div>

      <CopyrightFooter />
    </div>
  );
}
