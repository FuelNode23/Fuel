import { useEffect, useState } from "react";
import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

// Rotate through progress-flavored stages so a ~60s wait reads as real work happening
const STAGES = [
  "Analyzing your body metrics and goals",
  "Calculating your optimal macro split",
  "Cross-referencing hundreds of food combinations",
  "Balancing protein, carbs, and fats for your training load",
  "Fine-tuning fueling timing around your schedule",
  "Packaging your personalized protocol",
];

// Bite-sized nutrition facts to keep users engaged instead of staring at a spinner
const FACTS = [
  "Your muscles keep using protein for up to 24 hours after a workout to repair and grow.",
  "Spreading protein evenly across meals builds more muscle than loading it all at dinner.",
  "Carbs before endurance training top off glycogen stores your muscles burn for fuel.",
  "Drinking water before meals can improve digestion and help you feel fuller sooner.",
  "Healthy fats help your body absorb vitamins A, D, E, and K from your meals.",
  "Post-workout, your body is primed to replenish glycogen up to 2x faster than at rest.",
];

const STAGE_INTERVAL_MS = 8000;
const FACT_INTERVAL_MS = 5500;
const EXPECTED_DURATION_S = 60;

export default function LoadingState() {
  const { t } = useLanguage();
  const [stageIndex, setStageIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, STAGE_INTERVAL_MS);
    const factTimer = setInterval(() => {
      setFactIndex((i) => (i + 1) % FACTS.length);
    }, FACT_INTERVAL_MS);
    const clock = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      clearInterval(stageTimer);
      clearInterval(factTimer);
      clearInterval(clock);
    };
  }, []);

  // Never quite reaches 100% — the real response swaps this view out when it lands
  const progressPct = Math.min((elapsed / EXPECTED_DURATION_S) * 100, 96);

  return (
    <div className="protocol-status protocol-status--loading" role="status" aria-live="polite">
      <div className="protocol-loading-orbit" aria-hidden="true">
        <div className="protocol-loading-orbit__ring" />
        <div className="protocol-loading-orbit__ring protocol-loading-orbit__ring--delay" />
        <div className="protocol-loading-orbit__core" />
      </div>

      <p className="protocol-status__title">{t("Generating your personalized nutrition protocol")}</p>

      <p className="protocol-status__text protocol-loading__stage" key={stageIndex}>
        {t(STAGES[stageIndex])}
        <span className="protocol-loading__dots" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>

      <div className="protocol-loading__progress" aria-hidden="true">
        <div className="protocol-loading__progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="protocol-loading__fact" key={factIndex}>
        <span className="protocol-loading__fact-label">{t("Did you know?")}</span>
        <span>{t(FACTS[factIndex])}</span>
      </div>

      <p className="protocol-loading__note">
        {t("This usually takes under a minute — thanks for your patience.")}
      </p>
    </div>
  );
}
