// All onboarding questions live here. Add/remove/reorder entries and the
// flow, progress bar, and step counter update automatically — no new
// pages or routes needed.
//
// Supported types:
//   "text"         -> one or more input fields, each with its own `name`.
//                     A field may itself render as a pill-select by setting
//                     `fieldType: "select"` + `options` (e.g. gender on Q1).
//   "select"       -> single-choice pill buttons, stored under `name`
//   "multi-select" -> multi-choice pill buttons, stored as an array under `name`
//
// Some steps show more than one selectable group on the same screen
// (e.g. Sport: sports + objectives, Diet: regime + restrictions). For
// those, an optional `groups` array holds the extra pill-select groups
// alongside the primary `name`/`options`.

export const questions = [
  {
    id: 1,
    type: "text",
    title: "Tell us about yourself",
    fields: [
      { name: "prenom", label: "First name", placeholder: "e.g. Alex" },
      { name: "age", label: "Age", inputType: "number", placeholder: "e.g. 31" },
      {
        name: "sexe",
        label: "Gender",
        fieldType: "select",
        options: ["Male", "Female", "Other"],
      },
    ],
  },
  {
    id: 2,
    type: "text",
    title: "Your measurements",
    fields: [
      { name: "poids", label: "Weight (kg)", inputType: "number", placeholder: "e.g. 70" },
      { name: "taille", label: "Height (cm)", inputType: "number", placeholder: "e.g. 180" },
    ],
  },
  {
    id: 3,
    type: "multi-select",
    title: "Your sports practice",
    name: "sports",
    options: ["Running", "Cycling", "Triathlon"],
    groups: [
      {
        name: "objectifs",
        type: "multi-select",
        label: "What is your objective?",
        options: [
          "Improve my performance",
          "Build my endurance",
          "Have more energy in training",
          "Recover better",
          "Prepare for a race",
          "Optimize my body composition",
          "Improve my hydration",
          "Tolerate fueling better during effort",
          "Simplify my nutrition routine",
        ],
      },
    ],
    // Per selected sport, a sub-panel collects `discipline` and `niveau`
    // (e.g. Running: "Choose the discipline and experience level for this sport.")
    perSportFields: [
      { name: "discipline", label: "Discipline" },
      { name: "niveau", label: "Experience level" },
    ],
    note: "Sport-specific carb rules: max 60g/h running, max 90g/h cycling.",
  },
  {
    id: 4,
    type: "select",
    title: "Connect your training data",
    name: "connectChoice",
    options: ["Enter my training manually"],
    note:
      "Strava · Garmin · Apple Health — coming soon. Automatic training import is on its way. When it launches, Fuelnode will only read your training history (up to 90 days), with your explicit consent, and never share it with third parties.",
  },
  {
    id: 5,
    type: "text",
    title: "Describe your training",
    fields: [
      { name: "seances_semaine", label: "Sessions per week (count)", inputType: "number", placeholder: "e.g. 4" },
      { name: "distance_typique", label: "Typical distance per session (km)", inputType: "number", placeholder: "e.g. 6" },
      { name: "allure", label: "Pace (min/km)", placeholder: "e.g. 4:00" },
      { name: "denivele_moyen", label: "Average elevation (m)", inputType: "number", placeholder: "e.g. 71" },
      {
        name: "session_time",
        label: "Usual session time",
        fieldType: "select",
        options: ["Early morning", "Morning", "Afternoon", "Evening", "Night"],
      },
    ],
  },
  {
    id: 6,
    type: "text",
    title: "Do you have a target event planned?",
    fields: [
      {
        name: "course_prevue",
        label: "Target event",
        fieldType: "select",
        options: ["Yes", "No"],
      },
      { name: "course_nom", label: "Event name", placeholder: "e.g. Paris 10K" },
      { name: "course_sport", label: "Sport", placeholder: "e.g. Running" },
      { name: "course_type", label: "Format", placeholder: "e.g. 10 km" },
      {
        name: "objectif_temps",
        label: "Expected event time",
        fieldType: "select",
        options: ["Early morning", "Morning", "Afternoon", "Evening", "Night"],
      },
    ],
    note: "If the race is within 21 days, the event protocol page becomes visible.",
  },
  {
    id: 7,
    type: "select",
    title: "Sensitivities",
    name: "sensibilite_estomac",
    label: "Stomach sensitivity",
    options: ["None", "Mild", "Moderate", "High"],
    groups: [
      {
        name: "cafeine",
        type: "select",
        label: "Caffeine intake",
        options: ["Never", "Occasional", "Regular", "Heavy user"],
      },
    ],
  },
  {
    id: 8,
    type: "select",
    title: "Diet",
    name: "regime",
    label: "Diet pattern",
    options: ["Omnivore", "Vegetarian", "Vegan", "Pescatarian"],
    groups: [
      {
        name: "restrictions",
        type: "multi-select",
        label: "Dietary restrictions",
        options: ["Gluten-free", "Lactose-free", "Nut-free", "Soy-free", "Egg-free", "None"],
      },
    ],
  },
  {
    id: 9,
    type: "multi-select",
    title: "Your preferences",
    name: "formats_preferes",
    label: "Preferred formats",
    options: ["Fluid gel", "Chewable bar", "Portable compote", "Soft chews", "Drink sachet", "Natural food"],
    groups: [
      {
        name: "complements",
        type: "multi-select",
        label: "Preferred mental supplement type",
        options: [],
      },
    ],
    note: "cuisine_inspiration is also collected here for UI personalization only — stripped before the AI call.",
  },
  {
    id: 10,
    type: "select",
    title: "Delivery day",
    name: "delivery_day",
    options: ["Monday", "Wednesday", "Friday"],
    note:
      "Paris only, for now — expanding zone soon. You can cancel or change your protocol until Tuesday at noon. You can collect your box up to 7 days after delivery.",
  },
  {
    id: 11,
    type: "select",
    title: "Has nutrition ever cost you a race or ruined a session?",
    name: "nutrition_issue_history",
    options: ["Yes", "No"],
    note:
      "Your profile is ready. Fuelnode will now generate your personalized nutrition protocol from your answers, your training level, and your preferences.",
  },
];