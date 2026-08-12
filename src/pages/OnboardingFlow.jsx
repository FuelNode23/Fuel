import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient, { submitOnboarding as postOnboarding } from "../api/client.js";
import { questions } from "../api/Questions.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import AccountBar from "../components/AccountBar.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import GeneratingOverlay from "../components/GeneratingOverlay.jsx";
import "../pages/Onboarding.css";

/**
 * JSON.stringify with object keys sorted, so two objects containing the
 * same data compare equal regardless of the order their keys were set in -
 * userData is built up incrementally as fields are touched, so its key
 * order won't generally match mapProfileToUserData's fixed return shape.
 */
function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => JSON.stringify(k) + ":" + stableStringify(value[k])).join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * Maps a saved AthleteProfile (GET /athletes/profile response shape) back
 * into the userData shape this wizard's fields expect, so a returning user
 * who logs in sees their existing answers instead of a blank form.
 */
function mapProfileToUserData(profile) {
  const sportProfiles = {};
  const sports = (profile.sports || []).map((s) => {
    sportProfiles[s.sport] = { discipline: s.discipline, level: s.experienceLevel };
    return s.sport;
  });

  return {
    name: profile.firstName,
    age: profile.age,
    gender: profile.gender,
    weight: profile.weightKg,
    height: profile.heightCm,
    sports,
    sport_profiles: sportProfiles,
    goals: profile.objectives || [],
    connectChoice: profile.connectChoice,
    sessions_per_week: profile.sessionsPerWeek,
    typical_distance: profile.weeklyDistanceKm,
    pace: profile.averagePace,
    avg_elevation: profile.averageElevation,
    session_time: profile.trainingTime,
    target_event: profile.racePlanned ? "Yes" : "No",
    event_name: profile.goalEvent,
    event_sport: profile.eventSport,
    event_format: profile.raceDistance,
    expected_event_time: profile.expectedEventTime,
    weeks_until_event: profile.weeksToEvent,
    target_time: profile.targetTime,
    event_location: profile.eventLocation,
    elevation_gain: profile.elevationGain,
    stomach_sensitivity: profile.stomachSensitivity,
    caffeine_intake: profile.caffeinePreference,
    diet_pattern: profile.regime,
    restrictions: profile.restrictions || [],
    preferred_formats: profile.preferredFormats || [],
    supplement_type: profile.supplements || [],
    delivery_day: profile.deliveryDay,
    nutrition_issue_history: profile.nutritionIssueHistory,
  };
}

