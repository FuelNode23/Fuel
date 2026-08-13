import { useNavigate } from "react-router-dom";
import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { Icon } from "../components/Icons.jsx";
import { GOAL_SHORT_LABELS } from "../data/mealGuidanceContent";
import {
  getISOWeek,
  computeHydrationRangeL,
  computeElectrolytesMg,
  computeOffDayKcal,
} from "../utils/fuelingEstimates";

/**
 * Page header + "Athlete fueling card" section. Replaces the old
 * AthleteSummary + MacroTargets components with the athlete-facing layout:
 * sport/goals/body stats on the left, computed daily + off-day targets on
 * the right. Every number comes straight from protocol.macro_targets /
 * protocol.fuelingRate (real backend fields) except hydration, electrolytes
 * and off-day calories, which have no field in the response at all and are
 * computed client-side — see src/utils/fuelingEstimates.js for the exact
 * (documented, non-AI) formulas.
 */
export default function AthleteFuelingCard({ protocol, userData }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const macros = protocol?.macro_targets || {};
  const fuelingRate = protocol?.fuelingRate;
  const weightKg = userData?.weight ? Number(userData.weight) : null;
  const heightCm = userData?.height;
  const sessionsPerWeek = userData?.sessions_per_week;
  const name = userData?.name || t("Athlete");

  const primarySport = (userData?.sports || [])[0];
  const sportProfile = primarySport ? userData?.sport_profiles?.[primarySport] : null;
  const disciplineLabel = sportProfile?.discipline ? `${sportProfile.discipline} ${primarySport}` : primarySport;

  const goals = (userData?.goals || []).map((g) => t(GOAL_SHORT_LABELS[g] || g));

  const trainingHydration = computeHydrationRangeL(weightKg, true);
  const trainingElectrolytes = computeElectrolytesMg(weightKg, true);
  const restHydration = computeHydrationRangeL(weightKg, false);
  const restElectrolytes = computeElectrolytesMg(weightKg, false);
  const offDayKcal = computeOffDayKcal(macros.bmr_kcal);

  return (
    <section className="protocol-section">
      <div className="fueling-header">
        <div>
          <span className="badge badge--active">{t("Week {n}", { n: getISOWeek() })}</span>
          <h1 className="fueling-header__title">{name}</h1>
          <p className="fueling-header__subtitle">
            {t("This week, your plan connects your daily intake, workout fueling, and recovery meals.")}
          </p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={() => navigate("/onboarding")}>
          {t("Update protocol")}
        </button>
      </div>

      <div className="fueling-notices">
        <div className="warning-card">
          <span className="warning-card__icon" aria-hidden="true">
            <Icon.Shield width={16} height={16} />
          </span>
          <div className="warning-card__body">
            <span>{t("The targets below were raised to the safety floor — do not go under them.")}</span>
            <span className="warning-card__sub">
              {t(
                "Your training load is estimated from the weekly volume you reported — neither your actual intake nor your body composition has been measured."
              )}
            </span>
          </div>
        </div>
        <div className="warning-card">
          <span className="warning-card__icon" aria-hidden="true">
            <Icon.Droplets width={16} height={16} />
          </span>
          <span>
            {t(
              "These volumes are an indicative range: drink to thirst. Do not force fluid beyond it — overdrinking during exercise risks hyponatremia."
            )}
          </span>
        </div>
        <div className="warning-card">
          <span className="warning-card__icon" aria-hidden="true">
            <Icon.Shield width={16} height={16} />
          </span>
          <span>
            {t(
              "This protocol is not medical advice and recommends no supplements. Iron in particular should never be supplemented without blood work and medical advice."
            )}
          </span>
        </div>
      </div>

      <h2 className="protocol-section__title section-title-icon">
        <Icon.Zap width={18} height={18} />
        {t("Athlete fueling card")}
      </h2>

      <div className="athlete-fueling-grid">
        <div className="athlete-stat-col">
          <div className="athlete-stat-row athlete-stat-row--2">
            <div className="athlete-stat-tile">
              <span className="athlete-stat-tile__label">{t("Sport")}</span>
              <div className="athlete-stat-tile__value">{primarySport ? t(primarySport) : "—"}</div>
              {disciplineLabel && <div className="athlete-stat-tile__sub">{disciplineLabel}</div>}
            </div>
            <div className="athlete-stat-tile">
              <span className="athlete-stat-tile__label">{t("Goals")}</span>
              <div className="athlete-stat-tile__pills">
                {goals.length > 0 ? (
                  goals.map((g) => (
                    <span className="pill" key={g}>
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="athlete-stat-tile__sub">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="athlete-stat-row athlete-stat-row--3">
            <div className="athlete-stat-tile">
              <span className="athlete-stat-tile__label">{t("Sessions / week")}</span>
              <div className="athlete-stat-tile__value">{sessionsPerWeek ?? "—"}</div>
            </div>
            <div className="athlete-stat-tile">
              <span className="athlete-stat-tile__label">{t("Height")}</span>
              <div className="athlete-stat-tile__value">{heightCm ? `${heightCm} cm` : "—"}</div>
            </div>
            <div className="athlete-stat-tile">
              <span className="athlete-stat-tile__label">{t("Weight")}</span>
              <div className="athlete-stat-tile__value">{weightKg ? `${weightKg} kg` : "—"}</div>
            </div>
          </div>
        </div>

        <div className="daily-targets-panel">
          <span className="daily-targets-panel__label">{t("Daily targets")}</span>

          {fuelingRate?.value != null && (
            <div className="fueling-rate-tile">
              <span className="fueling-rate-tile__label">
                <Icon.Zap width={13} height={13} />
                {t("Fueling rate")}
              </span>
              <span className="fueling-rate-tile__value">
                {fuelingRate.value} {fuelingRate.unit}
              </span>
            </div>
          )}

          <div className="daily-targets-grid">
            {macros.training_day_intake_kcal != null && (
              <div className="athlete-stat-tile">
                <Icon.Zap width={14} height={14} className="athlete-stat-tile__icon" />
                <span className="athlete-stat-tile__value">{macros.training_day_intake_kcal}</span>
                <span className="athlete-stat-tile__sub">{t("kcal on training day")}</span>
              </div>
            )}
            {macros.carbs_hard_day_g != null && (
              <div className="athlete-stat-tile">
                <Icon.Wind width={14} height={14} className="athlete-stat-tile__icon" />
                <span className="athlete-stat-tile__value">{macros.carbs_hard_day_g}g</span>
                <span className="athlete-stat-tile__sub">{t("carbs")}</span>
              </div>
            )}
            {macros.protein_g_per_day != null && (
              <div className="athlete-stat-tile">
                <Icon.Shield width={14} height={14} className="athlete-stat-tile__icon" />
                <span className="athlete-stat-tile__value">{macros.protein_g_per_day}g</span>
                <span className="athlete-stat-tile__sub">{t("proteins")}</span>
              </div>
            )}
            {macros.fat_g_per_day != null && (
              <div className="athlete-stat-tile">
                <Icon.Droplets width={14} height={14} className="athlete-stat-tile__icon" />
                <span className="athlete-stat-tile__value">{macros.fat_g_per_day}g</span>
                <span className="athlete-stat-tile__sub">{t("fats")}</span>
              </div>
            )}
            {trainingHydration && (
              <div className="athlete-stat-tile">
                <Icon.Droplets width={14} height={14} className="athlete-stat-tile__icon" />
                <span className="athlete-stat-tile__value">
                  {trainingHydration.low}–{trainingHydration.high}L
                </span>
                <span className="athlete-stat-tile__sub">{t("total hydration · to thirst")}</span>
              </div>
            )}
            {trainingElectrolytes != null && (
              <div className="athlete-stat-tile">
                <Icon.Droplets width={14} height={14} className="athlete-stat-tile__icon" />
                <span className="athlete-stat-tile__value">{trainingElectrolytes}mg</span>
                <span className="athlete-stat-tile__sub">{t("electrolytes")}</span>
              </div>
            )}
          </div>

          <p className="daily-targets-panel__footnote">
            {macros.rationale ||
              t(
                "Computed for a {session_time} session, from your training load, sport, level, and body profile.",
                { session_time: userData?.session_time ? t(userData.session_time).toLowerCase() : t("your usual") }
              )}
          </p>
        </div>
      </div>

      <div className="card off-day-panel">
        <h3 className="off-day-panel__title">{t("Your off-day targets")}</h3>
        <div className="off-day-grid">
          {offDayKcal != null && (
            <div className="off-day-stat">
              <span className="off-day-stat__label">{t("Calories")}</span>
              <span className="off-day-stat__value">{offDayKcal}</span>
            </div>
          )}
          {macros.carbs_rest_day_g != null && (
            <div className="off-day-stat">
              <span className="off-day-stat__label">{t("Carbs")}</span>
              <span className="off-day-stat__value">{macros.carbs_rest_day_g}g</span>
            </div>
          )}
          {macros.protein_g_per_day != null && (
            <div className="off-day-stat">
              <span className="off-day-stat__label">{t("Proteins")}</span>
              <span className="off-day-stat__value">{macros.protein_g_per_day}g</span>
            </div>
          )}
          {macros.fat_g_per_day != null && (
            <div className="off-day-stat">
              <span className="off-day-stat__label">{t("Fats")}</span>
              <span className="off-day-stat__value">{macros.fat_g_per_day}g</span>
            </div>
          )}
          {restHydration && (
            <div className="off-day-stat">
              <span className="off-day-stat__label">{t("Total Hydration")}</span>
              <span className="off-day-stat__value">
                {restHydration.low}–{restHydration.high}L
              </span>
            </div>
          )}
          {restElectrolytes != null && (
            <div className="off-day-stat">
              <span className="off-day-stat__label">{t("Electrolytes")}</span>
              <span className="off-day-stat__value">{restElectrolytes}mg</span>
            </div>
          )}
        </div>
        <p className="off-day-panel__footnote">
          {t(
            "Off-day targets correspond to nutrition guidance for days without training: fewer total carbs, calmer hydration, but still enough protein and quality fats to support recovery and next-day readiness."
          )}
        </p>
      </div>
    </section>
  );
}
