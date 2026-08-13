import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { Icon } from "../components/Icons.jsx";

// fueling_protocol.race_day ships as empty strings ("") on every field
// until the athlete has a goal event within a few weeks — confirmed
// against real responses (populated when weeks_to_event is small,
// otherwise every key below is "").
const TIMELINE = [
  { key: "wake_up", label: "Wake up" },
  { key: "t_minus_90", label: "T-90 min" },
  { key: "t_minus_60", label: "T-60 min" },
  { key: "t_minus_30", label: "T-30 min" },
  { key: "t_minus_15", label: "T-15 min" },
  { key: "during_race", label: "During the race" },
  { key: "finish", label: "Race finish" },
];

function hasContent(raceDay) {
  if (!raceDay) return false;
  const hasTimelineText = TIMELINE.some((step) => raceDay[step.key]);
  const hasProducts = Array.isArray(raceDay.products) && raceDay.products.length > 0;
  return hasTimelineText || hasProducts || Boolean(raceDay.rationale);
}

/**
 * Only rendered once protocol.fueling_protocol.race_day actually has
 * content — the backend leaves every field an empty string until the
 * athlete's goal event is close enough to warrant a race-day plan, so an
 * always-visible empty card would be misleading.
 */
export default function RaceDayProtocol({ raceDay }) {
  const { t } = useLanguage();

  if (!hasContent(raceDay)) return null;

  const steps = TIMELINE.filter((step) => raceDay[step.key]);

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title section-title-icon">
        <Icon.CalendarCheck width={18} height={18} />
        {t("Race day")}
      </h2>

      <div className="card session-stage-card">
        {raceDay.rationale && (
          <div className="session-stage-card__text-box">
            <p>{raceDay.rationale}</p>
          </div>
        )}

        {Array.isArray(raceDay.products) && raceDay.products.length > 0 && (
          <div className="session-stage-card__product-box">
            <span className="session-stage-card__product-label">{t("Box product")}</span>
            <span className="session-stage-card__product-value">{raceDay.products.join(", ")}</span>
          </div>
        )}

        {steps.length > 0 && (
          <dl className="meal-card__details">
            {steps.map((step) => (
              <div className="detail-row" key={step.key}>
                <dt>{t(step.label)}</dt>
                <dd>{raceDay[step.key]}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
