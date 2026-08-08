import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient, { submitOnboarding as postOnboarding } from "../api/client.js";
import { questions } from "../api/Questions.js";
import { useAuth } from "../context/AuthContext.jsx";
import AccountBar from "../components/AccountBar.jsx";
import "../pages/Onboarding.css";

/**
 * English -> French dictionary for every user-facing string that comes
 * out of `questions.js`, plus the static UI chrome in this component
 * (Back / Continue / Finish / Step X of Y / etc).
 *
 * IMPORTANT: this only translates what's *displayed*. The values stored
 * in `userData` (and sent to the backend) always stay the original
 * English strings from questions.js — translation is purely a render-time
 * lookup, so the API payload never changes shape based on language.
 */
const translations = {
  // Chrome
  Back: "Retour",
  Continue: "Continuer",
  Finish: "Terminer",
  "Submitting...": "Envoi en cours...",
  Step: "Étape",
  of: "sur",
  Chosen: "Choisi",
  Tap: "Toucher",
  "Select sport first": "Choisir un sport d'abord",

  // Auth gate (Step 1: create account / sign in)
  "Create your account": "Créez votre compte",
  "Log in": "Se connecter",
  "Create an account to save your answers and get your personalized nutrition protocol.":
    "Créez un compte pour enregistrer vos réponses et obtenir votre protocole nutritionnel personnalisé.",
  "Full name": "Nom complet",
  "Enter your full name": "Entrez votre nom complet",
  Email: "E-mail",
  "Enter your email": "Entrez votre e-mail",
  Password: "Mot de passe",
  "Enter your password": "Entrez votre mot de passe",
  "Already have an account? Log in": "Vous avez déjà un compte ? Connectez-vous",
  "Need an account? Sign up": "Besoin d'un compte ? Inscrivez-vous",
  "Sign Up": "S'inscrire",
  "Creating account...": "Création du compte...",
  "Logging in...": "Connexion en cours...",
  "Password must be at least 8 characters long.": "Le mot de passe doit contenir au moins 8 caractères.",
  "Registration failed. Please try again.": "Échec de l'inscription. Veuillez réessayer.",
  "Login failed. Please check your credentials.": "Échec de la connexion. Veuillez vérifier vos identifiants.",

  // Step 1
  "Tell us about yourself": "Parlez-nous de vous",
  "First name": "Prénom",
  "Enter your name": "Entrez votre nom",
  Age: "Âge",
  "Enter your age": "Entrez votre âge",
  Gender: "Genre",
  Male: "Homme",
  Female: "Femme",
  Other: "Autre",

  // Step 2
  "Your measurements": "Vos mesures",
  "Weight (kg)": "Poids (kg)",
  "e.g. 70": "ex. 70",
  "Height (cm)": "Taille (cm)",
  "e.g. 170": "ex. 170",

  // Step 3
  "Your sports practice": "Votre pratique sportive",
  "Which sports do you practice?": "Quels sports pratiquez-vous ?",
  "Tap the cards to build your sports profile.": "Touchez les cartes pour construire votre profil sportif.",
  Running: "Course à pied",
  Cycling: "Cyclisme",
  Triathlon: "Triathlon",
  "Road, trail, track": "Route, trail, piste",
  "Road, gravel, MTB": "Route, gravel, VTT",
  "Swim, bike, run combined": "Natation, vélo, course combinés",
  "What is your objective?": "Quel est votre objectif ?",
  "Improve my performance": "Améliorer ma performance",
  "Build my endurance": "Développer mon endurance",
  "Have more energy in training": "Avoir plus d'énergie à l'entraînement",
  "Recover better": "Mieux récupérer",
  "Prepare for a race": "Préparer une course",
  "Optimize my body composition": "Optimiser ma composition corporelle",
  "Improve my hydration": "Améliorer mon hydratation",
  "Tolerate fueling better during effort": "Mieux tolérer l'alimentation pendant l'effort",
  "Simplify my nutrition routine": "Simplifier ma routine nutritionnelle",
  "Choose the discipline and experience level for this sport.":
    "Choisissez la discipline et le niveau d'expérience pour ce sport.",
  Discipline: "Discipline",
  Road: "Route",
  Trail: "Trail",
  Gravel: "Gravel",
  Sprint: "Sprint",
  Olympic: "Olympique",
  Half: "Half",
  Full: "Full",
  "Experience level": "Niveau d'expérience",
  Beginner: "Débutant",
  Intermediate: "Intermédiaire",
  Advanced: "Avancé",
  Elite: "Élite",
  "Sport-specific carb rules: max 60g/h running, max 90g/h cycling.":
    "Règles glucidiques par sport : max 60g/h en course, max 90g/h en vélo.",

  // Step 4
  "Connect Apple Health": "Connecter Apple Health",
  "for an ultra-personalised protocol — we read your last 90 days.":
    "pour un protocole ultra-personnalisé — nous lisons vos 90 derniers jours.",
  "Continue without": "Continuer sans",
  "Fuelnode will read your past training data up to 90 days. Your data is sent to Claude AI and never shared with third parties.":
    "Fuelnode lira vos données d'entraînement des 90 derniers jours. Vos données sont envoyées à Claude AI et ne sont jamais partagées avec des tiers.",

  // Step 5 (connected variant)
  "Your training profile": "Votre profil d'entraînement",
  "Data extracted from Apple Health. Edit if needed.": "Données extraites d'Apple Health. Modifiez si nécessaire.",
  "Sessions / week (count)": "Séances / semaine (nombre)",
  "e.g. 4": "ex. 4",
  "Distance / week (km)": "Distance / semaine (km)",
  "e.g. 35": "ex. 35",
  "Training days": "Jours d'entraînement",
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
  "Usual session time": "Horaire habituel des séances",
  "Early morning": "Tôt le matin",
  Morning: "Matin",
  Afternoon: "Après-midi",
  Evening: "Soir",
  Night: "Nuit",
  "Run type": "Type de course",
  Track: "Piste",
  Hybrid: "Hybride",
  "Answer every question on this step to continue.": "Répondez à toutes les questions de cette étape pour continuer.",

  // Step 5 (default variant)
  "Describe your training": "Décrivez votre entraînement",
  "Running · Road": "Course à pied · Route",
  "Fill in the metrics that matter for this practice.": "Renseignez les indicateurs importants pour cette pratique.",
  "Accepted format: 5:30, 5m30, or 5:30 min/km.": "Format accepté : 5:30, 5m30, ou 5:30 min/km.",
  "Sessions per week (count)": "Séances par semaine (nombre)",
  "Typical distance per session (km)": "Distance type par séance (km)",
  "e.g. 6": "ex. 6",
  "Pace (min/km)": "Allure (min/km)",
  "e.g. 4:00": "ex. 4:00",
  "Average elevation (m)": "Dénivelé moyen (m)",
  "e.g. 21": "ex. 21",

  // Step 6
  "Do you have a target event planned?": "Avez-vous un événement cible prévu ?",
  Yes: "Oui",
  No: "Non",
  "Event name": "Nom de l'événement",
  "E.g. Paris Marathon": "Ex. Marathon de Paris",
  Sport: "Sport",
  "— Choose —": "— Choisir —",
  Format: "Format",
  "5 km": "5 km",
  "10 km": "10 km",
  "Half marathon": "Semi-marathon",
  Marathon: "Marathon",
  "Ultra Running": "Ultra-trail",
  "Trail (specify distance)": "Trail (préciser la distance)",
  "Road (specify distance)": "Route (préciser la distance)",
  "Hybrid bike (specify distance)": "Vélo hybride (préciser la distance)",
  "MTB (specify distance)": "VTT (préciser la distance)",
  "Half (70.3)": "Half (70.3)",
  "Full (Ironman)": "Full (Ironman)",
  "Expected event time": "Horaire prévu de l'événement",
  "In how many weeks? (wk)": "Dans combien de semaines ? (sem)",
  "E.g. 10": "Ex. 10",
  "Goal time (h:mm)": "Temps visé (h:mm)",
  "E.g. 3:30": "Ex. 3:30",
  "Example: 3:30 means 3h 30m. Accepted: 3:30, 3h30, or 210 min.":
    "Exemple : 3:30 signifie 3h 30min. Accepté : 3:30, 3h30, ou 210 min.",
  "Event location": "Lieu de l'événement",
  "E.g. Paris": "Ex. Paris",
  "Elevation gain (m) *": "Dénivelé positif (m) *",
  "e.g. 499": "ex. 499",
  "* Elevation changes energy needs and the box composition.":
    "* Le dénivelé modifie les besoins énergétiques et la composition de la box.",

  // Step 7
  Sensitivities: "Sensibilités",
  "Stomach sensitivity": "Sensibilité digestive",
  None: "Aucune",
  Mild: "Légère",
  Moderate: "Modérée",
  High: "Élevée",
  "Caffeine intake": "Consommation de caféine",
  Never: "Jamais",
  Occasional: "Occasionnelle",
  Regular: "Régulière",
  "Heavy user": "Grand consommateur",

  // Step 8
  Diet: "Alimentation",
  "Diet pattern": "Régime alimentaire",
  Omnivore: "Omnivore",
  Vegetarian: "Végétarien",
  Vegan: "Végan",
  Pescatarian: "Pescétarien",
  "Dietary restrictions": "Restrictions alimentaires",
  "Gluten-free": "Sans gluten",
  "Lactose-free": "Sans lactose",
  "Nut-free": "Sans fruits à coque",
  "Soy-free": "Sans soja",
  "Egg-free": "Sans œuf",

  // Step 9
  "Your preferences": "Vos préférences",
  "Preferred formats": "Formats préférés",
  "Choose the formats you actually want to open and use on the move.":
    "Choisissez les formats que vous voulez vraiment ouvrir et utiliser en déplacement.",
  "Fluid gel": "Gel liquide",
  "Compact, fast to open, easy to take when the pace rises.":
    "Compact, rapide à ouvrir, facile à prendre quand l'allure augmente.",
  "Chewable bar": "Barre à mâcher",
  "Chewy texture for longer or more progressive sessions.":
    "Texture à mâcher pour les séances longues ou progressives.",
  "Portable compote": "Compote nomade",
  "Soft, digestible format when you want something smoother.":
    "Format doux et digeste pour quelque chose de plus léger.",
  "Soft chews": "Pâtes à mâcher",
  "Small pieces that are easy to split during effort.": "Petits morceaux faciles à fractionner pendant l'effort.",
  "Drink sachet": "Sachet boisson",
  "Hydration and energy in a drinkable or mixable format.":
    "Hydratation et énergie en format à boire ou à mélanger.",
  "Natural food": "Aliment naturel",
  "A less processed format for a routine that feels like real food.":
    "Un format moins transformé pour une routine qui ressemble à de la vraie nourriture.",
  "Preferred mental supplement type": "Type de complément mental préféré",
  Focus: "Concentration",
  Relaxation: "Relaxation",
  Sleep: "Sommeil",
  Energy: "Énergie",

  // Step 10
  "Delivery day": "Jour de livraison",
  "Choose your preferred delivery day": "Choisissez votre jour de livraison préféré",
  "Paris only, for now": "Paris uniquement, pour l'instant",
  "We deliver within Paris only for now — expanding our zone soon.":
    "Nous livrons uniquement à Paris pour l'instant — notre zone s'agrandit bientôt.",
  "You can cancel or change your protocol until Tuesday at noon.":
    "Vous pouvez annuler ou modifier votre protocole jusqu'à mardi midi.",
  "You can collect your box upto 7 days after delivery":
    "Vous pouvez récupérer votre box jusqu'à 7 jours après la livraison",

  // Step 11
  "Has nutrition ever cost you a race or ruined a session?":
    "La nutrition vous a-t-elle déjà coûté une course ou gâché une séance ?",
  "Your profile is ready. Fuelnode will now generate your personalized nutrition protocol from your answers, your training level, and your preferences.":
    "Votre profil est prêt. Fuelnode va maintenant générer votre protocole nutritionnel personnalisé à partir de vos réponses, de votre niveau d'entraînement et de vos préférences.",

  // No-change confirmation + generating overlay
  "No changes detected": "Aucun changement détecté",
  "Your answers are the same as your last submission. Do you want to continue and generate a new protocol anyway?":
    "Vos réponses sont identiques à votre dernière soumission. Voulez-vous quand même continuer et générer un nouveau protocole ?",
  "Go back and review": "Revenir en arrière",
  "Continue anyway": "Continuer quand même",
  "Generating your personalized nutrition protocol. This can take up to a minute — please wait...":
    "Génération de votre protocole nutritionnel personnalisé. Cela peut prendre jusqu'à une minute — veuillez patienter...",
};

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
 * who logs in sees their existing answers instead of a blank form. Only
 * covers fields that round-trip cleanly - the detailed race-day fields
 * (event_sport, event_format, target_time, elevation_gain, ...) have no
 * direct equivalent on the saved profile, so they're left for the user to
 * fill in again if they still want a target event configured.
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
    weeks_until_event: profile.weeksToEvent,
    event_location: profile.eventLocation,
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
  const { user, loading: authLoading, login, register } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [userData, setUserData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [language, setLanguage] = useState("en");

  // Auth gate (Step 1 of the flow): create an account or sign in before
  // any question is shown. Once `user` is set, this component re-renders
  // straight into the question wizard below - nothing else has to change.
  const [authMode, setAuthMode] = useState("register");
  const [authFullName, setAuthFullName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Set when login pre-fills userData from an existing profile, so Finish
  // can detect "nothing changed since last time" and confirm before
  // spending an AI generation call on an identical protocol.
  const initialUserDataRef = useRef(null);
  const [showNoChangeConfirm, setShowNoChangeConfirm] = useState(false);

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

  // Translates display text only. Values kept in userData / sent to the
  // backend are always the original English strings from questions.js —
  // this never touches state, only what's rendered.
  const t = (text) => {
    if (!text) return text;
    if (language === "fr") return translations[text] ?? text;
    return text;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "fr" : "en"));
  };

  const handleAuthSubmit = async () => {
    setAuthError("");
    if (authMode === "register" && authPassword.length < 8) {
      setAuthError(t("Password must be at least 8 characters long."));
      return;
    }
    setAuthSubmitting(true);
    try {
      if (authMode === "register") {
        await register(authEmail, authPassword, authFullName);
      } else {
        await login(authEmail, authPassword);
        try {
          const { data: existingProfile } = await apiClient.get("/athletes/profile");
          const mapped = mapProfileToUserData(existingProfile);
          initialUserDataRef.current = mapped;
          setUserData(mapped);
        } catch {
          // No saved profile yet (404) - proceed with a blank form, same
          // as any first-time visitor.
        }
      }
      // `user` is now set by AuthContext, so this component re-renders
      // straight into the question wizard - no navigation needed.
    } catch (err) {
      setAuthError(
        err.response?.data?.message ||
          t(
            authMode === "register"
              ? "Registration failed. Please try again."
              : "Login failed. Please check your credentials."
          )
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

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
        // apiClient's response interceptor already cleared localStorage
        // (token/user) on 401 — we just need to redirect here. Onboarding
        // now requires signing in at Step 1, so reaching Finish without a
        // valid session means the token expired or was cleared mid-flow -
        // the person already has an account, so send them to log back in
        // rather than register again. Stash their answers so login can
        // resume the submission instead of losing everything.
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
  // rather than flashing the auth gate for a visitor who's already logged in.
  if (authLoading) {
    return <div className="ob-page" />;
  }

  // Step 1 of the flow: no question is shown until there's an account.
  if (!user) {
    return (
      <div className="ob-page">
        <div className="ob-bg-glow">
          <div className="ob-bg-glow-top" />
        </div>

        <div className="ob-topbar">
          <span />
          <button
            type="button"
            className="ob-lang"
            onClick={toggleLanguage}
            aria-label={language === "en" ? "Switch to French" : "Passer en anglais"}
          >
            {language === "en" ? "FR" : "EN"}
          </button>
        </div>

        <div className="ob-content">
          <div className="ob-brand">FuelNode</div>
          <h1 className="ob-title">
            {t(authMode === "register" ? "Create your account" : "Log in")}
          </h1>
          <p className="ob-helper-text">
            {t(
              "Create an account to save your answers and get your personalized nutrition protocol."
            )}
          </p>

          <div className="ob-fields">
            {authMode === "register" && (
              <div className="ob-field">
                <label className="ob-label" htmlFor="auth-fullname">
                  {t("Full name")}
                </label>
                <input
                  id="auth-fullname"
                  className="ob-input"
                  type="text"
                  value={authFullName}
                  placeholder={t("Enter your full name")}
                  onChange={(e) => setAuthFullName(e.target.value)}
                />
              </div>
            )}

            <div className="ob-field">
              <label className="ob-label" htmlFor="auth-email">
                {t("Email")}
              </label>
              <input
                id="auth-email"
                className="ob-input"
                type="email"
                value={authEmail}
                placeholder={t("Enter your email")}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>

            <div className="ob-field">
              <label className="ob-label" htmlFor="auth-password">
                {t("Password")}
              </label>
              <input
                id="auth-password"
                className="ob-input"
                type="password"
                value={authPassword}
                placeholder={t("Enter your password")}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>

            {authError && <p className="ob-error">{authError}</p>}

            <button
              type="button"
              className="ob-auth-switch"
              onClick={() => {
                setAuthMode((prev) => (prev === "register" ? "login" : "register"));
                setAuthError("");
              }}
            >
              {authMode === "register"
                ? t("Already have an account? Log in")
                : t("Need an account? Sign up")}
            </button>
          </div>
        </div>

        <div className="ob-footer">
          <button
            type="button"
            className="ob-continue"
            onClick={handleAuthSubmit}
            disabled={
              authSubmitting ||
              !authEmail ||
              !authPassword ||
              (authMode === "register" && !authFullName)
            }
          >
            {authSubmitting
              ? t(authMode === "register" ? "Creating account..." : "Logging in...")
              : t(authMode === "register" ? "Sign Up" : "Log in")}
          </button>
        </div>
      </div>
    );
  }

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

      {submitting && (
        <div className="ob-blocking-overlay" role="status" aria-live="polite">
          <div className="ob-blocking-spinner" aria-hidden="true" />
          <p className="ob-blocking-text">
            {t(
              "Generating your personalized nutrition protocol. This can take up to a minute — please wait..."
            )}
          </p>
        </div>
      )}

      <div className="ob-topbar">
        <button
          type="button"
          className="ob-back"
          onClick={handleBack}
          disabled={stepIndex === 0}
        >
          <span aria-hidden="true">←</span> {t("Back")}
        </button>
        <button
          type="button"
          className="ob-lang"
          onClick={toggleLanguage}
          aria-label={language === "en" ? "Switch to French" : "Passer en anglais"}
        >
          {language === "en" ? "FR" : "EN"}
        </button>
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
    </div>
  );
}