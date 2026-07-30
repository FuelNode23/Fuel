// All onboarding questions live here. Add/remove/reorder entries and the
// flow, progress bar, and step counter update automatically — no new
// pages or routes needed.
//
// Supported types:
//   "text"         -> one or more input fields, each with its own `name`.
//                     A field may itself render as a pill-select
//                     (`type: "select"`) or native dropdown
//                     (`type: "dropdown"`). Fields may carry a `note`
//                     shown just below them. May also carry `card`
//                     (bordered wrapper) and/or `groups`.
//   "select"       -> single-choice pill buttons, stored under `name`.
//                     May carry `conditionalFields`: { when, fields,
//                     groups, moreFields, note } — extra content shown
//                     only once the pill equal to `when` is selected,
//                     all within this same step.
//   "multi-select" -> multi-choice pill buttons. May carry `groups` and/or
//                     `perSport`.
//   "connect"      -> icon + title + subtitle + primary/secondary action
//                     buttons + footnote.
//
// A "dropdown" field may use `optionsBySport: { Sport: [...] }` instead of
// a flat `options` list when its choices depend on another field's value
// (`dependsOn`) in the same fields/conditionalFields group.
//
// A question may instead define `variantKey` + `variants` (alternate
// question shapes keyed by a prior answer, plus `default`) when its
// entire shape depends on an earlier step's answer.