/**
 * Drives the entire onboarding experience from the `questions` array.
 * Renders exactly one question per screen, tracks answers in state,
 * and submits the full userData object to the backend after the
 * last step.
 */
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [stepIndex, setStepIndex] = useState(0);
  const [userData, setUserData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Set when login pre-fills userData from an existing profile, so Finish
  // can detect "nothing changed since last time" and confirm before
  // spending an AI generation call on an identical protocol.
  const initialUserDataRef = useRef(null);
  const [showNoChangeConfirm, setShowNoChangeConfirm] = useState(false);

  // Pre-fill from an existing saved profile whenever there's an active
  // session on mount (e.g. logged in via the standalone /login page, then
  // clicked "Try FuelNode" from /landing) - otherwise a returning user
  // would see a blank form despite their profile existing.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    apiClient
      .get("/athletes/profile")
      .then(({ data }) => {
        if (cancelled) return;
        const mapped = mapProfileToUserData(data);
        initialUserDataRef.current = mapped;
        setUserData((prev) => (Object.keys(prev).length === 0 ? mapped : prev));
      })
      .catch(() => {
        // No saved profile yet (404) - proceed with a blank form, same
        // as any first-time visitor.
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Ref-based lock: blocks a second submitOnboarding() call from firing
  // (rapid double-click, StrictMode double-invoke, going back a step and
  // hitting Finish again) even before `submitting` state has re-rendered.
  const hasSubmittedRef = useRef(false);

  const totalSteps = questions.length;
  const rawQuestion = questions[stepIndex];

  const currentQuestion = rawQuestion.variants
    ? rawQuestion.variants[userData[rawQuestion.variantKey]] || rawQuestion.variants.default
    : rawQuestion;

  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  // Coerces raw <input> values before they land in state. Any field
  // declared with inputType: "number" in questions.js is stored as a
  // real Number (not a string) so the backend never receives "70"
  // where it expects 70. Empty string is kept as "" (not coerced to 0)
  // so required-field validation and empty placeholders still work.
  const coerceValue = (field, rawValue) => {
    if (field?.inputType === "number") {
      if (rawValue === "") return "";
      const parsed = Number(rawValue);
      return Number.isNaN(parsed) ? rawValue : parsed;
    }
    return rawValue;
  };

  const updateField = (name, value) => {
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const updateFieldAndDependents = (allFields, name, value) => {
    setUserData((prev) => {
      const next = { ...prev, [name]: value };
      allFields.forEach((f) => {
        if (f.dependsOn === name) {
          next[f.name] = "";
        }
      });
      return next;
    });
  };

  const toggleMultiSelect = (name, option) => {
    setUserData((prev) => {
      const current = prev[name] || [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [name]: next };
    });
  };

  const updateSportProfileField = (sport, fieldName, value) => {
    setUserData((prev) => {
      const sportProfiles = prev.sport_profiles || {};
      return {
        ...prev,
        sport_profiles: {
          ...sportProfiles,
          [sport]: {
            ...(sportProfiles[sport] || {}),
            [fieldName]: value,
          },
        },
      };
    });
  };

  const optionValue = (option) => (typeof option === "string" ? option : option.value);
  const optionDescription = (option) => (typeof option === "string" ? null : option.description);
  const optionIcon = (option) => (typeof option === "string" ? null : option.icon);

  const isGroupValid = (group) => {
    if (group.type === "multi-select") {
      return (userData[group.name] || []).length > 0;
    }
    return Boolean(userData[group.name]);
  };

  const isFieldValid = (field) =>
    (userData[field.name] ?? "").toString().trim().length > 0;

  const isStepValid = () => {
    if (currentQuestion.type === "text") {
      const fieldsValid = currentQuestion.fields.every(isFieldValid);
      const groupsValid = (currentQuestion.groups || []).every(isGroupValid);
      return fieldsValid && groupsValid;
    }
    if (currentQuestion.type === "select") {
      const mainValid = Boolean(userData[currentQuestion.name]);
      if (!mainValid) return false;

      const groupsValid = (currentQuestion.groups || []).every(isGroupValid);

      const cf = currentQuestion.conditionalFields;
      if (cf && userData[currentQuestion.name] === cf.when) {
        const fieldsValid = (cf.fields || []).every(isFieldValid);
        const moreValid = (cf.moreFields || []).every(isFieldValid);
        const cfGroupsValid = (cf.groups || []).every(isGroupValid);
        return groupsValid && fieldsValid && moreValid && cfGroupsValid;
      }
      return groupsValid;
    }
    if (currentQuestion.type === "multi-select") {
      const mainValid = (userData[currentQuestion.name] || []).length > 0;
      const groupsValid = (currentQuestion.groups || []).every(isGroupValid);
      return mainValid && groupsValid;
    }
    if (currentQuestion.type === "connect") {
      return Boolean(userData[currentQuestion.name]);
    }
    return true;
  };

  // Sends the full collected userData object to the backend. Called
  // when the user clicks "Finish" on the last step. This is the single
  // API call in the whole flow: postOnboarding() (submitOnboarding from
  // client.js) posts userData to POST /api/generate-with-profile, and
  // the backend's response IS the generated protocol JSON — no separate
  // "generate" or "fetch" call happens anywhere else. The endpoint URL
  // is defined ONLY in client.js, so it never drifts out of sync here.
  const submitOnboarding = async () => {
    // Guards against duplicate submissions: double-click, StrictMode
    // double-invoke, or returning to the last step and hitting Finish
    // again after a submission is already in flight or completed.
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    // Onboarding no longer requires signing in up front, so a new visitor
    // can reach Finish with no session at all. The generation endpoint
    // needs auth, so stash the answers and send them to log in instead of
    // firing a request that can only fail — completePendingOnboarding()
    // (already wired into both Login and Register right after auth
    // succeeds) resumes this exact submission once there's a real
    // session, so nothing they entered is lost.
    if (!user) {
      sessionStorage.setItem("pendingOnboarding", JSON.stringify(userData));
      navigate("/login");
      return;
    }

    console.log("Onboarding userData:", userData);
    setSubmitting(true);
    setSubmitError(null);
    try {
      const protocolResult = await postOnboarding(userData);

      // Mirror the handoff payload to sessionStorage so a refresh on
      // /protocol doesn't lose it — location.state doesn't survive
      // a hard reload, sessionStorage does (for the tab's lifetime).
      sessionStorage.setItem(
        "protocolHandoff",
        JSON.stringify({ onboardingResult: protocolResult, userData })
      );

      navigate("/protocol", { state: { onboardingResult: protocolResult, userData } });
    } catch (err) {
      if (err.response?.status === 401) {
        // Defensive fallback: there was a session when the `user` check
        // above ran, but the token expired or was cleared before this
        // request landed. apiClient's response interceptor already
        // cleared localStorage (token/user) - just redirect here. Stash
        // their answers so login can resume the submission instead of
        // losing everything.
        // Reset the lock so a resumed submission isn't blocked by it.
        hasSubmittedRef.current = false;
        sessionStorage.setItem("pendingOnboarding", JSON.stringify(userData));
        navigate("/login", { replace: false });
        return;
      }
      // The backend couldn't save the profile (500, network error, etc.).
      // Protocol renders entirely from userData already, so don't strand
      // the person on the last onboarding step — let them see their
      // protocol now and flag that the save didn't go through, so it can
      // be retried later instead of losing their answers.
      console.error("Onboarding submit failed, continuing with local data:", err);

      sessionStorage.setItem(
        "protocolHandoff",
        JSON.stringify({ userData, saveFailed: true })
      );

      navigate("/protocol", { state: { userData, saveFailed: true } });
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (stepIndex === totalSteps - 1) {
      const unchanged =
        initialUserDataRef.current &&
        stableStringify(userData) === stableStringify(initialUserDataRef.current);
      if (unchanged) {
        setShowNoChangeConfirm(true);
        return;
      }
      submitOnboarding();
      return;
    }
    setStepIndex((prev) => prev + 1);
  };

  const handleConfirmedSubmit = () => {
    setShowNoChangeConfirm(false);
    submitOnboarding();
  };

  const handleContinue = () => {
    if (!isStepValid()) return;
    goNext();
  };

  const handleConnectChoice = (value) => {
    updateField(currentQuestion.name, value);
    goNext();
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const selectedSports = userData.sports || [];

  const renderField = (field, siblingFields = []) => {
    const dependsOnValue = field.dependsOn ? userData[field.dependsOn] : null;
    const resolvedOptions = field.optionsBySport
      ? field.optionsBySport[dependsOnValue] || []
      : field.options || [];
    const isDependentAndUnready = field.dependsOn && !dependsOnValue;

    return (
      <div className="ob-field" key={field.name}>
        {field.type === "select" ? (
          <>
            <label className="ob-label">{t(field.label)}</label>
            <div className="ob-options">
              {resolvedOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={
                    "ob-option" +
                    (userData[field.name] === option ? " ob-option-active" : "")
                  }
                  onClick={() => updateField(field.name, option)}
                >
                  {t(option)}
                </button>
              ))}
            </div>
          </>
        ) : field.type === "dropdown" ? (
          <>
            <label className="ob-label" htmlFor={field.name}>
              {t(field.label)}
            </label>
            <select
              id={field.name}
              className="ob-select"
              value={userData[field.name] ?? ""}
              disabled={isDependentAndUnready}
              onChange={(e) =>
                updateFieldAndDependents(siblingFields, field.name, e.target.value)
              }
            >
              <option value="" disabled>
                {isDependentAndUnready ? t("Select sport first") : t(field.placeholder || "— Choose —")}
              </option>
              {resolvedOptions.map((option) => (
                <option key={option} value={option}>
                  {t(option)}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label className="ob-label" htmlFor={field.name}>
              {t(field.label)}
            </label>
            <input
              id={field.name}
              className="ob-input"
              type={field.inputType || "text"}
              value={userData[field.name] ?? ""}
              placeholder={t(field.placeholder || "")}
              onChange={(e) => updateField(field.name, coerceValue(field, e.target.value))}
            />
          </>
        )}
        {field.note && <p className="ob-field-note">{t(field.note)}</p>}
      </div>
    );
  };

  const renderGroup = (group) => {
    const isMulti = group.type === "multi-select";
    const current = userData[group.name];
    return (
      <div className="ob-field" key={group.name}>
        <label className="ob-label">{t(group.label)}</label>
        {group.dial && (
          <div className="ob-dial">
            <div className="ob-dial-ring">
              <span className="ob-dial-icon" aria-hidden="true">☀</span>
            </div>
          </div>
        )}
        <div className="ob-options">
          {group.options.map((option) => {
            const selected = isMulti
              ? (current || []).includes(option)
              : current === option;
            return (
              <button
                key={option}
                type="button"
                className={"ob-option" + (selected ? " ob-option-active" : "")}
                onClick={() =>
                  isMulti
                    ? toggleMultiSelect(group.name, option)
                    : updateField(group.name, option)
                }
              >
                {t(option)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Still checking localStorage for an existing session - render nothing
  // rather than flashing the (unauthenticated) wizard for a visitor who's
  // already logged in, since the profile pre-fill effect above depends on
  // `user` being settled first.
  if (authLoading) {
    return <div className="ob-page" />;
  }

  // No auth gate here anymore: onboarding is answerable anonymously, and
  // authentication only happens if/when Finish needs it (see
  // submitOnboarding above) - an existing session just means the wizard
  // pre-fills from the saved profile via the effect above.
  return (
    <div className="ob-page">
      <div className="ob-bg-glow">
        <div className="ob-bg-glow-top" />
      </div>

      <AccountBar />

      {showNoChangeConfirm && (
        <div className="ob-blocking-overlay" role="dialog" aria-modal="true">
          <div className="ob-confirm-card">
            <h2 className="ob-confirm-title">{t("No changes detected")}</h2>
            <p className="ob-confirm-text">
              {t(
                "Your answers are the same as your last submission. Do you want to continue and generate a new protocol anyway?"
              )}
            </p>
            <div className="ob-confirm-actions">
              <button
                type="button"
                className="ob-confirm-cancel"
                onClick={() => setShowNoChangeConfirm(false)}
              >
                {t("Go back and review")}
              </button>
              <button type="button" className="ob-continue" onClick={handleConfirmedSubmit}>
                {t("Continue anyway")}
              </button>
            </div>
          </div>
        </div>
      )}

      {submitting && <GeneratingOverlay />}

      <div className="ob-topbar">
        <button
          type="button"
          className="ob-back"
          onClick={handleBack}
          disabled={stepIndex === 0}
        >
          <span aria-hidden="true">←</span> {t("Back")}
        </button>
        {/* Signed-in visitors already get a language toggle from AccountBar
            above, so only render a second one here for anonymous visitors
            (AccountBar renders nothing when logged out). */}
        {!user && <LanguageToggle />}
      </div>

      <div className="ob-progress-wrap">
        <div className="ob-progress-row">
          <span className="ob-step-label">
            {t("Step")} {stepIndex + 1} {t("of")} {totalSteps}
          </span>
          <span className="ob-percent">{progress}%</span>
        </div>
        <div
          className="ob-progress-track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="ob-content">
        <div className="ob-brand">FuelNode</div>
        <h1 className="ob-title">{t(currentQuestion.title)}</h1>
        {currentQuestion.subtitle && currentQuestion.type === "select" && (
          <p className="ob-helper-text ob-title-subtitle">{t(currentQuestion.subtitle)}</p>
        )}

        <div className="ob-fields">
          {currentQuestion.type === "text" && (
            <>
              {currentQuestion.subtitle && (
                <p className="ob-helper-text">{t(currentQuestion.subtitle)}</p>
              )}

              {currentQuestion.card ? (
                <div className="ob-card">
                  <h2 className="ob-card-title">{t(currentQuestion.card.title)}</h2>
                  {currentQuestion.card.subtitle && (
                    <p className="ob-helper-text">{t(currentQuestion.card.subtitle)}</p>
                  )}
                  {currentQuestion.fields.map((field) =>
                    renderField(field, currentQuestion.fields)
                  )}
                  {currentQuestion.card.note && (
                    <p className="ob-note">{t(currentQuestion.card.note)}</p>
                  )}
                </div>
              ) : (
                currentQuestion.fields.map((field) =>
                  renderField(field, currentQuestion.fields)
                )
              )}

              {(currentQuestion.groups || []).map((group) => renderGroup(group))}

              {currentQuestion.note && <p className="ob-note">{t(currentQuestion.note)}</p>}
            </>
          )}

          {currentQuestion.type === "select" && (
            <>
              {currentQuestion.label && <label className="ob-label">{t(currentQuestion.label)}</label>}

              {currentQuestion.infoBanner && (
                <div className="ob-info-banner">
                  {currentQuestion.infoBanner.icon && (
                    <span className="ob-info-banner-icon" aria-hidden="true">
                      {currentQuestion.infoBanner.icon}
                    </span>
                  )}
                  <div className="ob-info-banner-text">
                    <span className="ob-info-banner-title">
                      {t(currentQuestion.infoBanner.title)}
                    </span>
                    <span className="ob-info-banner-body">
                      {t(currentQuestion.infoBanner.text)}
                    </span>
                  </div>
                </div>
              )}

              <div
                className={
                  "ob-options" + (currentQuestion.fullWidthOptions ? " ob-options-stacked" : "")
                }
              >
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      "ob-option" +
                      (currentQuestion.fullWidthOptions ? " ob-option-full" : "") +
                      (userData[currentQuestion.name] === option ? " ob-option-active" : "")
                    }
                    onClick={() => updateField(currentQuestion.name, option)}
                  >
                    {t(option)}
                  </button>
                ))}
              </div>

              {(currentQuestion.groups || []).map((group) => renderGroup(group))}

              {currentQuestion.conditionalFields &&
                userData[currentQuestion.name] === currentQuestion.conditionalFields.when && (
                  <>
                    {(currentQuestion.conditionalFields.fields || []).map((field) =>
                      renderField(field, currentQuestion.conditionalFields.fields)
                    )}
                    {(currentQuestion.conditionalFields.groups || []).map((group) =>
                      renderGroup(group)
                    )}
                    {(currentQuestion.conditionalFields.moreFields || []).map((field) =>
                      renderField(field, currentQuestion.conditionalFields.moreFields)
                    )}
                    {currentQuestion.conditionalFields.note && (
                      <p className="ob-note">{t(currentQuestion.conditionalFields.note)}</p>
                    )}
                  </>
                )}

              {currentQuestion.note && <p className="ob-note">{t(currentQuestion.note)}</p>}
              {currentQuestion.notes &&
                currentQuestion.notes.map((line, i) => (
                  <p className="ob-note" key={i}>
                    {t(line)}
                  </p>
                ))}
              {currentQuestion.noteBox && (
                <p className="ob-note ob-note-box">{t(currentQuestion.noteBox)}</p>
              )}
            </>
          )}

          {currentQuestion.type === "multi-select" && (
            <>
              {currentQuestion.subtitle && (
                <h2 className="ob-subtitle">{t(currentQuestion.subtitle)}</h2>
              )}
              {currentQuestion.helperText && (
                <p className="ob-helper-text">{t(currentQuestion.helperText)}</p>
              )}

              <div className="ob-options ob-options-cards">
                {currentQuestion.options.map((option) => {
                  const value = optionValue(option);
                  const description = optionDescription(option);
                  const icon = optionIcon(option);
                  const selected = (userData[currentQuestion.name] || []).includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      className={"ob-option ob-option-card" + (selected ? " ob-option-active" : "")}
                      onClick={() => toggleMultiSelect(currentQuestion.name, value)}
                    >
                      {icon && (
                        <span className="ob-option-icon-wrap" aria-hidden="true">
                          <span className="ob-option-icon">{icon}</span>
                        </span>
                      )}
                      <span className="ob-option-header">
                        <span className="ob-option-title">{t(value)}</span>
                        {(icon || description) && (
                          <span
                            className={
                              "ob-option-badge" + (selected ? " ob-option-badge-active" : "")
                            }
                          >
                            {selected ? t("Chosen") : t("Tap")}
                          </span>
                        )}
                      </span>
                      {description && (
                        <span className="ob-option-description">{t(description)}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {(currentQuestion.groups || []).map((group) => (
                <div className="ob-group" key={group.name}>
                  <h2 className="ob-subtitle">{t(group.label)}</h2>
                  <div className="ob-options">
                    {group.options.map((option) => {
                      const value = optionValue(option);
                      const isMulti = group.type === "multi-select";
                      const current = userData[group.name];
                      const selected = isMulti
                        ? (current || []).includes(value)
                        : current === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          className={"ob-option" + (selected ? " ob-option-active" : "")}
                          onClick={() =>
                            isMulti
                              ? toggleMultiSelect(group.name, value)
                              : updateField(group.name, value)
                          }
                        >
                          {t(value)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {currentQuestion.perSport &&
                selectedSports.map((sport) => (
                  <div className="ob-sport-panel" key={sport}>
                    <h2 className="ob-subtitle">
                      {currentQuestion.perSport.title.replace("{sport}", t(sport))}
                    </h2>
                    {currentQuestion.perSport.subtitle && (
                      <p className="ob-helper-text">{t(currentQuestion.perSport.subtitle)}</p>
                    )}

                    {currentQuestion.perSport.fields.map((field) => {
                      const options = field.optionsBySport
                        ? field.optionsBySport[sport] || []
                        : field.options || [];
                      const currentValue =
                        (userData.sport_profiles &&
                          userData.sport_profiles[sport] &&
                          userData.sport_profiles[sport][field.name]) ||
                        "";
                      return (
                        <div className="ob-field" key={field.name}>
                          <label className="ob-label">{t(field.label)}</label>
                          <div className="ob-options">
                            {options.map((option) => (
                              <button
                                key={option}
                                type="button"
                                className={
                                  "ob-option" +
                                  (currentValue === option ? " ob-option-active" : "")
                                }
                                onClick={() =>
                                  updateSportProfileField(sport, field.name, option)
                                }
                              >
                                {t(option)}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

              {currentQuestion.note && <p className="ob-note">{t(currentQuestion.note)}</p>}
            </>
          )}

          {currentQuestion.type === "connect" && (
            <div className="ob-connect">
              {currentQuestion.icon && (
                <div className="ob-connect-icon">{currentQuestion.icon}</div>
              )}
              {currentQuestion.subtitle && (
                <p className="ob-connect-subtitle">{t(currentQuestion.subtitle)}</p>
              )}
              <button
                type="button"
                className="ob-connect-primary"
                onClick={() => handleConnectChoice(currentQuestion.primaryAction.value)}
              >
                {t(currentQuestion.primaryAction.label)}
              </button>
              <button
                type="button"
                className="ob-connect-secondary"
                onClick={() => handleConnectChoice(currentQuestion.secondaryAction.value)}
              >
                {t(currentQuestion.secondaryAction.label)}
              </button>
              {currentQuestion.note && <p className="ob-note">{t(currentQuestion.note)}</p>}
            </div>
          )}
        </div>

        {submitError && <p className="ob-error">{submitError}</p>}
      </div>

      {currentQuestion.type !== "connect" && (
        <div className="ob-footer">
          <button
            type="button"
            className="ob-continue"
            onClick={handleContinue}
            disabled={!isStepValid() || submitting}
          >
            {submitting
              ? t("Submitting...")
              : stepIndex === totalSteps - 1
                ? t("Finish")
                : t("Continue")}
          </button>
        </div>
      )}

      <CopyrightFooter />
    </div>
  );
}