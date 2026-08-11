import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountBar from "../components/AccountBar.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import WeeklyBox from "../Protocol/WeeklyBox.jsx";
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
  const [box, setBox] = useState(null);

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
          Back to the protocol
        </button>

        <div className="eyebrow">
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <rect x="3" y="7" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M3 7l7-4 7 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          Box of the week
        </div>

        <h1 className="page-title">Your FuelNode box</h1>
        <p className="page-subtitle">
          The products assembled for your protocol, based on your profile and preferences.
        </p>

        {box ? (
          <WeeklyBox
            items={box.items}
            totalProducts={box.totalProducts}
            frenchBrandPercentage={box.frenchBrandPercentage}
            assemblyNotes={box.assemblyNotes}
          />
        ) : (
          <p className="page-subtitle">
            No box to show yet — generate a protocol first to see your weekly box.
          </p>
        )}

        <CopyrightFooter />
      </div>
    </div>
  );
}