export const questions = [
  {
    id: 1,
    type: "text",
    title: "Tell us about yourself",
    fields: [
      { name: "prenom", label: "First name", placeholder: "e.g. ganesh" },
      { name: "age", label: "Age", inputType: "number", placeholder: "e.g. 22" },
      {
        name: "sexe",
        label: "Gender",
        type: "select",
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
      { name: "taille", label: "Height (cm)", inputType: "number", placeholder: "e.g. 170" },
    ],
  },
  {
    id: 3,
    type: "multi-select",
    title: "Your sports practice",
    subtitle: "Which sports do you practice?",
    helperText: "Tap the cards to build your sports profile.",
    name: "sports",
    options: [
      { value: "Running", description: "Route, trail, piste" },
      { value: "Cycling", description: "Route, gravel, VTT" },
      { value: "Triathlon", description: "Enchaînement natation, vélo, course" },
    ],
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
    perSport: {
      title: "{sport}",
      subtitle: "Choose the discipline and experience level for this sport.",
      fields: [
        {
          name: "discipline",
          label: "Discipline",
          type: "select",
          optionsBySport: {
            Running: ["Road", "Trail"],
            Cycling: ["Road", "Gravel"],
            Triathlon: ["Sprint", "Olympic", "Half", "Full"],
          },
        },
        {
          name: "niveau",
          label: "Experience level",
          type: "select",
          options: ["Beginner", "Intermediate", "Advanced", "Elite"],
        },
      ],
    },
    note: "Sport-specific carb rules: max 60g/h running, max 90g/h cycling.",
  },
  {
    id: 4,
    type: "connect",
    title: "Connect Apple Health",
    subtitle: "for an ultra-personalised protocol — we read your last 90 days.",
    icon: "📱",
    name: "connectChoice",
    primaryAction: { label: "Connect Apple Health", value: "connected" },
    secondaryAction: { label: "Continue without", value: "skipped" },
    note:
      "Fuelnode will read your past training data up to 90 days. Your data is sent to Claude AI and never shared with third parties.",
  },
  {
    id: 5,
    variantKey: "connectChoice",
    variants: {
      connected: {
        type: "text",
        title: "Your training profile",
        subtitle: "Data extracted from Apple Health. Edit if needed.",
        fields: [
          { name: "seances_semaine", label: "Sessions / week (count)", inputType: "number", placeholder: "e.g. 4" },
          { name: "distance_semaine", label: "Distance / week (km)", inputType: "number", placeholder: "e.g. 35" },
        ],
        groups: [
          {
            name: "training_days",
            type: "multi-select",
            label: "Training days",
            options: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
          },
          {
            name: "session_time",
            type: "select",
            label: "Usual session time",
            options: ["Early morning", "Morning", "Afternoon", "Evening", "Night"],
            dial: true,
          },
          {
            name: "run_type",
            type: "select",
            label: "Run type",
            options: ["Road", "Trail", "Track", "Hybrid"],
          },
        ],
        note: "Answer every question on this step to continue.",
      },
      default: {
        type: "text",
        title: "Describe your training",
        card: {
          title: "Running · Road",
          subtitle: "Fill in the metrics that matter for this practice.",
          note: "Accepted format: 5:30, 5m30, or 5:30 min/km.",
        },
        fields: [
          { name: "seances_semaine", label: "Sessions per week (count)", inputType: "number", placeholder: "e.g. 4" },
          { name: "distance_typique", label: "Typical distance per session (km)", inputType: "number", placeholder: "e.g. 6" },
          { name: "allure", label: "Pace (min/km)", placeholder: "e.g. 4:00" },
          { name: "denivele_moyen", label: "Average elevation (m)", inputType: "number", placeholder: "e.g. 21" },
        ],
        groups: [
          {
            name: "session_time",
            type: "select",
            label: "Usual session time",
            options: ["Early morning", "Morning", "Afternoon", "Evening", "Night"],
            dial: true,
          },
        ],
      },
    },
  },
  {
    id: 6,
    type: "select",
    title: "Do you have a target event planned?",
    name: "course_prevue",
    options: ["Yes", "No"],
    conditionalFields: {
      when: "Yes",
      fields: [
        { name: "course_nom", label: "Event name", placeholder: "E.g. Paris Marathon" },
        {
          name: "course_sport",
          label: "Sport",
          type: "dropdown",
          placeholder: "— Choose —",
          options: ["Running", "Cycling", "Triathlon"],
        },
        {
          name: "course_type",
          label: "Format",
          type: "dropdown",
          placeholder: "— Choose —",
          dependsOn: "course_sport",
          optionsBySport: {
            Running: ["5 km", "10 km", "Semi-marathon", "Marathon", "Ultra Running", "Trail (préciser la distance)"],
            Cycling: ["Route (préciser la distance)", "Gravel", "VTC (préciser la distance)", "VTT (préciser la distance)"],
            Triathlon: ["Sprint", "Olympic", "Half (70.3)", "Full (Ironman)"],
          },
        },
      ],
      groups: [
        {
          name: "objectif_temps",
          type: "select",
          label: "Expected event time",
          options: ["Early morning", "Morning", "Afternoon", "Evening", "Night"],
          dial: true,
        },
      ],
      moreFields: [
        { name: "course_semaines", label: "In how many weeks? (wk)", placeholder: "E.g. 10" },
        {
          name: "course_temps_cible",
          label: "Goal time (h:mm)",
          placeholder: "E.g. 3:30",
          note: "Example: 3:30 means 3h 30m. Accepted: 3:30, 3h30, or 210 min.",
        },
        { name: "course_lieu", label: "Event location", placeholder: "E.g. Paris" },
        {
          name: "course_denivele",
          label: "Elevation gain (m) *",
          inputType: "number",
          placeholder: "e.g. 499",
          note: "* Elevation changes energy needs and the box composition.",
        },
      ],
      note: "Answer every question on this step to continue.",
    },
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
    subtitle: "Preferred formats",
    helperText: "Choose the formats you actually want to open and use on the move.",
    name: "formats_preferes",
    options: [
      { value: "Fluid gel", icon: "💧", description: "Compact, fast to open, easy to take when the pace rises." },
      { value: "Chewable bar", icon: "📦", description: "Chewy texture for longer or more progressive sessions." },
      { value: "Portable compote", icon: "🥣", description: "Soft, digestible format when you want something smoother." },
      { value: "Soft chews", icon: "🍬", description: "Small pieces that are easy to split during effort." },
      { value: "Drink sachet", icon: "🩹", description: "Hydration and energy in a drinkable or mixable format." },
      { value: "Natural food", icon: "🔗", description: "A less processed format for a routine that feels like real food." },
    ],
    groups: [
      {
        name: "complements",
        type: "multi-select",
        label: "Preferred mental supplement type",
        options: ["Focus", "Relaxation", "Sleep", "Energy", "None"],
      },
    ],
    note: "cuisine_inspiration is also collected here for UI personalization only — stripped before the AI call.",
  },
 {
    id: 10,
    type: "select",
    title: "Delivery day",
    subtitle: "Choose your preferred delivery day",
    infoBanner: {
      icon: "📍",
      title: "Paris only, for now",
      text: "We deliver within Paris only for now — expanding our zone soon.",
    },
    name: "delivery_day",
    options: ["Monday", "Wednesday", "Friday"],
    fullWidthOptions: true,
    notes: [
      "You can cancel or change your protocol until mardi at noon.",
      "You can collect your box upto 7 days after delivery",
    ],
  },
 {
    id: 11,
    type: "select",
    title: "Has nutrition ever cost you a race or ruined a session?",
    name: "nutrition_issue_history",
    options: ["Yes", "No"],
    noteBox:
      "Your profile is ready. Fuelnode will now generate your personalized nutrition protocol from your answers, your training level, and your preferences.",
  },
];