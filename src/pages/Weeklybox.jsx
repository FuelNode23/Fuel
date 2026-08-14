import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountBar from "../components/AccountBar.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import WeeklyBox from "../Protocol/WeeklyBox.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./Weeklybox.css";


/**
 * Reached from Protocol's "View your weekly box" button, which builds
 * { items, totalProducts, frenchBrandPercentage, assemblyNotes } (already
 * run through Protocoladapters.js) and hands it off via navigate() state
 * (fresh) or sessionStorage "weeklyBoxHandoff" (survives a hard refresh,
 * since location.state does not) - same pattern Protocol.jsx uses for its
 * own handoff from OnboardingFlow.
 */
export default function WeeklyBoxPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [box, setBox] = useState(null);
  // Which of the 3 box variants the athlete picked — lifted up from
  // WeeklyBox so the bottom "Continue" button can depend on it too, not
  // just each column's own "Choose this box" button.
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    let handoff = location.state;

    if (!handoff) {
      const stored = sessionStorage.getItem("weeklyBoxHandoff");
      if (stored) {
        try {
          handoff = JSON.parse(stored);
        } catch {
          handoff = null;
        }
      }
    }

    setBox(handoff);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No backend endpoint exists yet to persist which box variant was chosen
  // (see WeeklyBox.jsx), so this only keeps the choice in sessionStorage —
  // enough for the dashboard/next screen to read it back this session —
  // and moves on. Swap in a real save call once that endpoint exists.
  // tierHint defaults to "amateur" (the cheapest tier that actually
  // unlocks a box) regardless of which variant was picked; category
  // carries the chosen variant through so Subscriptions can flag it.
  const handleContinue = () => {
    if (!selectedVariant) return;
    sessionStorage.setItem("selectedBoxVariant", selectedVariant);
    navigate(`/subscription?from=weekly-box&tierHint=amateur&category=${selectedVariant}`);
  };

  return (
    <div className="weekly-box">
      <AccountBar />
      <div className="weekly-box__container">
        <button type="button" className="back-link" onClick={() => navigate("/protocol")}>
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
          {t("Back to the protocol")}
        </button>

        <div className="eyebrow">
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <rect x="3" y="7" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M3 7l7-4 7 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          {t("Box of the week")}
        </div>

        <h1 className="page-title">{t("Discover your FuelNode box")}</h1>
        <p className="page-subtitle">
          {t("Three options built around your profile, your protocol, and your preferences. Choose the one that fits you best this week.")}
        </p>

        {box ? (
          <>
            <WeeklyBox
              items={box.items}
              totalProducts={box.totalProducts}
              frenchBrandPercentage={box.frenchBrandPercentage}
              assemblyNotes={box.assemblyNotes}
              scienceCards={box.scienceCards}
              sessionsPerWeek={box.sessionsPerWeek}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />

            <div className="weekly-box__continue">
              {!selectedVariant && (
                <p className="page-subtitle weekly-box__continue-hint">
                  {t("Choose a box above to continue.")}
                </p>
              )}
              <button
                type="button"
                className="btn btn--primary"
                disabled={!selectedVariant}
                onClick={handleContinue}
              >
                {t("Continue →")}
              </button>
            </div>
          </>
        ) : (
          <p className="page-subtitle">
            {t("No box to show yet — generate a protocol first to see your weekly box.")}
          </p>
        )}

        <CopyrightFooter />
      </div>
    </div>
  );
}
