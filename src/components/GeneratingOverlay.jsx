import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./GeneratingOverlay.css";

// Rotates every STAGE_INTERVAL_MS so the wait reads as visible progress
// through real steps, not a frozen spinner.
const STAGES = [
  "Analyzing your body metrics and goals...",
  "Calculating your optimal macro split...",
  "Cross-referencing 500+ food combinations for your preferences...",
  "Balancing protein, carbs, and fats for your activity level...",
  "Fine-tuning meal timing around your schedule...",
  "Almost there — packaging your personalized protocol...",
];

// Rotates independently of the stage messages so the minute-long wait has
// something worth reading on its own, tied to the product (nutrition).
const FACTS = [
  "Did you know? Your muscles keep using protein for up to 24 hours after a workout to repair and grow.",
  "Fun fact: Spreading protein evenly across meals builds more muscle than eating it all at dinner.",
  "Tip: Drinking water before meals can improve digestion and help you feel fuller.",
  "Did you know? Carbs restock the glycogen your muscles burn through during endurance training.",
  "Fun fact: Bananas are rich in potassium, which helps prevent exercise-induced muscle cramps.",
  "Tip: Eating within 30-60 minutes after training speeds up glycogen recovery.",
  "Did you know? Caffeine 30-60 minutes before a session can measurably boost endurance performance.",
  "Fun fact: Beetroot juice is a natural source of nitrates that can improve running economy.",
];

const STAGE_INTERVAL_MS = 9000;
const FACT_INTERVAL_MS = 6000;
const PROGRESS_TICK_MS = 350;
const PROGRESS_CAP = 96;

/**
 * Full-screen overlay shown while the backend calls out to Claude to build
 * the athlete's protocol (can take up to a minute). A bare spinner reads as
 * broken over that long, so this rotates through generation "stages" and
 * nutrition fun facts, plus a fake progress bar that creeps toward 96% and
 * deliberately never claims 100% until the real response lands — the wait
 * feels like visible progress instead of a stalled screen.
 */
export default function GeneratingOverlay() {
  const { t } = useLanguage();
  const [stageIndex, setStageIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    const id = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
    }, STAGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FACTS.length);
    }, FACT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Eases toward the cap: big steps early, tiny steps as it nears 96%,
    // so it never visibly stalls but also never looks "done" too early.
    const id = setInterval(() => {
      setProgress((prev) => {
        if (prev >= PROGRESS_CAP) return PROGRESS_CAP;
        const remaining = PROGRESS_CAP - prev;
        return Math.min(PROGRESS_CAP, prev + Math.max(0.4, remaining * 0.045));
      });
    }, PROGRESS_TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="go-overlay" role="status" aria-live="polite">
      <div className="go-card">
        <div className="go-spinner" aria-hidden="true" />

        <p key={`stage-${stageIndex}`} className="go-stage">
          {t(STAGES[stageIndex])}
        </p>

        <div
          className="go-progress-track"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="go-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="go-progress-label">{Math.round(progress)}%</span>

        <div className="go-fact" key={`fact-${factIndex}`}>
          <span className="go-fact-tag">{t("Nutrition fact")}</span>
          <p className="go-fact-text">{t(FACTS[factIndex])}</p>
        </div>

        <p className="go-note">
          {t("This can take up to a minute — please don't close this page.")}
        </p>
      </div>
    </div>
  );
}
