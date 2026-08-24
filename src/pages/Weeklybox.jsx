import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountBar from "../components/AccountBar.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import WeeklyBox from "../Protocol/WeeklyBox.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { getLatestProtocol } from "../api/client.js";
import { adaptWeeklyBoxItems, adaptAssemblyNotes, adaptScienceCards } from "../api/Protocoladapters";
import "./Weeklybox.css";


/**
 * Reached either from Protocol's "View your weekly box" button, which
 * builds { items, totalProducts, frenchBrandPercentage, assemblyNotes }
 * (already run through Protocoladapters.js) and hands it off via
 * navigate() state (fresh) or sessionStorage "weeklyBoxHandoff" (survives
 * a hard refresh, since location.state does not) - or directly, via the
 * top-nav "Box hebdomadaire" link, which never goes through Protocol.jsx
 * at all. That handoff is session-only and was never persisted, so a real
 * account with a real saved protocol can land here with nothing to show
 * (a fresh login, a new tab/device, sessionStorage cleared on logout) -
 * falls back to GET /protocol/latest in that case, same as Protocol.jsx.
 */
export default function WeeklyBoxPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  // Which of the 3 box variants the athlete picked — lifted up from
  // WeeklyBox so the bottom "Continue" button can depend on it too, not
  // just each column's own "Choose this box" button.
  const [selectedVariant, setSelectedVariant] = useState(null);

  // A product swap (see WeeklyBox.jsx's ProductSwapPicker) already
  // persisted itself server-side by the time this fires - this just
  // updates the canonical items list so every derived view (all three
  // box-variant columns, all built from this same array) reflects the
  // change immediately, without a full re-fetch. Matched on
  // (protocol_slot, product_name) together, not slot alone - a box can
  // have more than one item sharing a slot (confirmed on real generated
  // boxes), and matching by slot only would silently overwrite every
  // item in that slot instead of just the one that was actually edited.
  // previousProductName is the canonical name ProductSwapPicker resolved
  // (not necessarily what was displayed - see boxVariants.js).
  const handleItemSwapped = (updatedItem, previousProductName) => {
    setBox((prev) => {
      if (!prev) return prev;
      const items = prev.items.map((item) =>
        item?.protocol_slot === updatedItem?.protocol_slot && item?.product_name === previousProductName
          ? updatedItem
          : item
      );
      return { ...prev, items };
    });
  };

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

    if (handoff) {
      setBox(handoff);
      setLoading(false);
      return;
    }

    getLatestProtocol()
      .then((data) => {
        const protocol = JSON.parse(data.responseJson);
        setBox({
          items: adaptWeeklyBoxItems(protocol.weekly_box_contents),
          totalProducts: protocol.box_total_products,
          frenchBrandPercentage: protocol.box_french_brand_percentage,
          assemblyNotes: adaptAssemblyNotes(protocol.assembly_notes),
          scienceCards: adaptScienceCards(protocol.science_cards),
          sessionsPerWeek: data.athleteProfile?.sessionsPerWeek ?? null,
        });
      })
      .catch(() => setBox(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No backend endpoint exists yet to persist which box variant was chosen
  // (see WeeklyBox.jsx), so this only keeps the choice in sessionStorage —
  // enough for the dashboard/next screen to read it back this session —
  // and moves on. Swap in a real save call once that endpoint exists.
  // tierHint defaults to "amateur" (the cheapest tier that actually
  // unlocks a box) regardless of which variant was picked; category
  // carries the chosen variant through so Subscriptions can flag it.
  //
  // Always Subscription next, real account or not - Account.jsx (reached
  // from there) is where a draft session actually creates its account now,
  // password and all (see its handleRegister), replacing the old separate
  // /create-account step that used to run before Subscription.
  const handleContinue = () => {
    if (!selectedVariant) return;
    sessionStorage.setItem("selectedBoxVariant", selectedVariant);
    const query = `from=weekly-box&tierHint=amateur&category=${selectedVariant}`;
    navigate(`/subscription?${query}`);
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

        {loading ? (
          <p className="page-subtitle">{t("Loading your box...")}</p>
        ) : box ? (
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
              onItemSwapped={handleItemSwapped}
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
          <div className="weekly-box__continue">
            <p className="page-subtitle weekly-box__continue-hint">
              {t("No box to show yet — generate a protocol first to see your weekly box.")}
            </p>
            <button type="button" className="btn btn--primary" onClick={() => navigate("/onboarding")}>
              {t("Start onboarding")}
            </button>
          </div>
        )}

        <CopyrightFooter />
      </div>
    </div>
  );
}
