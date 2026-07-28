import { useState } from "react";
import { questions } from "../api/Questions.js";
import "../pages/Onboarding.css";

/**
 * Drives the entire onboarding experience from the `questions` array.
 * Renders exactly one question per screen, tracks answers in state,
 * and reports the full answers object via `onComplete` after the
 * last step.
 */
export default function OnboardingFlow({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const totalSteps = questions.length;
  const currentQuestion = questions[stepIndex];
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const updateField = (name, value) => {
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMultiSelect = (name, option) => {
    setAnswers((prev) => {
      const current = prev[name] || [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [name]: next };
    });
  };

  const isStepValid = () => {
    if (currentQuestion.type === "text") {
      return currentQuestion.fields.every(
        (field) => (answers[field.name] ?? "").toString().trim().length > 0
      );
    }
    if (currentQuestion.type === "select") {
      return Boolean(answers[currentQuestion.name]);
    }
    if (currentQuestion.type === "multi-select") {
      return (answers[currentQuestion.name] || []).length > 0;
    }
    return true;
  };

  const handleContinue = () => {
    if (!isStepValid()) return;

    if (stepIndex === totalSteps - 1) {
      onComplete?.(answers);
      return;
    }
    setStepIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="ob-page">
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

        <div className="ob-fields">
          {currentQuestion.type === "text" &&
            currentQuestion.fields.map((field) => (
              <div className="ob-field" key={field.name}>
                <label className="ob-label" htmlFor={field.name}>
                  {field.label}
                </label>
                <input
                  id={field.name}
                  className="ob-input"
                  type={field.inputType || "text"}
                  value={answers[field.name] ?? ""}
                  placeholder={field.placeholder || ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                />
              </div>
            ))}

          {currentQuestion.type === "select" && (
            <div className="ob-options">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={
                    "ob-option" +
                    (answers[currentQuestion.name] === option ? " ob-option-active" : "")
                  }
                  onClick={() => updateField(currentQuestion.name, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "multi-select" && (
            <div className="ob-options">
              {currentQuestion.options.map((option) => {
                const selected = (answers[currentQuestion.name] || []).includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    className={"ob-option" + (selected ? " ob-option-active" : "")}
                    onClick={() => toggleMultiSelect(currentQuestion.name, option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="ob-footer">
        <button
          type="button"
          className="ob-continue"
          onClick={handleContinue}
          disabled={!isStepValid()}
        >
          {stepIndex === totalSteps - 1 ? "Finish" : "Continue"}
        </button>
      </div>
    </div>
  );
}
