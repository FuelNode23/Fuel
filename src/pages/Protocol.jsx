import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

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
  const { user, logout } = useAuth();

  const [protocol, setProtocol] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error" | "empty"
  const [errorMessage, setErrorMessage] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);

  const handleBack = () => navigate(-1);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
          <div>
            <h1 className="protocol-page__title">{protocol.title || "Your Nutrition Protocol"}</h1>
            <p className="protocol-page__subtitle">
              Personalized fueling, recovery, and product guidance based on your onboarding profile.
            </p>
          </div>

          {user && (
            <div className="protocol-page__account">
              <span className="protocol-page__account-name">{user.fullName}</span>
              <button type="button" className="protocol-page__logout" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
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

        <SpecialistProtocols protocols={adaptSpecialistProtocols(protocol.active_specialist_protocols)} />

        <WeeklyBox
          items={adaptWeeklyBoxItems(protocol.weekly_box_contents)}
          totalProducts={protocol.box_total_products}
          frenchBrandPercentage={protocol.box_french_brand_percentage}
          assemblyNotes={adaptAssemblyNotes(protocol.assembly_notes)}
        />

        <ScienceCards cards={adaptScienceCards(protocol.science_cards)} />

        <Assumptions assumptions={protocol.assumptions_made} />

        <MissingData flags={protocol.missing_data_flags} />
      </div>
    </div>
  );
}