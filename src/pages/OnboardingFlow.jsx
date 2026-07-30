import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client.js";
import { questions } from "../api/Questions.js";
import "../pages/Onboarding.css";

/**
 * Drives the entire onboarding experience from the `questions` array.
 * Renders exactly one question per screen, tracks answers in state,
 * and submits the full userData object to the backend after the
 * last step.
 */
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [userData, setUserData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const totalSteps = questions.length;
  const rawQuestion = questions[stepIndex];

  const currentQuestion = rawQuestion.variants
    ? rawQuestion.variants[userData[rawQuestion.variantKey]] || rawQuestion.variants.default
    : rawQuestion;

  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

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
  // when the user clicks "Finish" on the last step.
  const submitOnboarding = async () => {
    console.log("Onboarding userData:", userData);
    setSubmitting(true);
    setSubmitError(null);
    try {
     const response = await apiClient.post("/onboarding", userData);
      navigate("/landing", { state: { onboardingResult: response.data } });
    } catch (err) {
      if (err.response?.status === 401) {
        // apiClient's response interceptor already cleared localStorage
        // (token/user) on 401 — we just need to redirect here.
        navigate("/login", { replace: true });
        return;
      }
      const message =
        err.response?.data?.message ||
        "Something went wrong submitting your answers. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (stepIndex === totalSteps - 1) {
      submitOnboarding();
      return;
    }
    setStepIndex((prev) => prev + 1);
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
            <label className="ob-label">{field.label}</label>
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
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : field.type === "dropdown" ? (
          <>
            <label className="ob-label" htmlFor={field.name}>
              {field.label}
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
                {isDependentAndUnready ? "Select sport first" : field.placeholder || "— Choose —"}
              </option>
              {resolvedOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label className="ob-label" htmlFor={field.name}>
              {field.label}
            </label>
            <input
              id={field.name}
              className="ob-input"
              type={field.inputType || "text"}
              value={userData[field.name] ?? ""}
              placeholder={field.placeholder || ""}
              onChange={(e) => updateField(field.name, e.target.value)}
            />
          </>
        )}
        {field.note && <p className="ob-field-note">{field.note}</p>}
      </div>
    );
  };

  const renderGroup = (group) => {
    const isMulti = group.type === "multi-select";
    const current = userData[group.name];
    return (
      <div className="ob-field" key={group.name}>
        <label className="ob-label">{group.label}</label>
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
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="ob-page">
      <div className="ob-bg-glow">
        <div className="ob-bg-glow-top" />
      </div>

      <div className="ob-topbar">
        <button
          type="button"
          className="ob-back"
          onClick={handleBack}
          disabled={stepIndex === 0}
        >
          <span aria-hidden="true">←</span> Back
        </button>
        <div className="ob-lang">FR</div>
      </div>

      <div className="ob-progress-wrap">
        <div className="ob-progress-row">
          <span className="ob-step-label">
            Step {stepIndex + 1} of {totalSteps}
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
        <h1 className="ob-title">{currentQuestion.title}</h1>
        {currentQuestion.subtitle && currentQuestion.type === "select" && (
          <p className="ob-helper-text ob-title-subtitle">{currentQuestion.subtitle}</p>
        )}

        <div className="ob-fields">
          {currentQuestion.type === "text" && (
            <>
              {currentQuestion.subtitle && (
                <p className="ob-helper-text">{currentQuestion.subtitle}</p>
              )}

              {currentQuestion.card ? (
                <div className="ob-card">
                  <h2 className="ob-card-title">{currentQuestion.card.title}</h2>
                  {currentQuestion.card.subtitle && (
                    <p className="ob-helper-text">{currentQuestion.card.subtitle}</p>
                  )}
                  {currentQuestion.fields.map((field) =>
                    renderField(field, currentQuestion.fields)
                  )}
                  {currentQuestion.card.note && (
                    <p className="ob-note">{currentQuestion.card.note}</p>
                  )}
                </div>
              ) : (
                currentQuestion.fields.map((field) =>
                  renderField(field, currentQuestion.fields)
                )
              )}

              {(currentQuestion.groups || []).map((group) => renderGroup(group))}

              {currentQuestion.note && <p className="ob-note">{currentQuestion.note}</p>}
            </>
          )}

          {currentQuestion.type === "select" && (
            <>
              {currentQuestion.label && <label className="ob-label">{currentQuestion.label}</label>}

              {currentQuestion.infoBanner && (
                <div className="ob-info-banner">
                  {currentQuestion.infoBanner.icon && (
                    <span className="ob-info-banner-icon" aria-hidden="true">
                      {currentQuestion.infoBanner.icon}
                    </span>
                  )}
                  <div className="ob-info-banner-text">
                    <span className="ob-info-banner-title">
                      {currentQuestion.infoBanner.title}
                    </span>
                    <span className="ob-info-banner-body">
                      {currentQuestion.infoBanner.text}
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
                    {option}
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
                      <p className="ob-note">{currentQuestion.conditionalFields.note}</p>
                    )}
                  </>
                )}

              {currentQuestion.note && <p className="ob-note">{currentQuestion.note}</p>}
              {currentQuestion.notes &&
                currentQuestion.notes.map((line, i) => (
                  <p className="ob-note" key={i}>
                    {line}
                  </p>
                ))}
            </>
          )}

          {currentQuestion.type === "multi-select" && (
            <>
              {currentQuestion.subtitle && (
                <h2 className="ob-subtitle">{currentQuestion.subtitle}</h2>
              )}
              {currentQuestion.helperText && (
                <p className="ob-helper-text">{currentQuestion.helperText}</p>
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
                        <span className="ob-option-title">{value}</span>
                        {(icon || description) && (
                          <span
                            className={
                              "ob-option-badge" + (selected ? " ob-option-badge-active" : "")
                            }
                          >
                            {selected ? "Chosen" : "Tap"}
                          </span>
                        )}
                      </span>
                      {description && (
                        <span className="ob-option-description">{description}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {(currentQuestion.groups || []).map((group) => (
                <div className="ob-group" key={group.name}>
                  <h2 className="ob-subtitle">{group.label}</h2>
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
                          {value}
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
                      {currentQuestion.perSport.title.replace("{sport}", sport)}
                    </h2>
                    {currentQuestion.perSport.subtitle && (
                      <p className="ob-helper-text">{currentQuestion.perSport.subtitle}</p>
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
                          <label className="ob-label">{field.label}</label>
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
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

              {currentQuestion.note && <p className="ob-note">{currentQuestion.note}</p>}
            </>
          )}

          {currentQuestion.type === "connect" && (
            <div className="ob-connect">
              {currentQuestion.icon && (
                <div className="ob-connect-icon">{currentQuestion.icon}</div>
              )}
              {currentQuestion.subtitle && (
                <p className="ob-connect-subtitle">{currentQuestion.subtitle}</p>
              )}
              <button
                type="button"
                className="ob-connect-primary"
                onClick={() => handleConnectChoice(currentQuestion.primaryAction.value)}
              >
                {currentQuestion.primaryAction.label}
              </button>
              <button
                type="button"
                className="ob-connect-secondary"
                onClick={() => handleConnectChoice(currentQuestion.secondaryAction.value)}
              >
                {currentQuestion.secondaryAction.label}
              </button>
              {currentQuestion.note && <p className="ob-note">{currentQuestion.note}</p>}
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
              ? "Submitting..."
              : stepIndex === totalSteps - 1
              ? "Finish"
              : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}