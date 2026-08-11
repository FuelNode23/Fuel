// French dictionary for the whole app. Every key is the exact English
// string written at the call site (`t("Some text")`); every value is its
// French translation. English needs no dictionary — it's the source
// language the codebase is written in, so `t()` just returns the key
// unchanged when the active language is "en". Keep this flat (no nested
// namespaces) so a string can be reused verbatim anywhere it appears.
const fr = {
  // ---------------------------------------------------------------------
  // Global chrome / shared
  // ---------------------------------------------------------------------
  Back: "Retour",
  Continue: "Continuer",
  Finish: "Terminer",
  "Submitting...": "Envoi en cours...",
  Step: "Étape",
  of: "sur",
  Chosen: "Choisi",
  Tap: "Toucher",
  "Select sport first": "Choisir un sport d'abord",
  "Loading...": "Chargement...",
  English: "Anglais",
  French: "Français",
  "Switch to English": "Passer en anglais",
  "Switch to French": "Passer en français",
  Menu: "Menu",

  // ---------------------------------------------------------------------
  // Nav (landing page top navigation)
  // ---------------------------------------------------------------------
  "How it works": "Comment ça marche",
  Delivery: "Livraison",
  "Finish onboarding": "Terminer l'onboarding",

  // ---------------------------------------------------------------------
  // Hero
  // ---------------------------------------------------------------------
  "The right fuel, at the right time,": "Le bon carburant, au bon moment,",
  "every week": "chaque semaine",
  "FuelNode turns your data into precise nutrition protocols and weekly boxes assembled with precision.":
    "FuelNode transforme vos données en protocoles nutritionnels précis et en box hebdomadaires assemblées avec précision.",
  "Try FuelNode": "Tester FuelNode",
  "See how it works": "Voir comment ça marche",
  "Fuel adapted to your effort": "Fuel adapté à votre effort",
  "Hydration adjusted to conditions": "Hydratation ajustée aux conditions",
  "Box prepared every week": "Box préparée chaque semaine",
  "Flexible pickup-point delivery": "Livraison flexible en point relais",
  "Long run": "Sortie longue",
  "Key week": "Semaine clé",
  Duration: "Durée",
  Temperature: "Température",
  Humidity: "Humidité",
  "Carbs/h": "Glucides/h",
  "Sodium/h": "Sodium/h",
  "Fluids/h": "Liquides/h",
  "Weekly box": "Box hebdomadaire",
  "{count} items": "{count} articles",
  "Electrolyte capsules": "Capsules électrolytes",

  // ---------------------------------------------------------------------
  // How it works
  // ---------------------------------------------------------------------
  "How FuelNode works": "Comment fonctionne FuelNode",
  "A precision nutrition engine adapted to your profile, your effort, and your conditions.":
    "Un moteur de nutrition de précision adapté à votre profil, à votre effort et à vos conditions.",
  "Smart analysis": "Analyse intelligente",
  "Connect your training data or fill in your athletic profile, your goal, and your digestive preferences.":
    "Connectez vos données d'entraînement ou renseignez votre profil sportif, votre objectif et vos préférences digestives.",
  "Personalized protocol": "Protocole personnalisé",
  "FuelNode calculates your exact carb, sodium, and hydration needs based on your sport, the weather, and your training phase.":
    "FuelNode calcule vos besoins exacts en glucides, sodium et hydratation selon votre sport, la météo et la phase d'entraînement.",
  "Box assembled and delivered": "Box assemblée et livrée",
  "Your weekly box is automatically prepared and delivered to a pickup point or smart locker near you.":
    "Votre box hebdomadaire est préparée automatiquement et livrée en point relais ou smart locker proche de vous.",

  // ---------------------------------------------------------------------
  // Delivery section
  // ---------------------------------------------------------------------
  "Delivery built for performance": "Livraison pensée pour la performance",
  "Reliable, structured physical execution that fits your training week.":
    "Une exécution physique fiable, structurée et compatible avec votre semaine d'entraînement.",
  "Precise weekly assembly": "Assemblage hebdomadaire précis",
  "Pickup at a relay point or smart locker": "Retrait en point relais ou smart locker",
  "Availability aligned with your schedule": "Disponibilité alignée à votre calendrier",

  // ---------------------------------------------------------------------
  // CTA section
  // ---------------------------------------------------------------------
  "Access FuelNode": "Accéder à FuelNode",
  "A short onboarding, an immediately usable protocol, and a box that follows your training week.":
    "Un onboarding court, un protocole exploitable immédiatement, et une box qui suit votre semaine d'entraînement.",

  // ---------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------
  "Terms & Conditions": "Conditions générales",
  "Privacy Policy": "Politique de confidentialité",
  "All rights reserved.": "Tous droits réservés.",

  // ---------------------------------------------------------------------
  // AccountBar
  // ---------------------------------------------------------------------
  "Welcome, {name}": "Bienvenue, {name}",
  "Last login: {value}": "Dernière connexion : {value}",
  "Log out": "Déconnexion",

  // ---------------------------------------------------------------------
  // Login / Register
  // ---------------------------------------------------------------------
  "Log in": "Se connecter",
  "Create your account": "Créez votre compte",
  Email: "E-mail",
  "Enter your email": "Entrez votre e-mail",
  Password: "Mot de passe",
  "Enter your password": "Entrez votre mot de passe",
  "Full Name": "Nom complet",
  "Enter your full name": "Entrez votre nom complet",
  "Logging in...": "Connexion en cours...",
  "Sign Up": "S'inscrire",
  "Creating account...": "Création du compte...",
  "Don't have an account?": "Vous n'avez pas de compte ?",
  "Sign up": "Inscrivez-vous",
  "Already have an account?": "Vous avez déjà un compte ?",
  "Password must be at least 8 characters long.": "Le mot de passe doit contenir au moins 8 caractères.",
  "Registration failed. Please try again.": "Échec de l'inscription. Veuillez réessayer.",
  "Welcome back. Enter your details to continue.": "Bon retour. Entrez vos identifiants pour continuer.",
  "Join FuelNode and get your first weekly box built around you.": "Rejoignez FuelNode et recevez votre première boîte hebdomadaire conçue pour vous.",
  "The right fuel,": "Le bon carburant,",
  "at the right time": "au bon moment",
  "Precise nutrition protocols and weekly boxes, built around your training.": "Des protocoles nutritionnels précis et des boîtes hebdomadaires, conçus autour de votre entraînement.",
  "Login failed. Please check your credentials.": "Échec de la connexion. Veuillez vérifier vos identifiants.",

  // ---------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------
  "Your nutrition dashboard": "Votre tableau de bord nutritionnel",
  "Please {link} first.": "Veuillez d'abord {link}.",
  "complete your athlete profile": "compléter votre profil d'athlète",
  "Generate my plan": "Générer mon plan",
  "Regenerate plan": "Régénérer le plan",
  "Generating...": "Génération en cours...",
  "You don't have a nutrition plan yet. Generate one to get your personalized macro targets.":
    "Vous n'avez pas encore de plan nutritionnel. Générez-en un pour obtenir vos objectifs de macros personnalisés.",
  "Could not load your nutrition plan.": "Impossible de charger votre plan nutritionnel.",
  "Could not generate a plan.": "Impossible de générer un plan.",
  BMR: "MB",
  TDEE: "DEJ",
  "Target calories": "Calories cibles",
  Protein: "Protéines",
  Carbs: "Glucides",
  Fat: "Lipides",
  Goal: "Objectif",
  "Activity level": "Niveau d'activité",

  // ---------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------
  "Athlete profile": "Profil de l'athlète",
  "Loading profile...": "Chargement du profil...",
  "You haven't completed onboarding yet, so there's no profile to edit.":
    "Vous n'avez pas encore terminé l'onboarding, il n'y a donc pas de profil à modifier.",
  "Start onboarding": "Commencer l'onboarding",
  "First name": "Prénom",
  Age: "Âge",
  Gender: "Genre",
  Male: "Homme",
  Female: "Femme",
  Other: "Autre",
  "Height (cm)": "Taille (cm)",
  "Weight (kg)": "Poids (kg)",
  Sports: "Sports",
  "Save profile": "Enregistrer le profil",
  "Saving...": "Enregistrement...",
  "Profile saved.": "Profil enregistré.",
  "Could not load your profile.": "Impossible de charger votre profil.",
  "Could not save your profile.": "Impossible d'enregistrer votre profil.",
  "Go to dashboard →": "Aller au tableau de bord →",

  // ---------------------------------------------------------------------
  // Protocol page
  // ---------------------------------------------------------------------
  "Your Nutrition Protocol": "Votre protocole nutritionnel",
  "Personalized fueling, recovery, and product guidance based on your onboarding profile.":
    "Un accompagnement personnalisé pour l'alimentation, la récupération et les produits, basé sur votre profil d'onboarding.",
  "No protocol available. Please complete onboarding first.":
    "Aucun protocole disponible. Veuillez d'abord compléter l'onboarding.",
  "We couldn't save your profile, so your personalized protocol hasn't been generated yet. Your answers are safe — please try again.":
    "Nous n'avons pas pu enregistrer votre profil, votre protocole personnalisé n'a donc pas encore été généré. Vos réponses sont en sécurité — veuillez réessayer.",
  "Weekly Box": "Box hebdomadaire",
  "Your {count}-product box is ready, assembled around this protocol.":
    "Votre box de {count} produits est prête, assemblée autour de ce protocole.",
  "Your personalized product box is ready.": "Votre box de produits personnalisée est prête.",
  "View your weekly box →": "Voir votre box hebdomadaire →",
  Retry: "Réessayer",
  "We couldn't load your protocol": "Impossible de charger votre protocole",
  "Something went wrong while generating your nutrition protocol. Please try again.":
    "Une erreur s'est produite lors de la génération de votre protocole nutritionnel. Veuillez réessayer.",
  "Generating your personalized nutrition protocol...": "Génération de votre protocole nutritionnel personnalisé...",

  // ---------------------------------------------------------------------
  // Protocol/* sub-components
  // ---------------------------------------------------------------------
  "Assumptions Made": "Hypothèses retenues",
  "Generated {date}": "Généré le {date}",
  "Diet Protocol": "Protocole alimentaire",
  "No diet protocol available.": "Aucun protocole alimentaire disponible.",
  "Pre-Training Meal": "Repas avant l'entraînement",
  "Pre-Training Snack": "Collation avant l'entraînement",
  "Recovery Window": "Fenêtre de récupération",
  "Main Meal": "Repas principal",
  Base: "Base",
  "Protein source": "Source de protéines",
  Fibre: "Fibres",
  Constraints: "Contraintes",
  "Product pairing": "Association produit",
  "No product pairing for this slot.": "Aucune association produit pour ce créneau.",
  "Why:": "Pourquoi :",
  "How:": "Comment :",
  "Fueling Protocol": "Protocole d'alimentation à l'effort",
  "No fueling protocol available.": "Aucun protocole d'alimentation à l'effort disponible.",
  "Pre-Training": "Avant l'entraînement",
  "During Training": "Pendant l'entraînement",
  "Post-Training": "Après l'entraînement",
  "Race Day": "Jour de course",
  Timing: "Horaire",
  Carbohydrates: "Glucides",
  "Carbohydrates / hour": "Glucides / heure",
  Ratio: "Ratio",
  Format: "Format",
  "Gel frequency": "Fréquence de gel",
  Instructions: "Instructions",
  Rationale: "Justification",
  Hydration: "Hydratation",
  "{value}ml per hour": "{value} ml par heure",
  "Not applicable for this protocol.": "Non applicable pour ce protocole.",
  "Macro Targets": "Objectifs de macros",
  "No macro targets available.": "Aucun objectif de macros disponible.",
  "Protein / day": "Protéines / jour",
  "Rest Day Carbs": "Glucides jour de repos",
  "Easy Day Carbs": "Glucides jour facile",
  "Hard Day Carbs": "Glucides jour difficile",
  "Long Effort Carbs": "Glucides effort long",
  "Fat / day": "Lipides / jour",
  "Missing Data": "Données manquantes",
  "The Science": "La science",
  "No science cards available.": "Aucune fiche scientifique disponible.",
  Product: "Produit",
  "Show less": "Afficher moins",
  "Learn more": "En savoir plus",
  "Specialist Protocols": "Protocoles spécialisés",
  "No specialist protocols are active.": "Aucun protocole spécialisé actif.",
  "Untitled Protocol": "Protocole sans titre",
  Active: "Actif",
  "No box contents available.": "Aucun contenu de box disponible.",
  "{count} products": "{count} produits",
  "{percent}% French brands": "{percent} % de marques françaises",
  Quantity: "Quantité",
  "Protocol slot": "Créneau du protocole",
  "Why this product": "Pourquoi ce produit",
  Storage: "Conservation",
  "Not specified": "Non précisé",
  "No details provided.": "Aucun détail fourni.",
  "No special storage instructions.": "Aucune instruction de conservation particulière.",
  "Unnamed product": "Produit sans nom",
  "Unknown brand": "Marque inconnue",
  "Assembly notes:": "Notes d'assemblage :",

  // ---------------------------------------------------------------------
  // Weekly box page
  // ---------------------------------------------------------------------
  "Back to the protocol": "Retour au protocole",
  "Box of the week": "Box de la semaine",
  "Your FuelNode box": "Votre box FuelNode",
  "The products assembled for your protocol, based on your profile and preferences.":
    "Les produits assemblés pour votre protocole, selon votre profil et vos préférences.",
  "No box to show yet — generate a protocol first to see your weekly box.":
    "Aucune box à afficher pour l'instant — générez d'abord un protocole pour voir votre box hebdomadaire.",

  // ---------------------------------------------------------------------
  // Onboarding — auth gate (Step 1: create account / sign in)
  // ---------------------------------------------------------------------
  "Create an account to save your answers and get your personalized nutrition protocol.":
    "Créez un compte pour enregistrer vos réponses et obtenir votre protocole nutritionnel personnalisé.",
  "Full name": "Nom complet",
  "Already have an account? Log in": "Vous avez déjà un compte ? Connectez-vous",
  "Need an account? Sign up": "Besoin d'un compte ? Inscrivez-vous",

  // ---------------------------------------------------------------------
  // Onboarding — Step 1
  // ---------------------------------------------------------------------
  "Tell us about yourself": "Parlez-nous de vous",
  "Enter your name": "Entrez votre nom",
  "Enter your age": "Entrez votre âge",

  // ---------------------------------------------------------------------
  // Onboarding — Step 2
  // ---------------------------------------------------------------------
  "Your measurements": "Vos mesures",
  "e.g. 70": "ex. 70",
  "e.g. 170": "ex. 170",

  // ---------------------------------------------------------------------
  // Onboarding — Step 3
  // ---------------------------------------------------------------------
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

  // ---------------------------------------------------------------------
  // Onboarding — Step 4
  // ---------------------------------------------------------------------
  "Connect Apple Health": "Connecter Apple Health",
  "for an ultra-personalised protocol — we read your last 90 days.":
    "pour un protocole ultra-personnalisé — nous lisons vos 90 derniers jours.",
  "Continue without": "Continuer sans",
  "Fuelnode will read your past training data up to 90 days. Your data is sent to Claude AI and never shared with third parties.":
    "Fuelnode lira vos données d'entraînement des 90 derniers jours. Vos données sont envoyées à Claude AI et ne sont jamais partagées avec des tiers.",

  // ---------------------------------------------------------------------
  // Onboarding — Step 5 (connected variant)
  // ---------------------------------------------------------------------
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

  // ---------------------------------------------------------------------
  // Onboarding — Step 5 (default variant)
  // ---------------------------------------------------------------------
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

  // ---------------------------------------------------------------------
  // Onboarding — Step 6
  // ---------------------------------------------------------------------
  "Do you have a target event planned?": "Avez-vous un événement cible prévu ?",
  Yes: "Oui",
  No: "Non",
  "Event name": "Nom de l'événement",
  "E.g. Paris Marathon": "Ex. Marathon de Paris",
  Sport: "Sport",
  "— Choose —": "— Choisir —",
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

  // ---------------------------------------------------------------------
  // Onboarding — Step 7
  // ---------------------------------------------------------------------
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

  // ---------------------------------------------------------------------
  // Onboarding — Step 8
  // ---------------------------------------------------------------------
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

  // ---------------------------------------------------------------------
  // Onboarding — Step 9
  // ---------------------------------------------------------------------
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

  // ---------------------------------------------------------------------
  // Onboarding — Step 10
  // ---------------------------------------------------------------------
  "Delivery day": "Jour de livraison",
  "Choose your preferred delivery day": "Choisissez votre jour de livraison préféré",
  "Paris only, for now": "Paris uniquement, pour l'instant",
  "We deliver within Paris only for now — expanding our zone soon.":
    "Nous livrons uniquement à Paris pour l'instant — notre zone s'agrandit bientôt.",
  "You can cancel or change your protocol until Tuesday at noon.":
    "Vous pouvez annuler ou modifier votre protocole jusqu'à mardi midi.",
  "You can collect your box upto 7 days after delivery":
    "Vous pouvez récupérer votre box jusqu'à 7 jours après la livraison",

  // ---------------------------------------------------------------------
  // Onboarding — Step 11
  // ---------------------------------------------------------------------
  "Has nutrition ever cost you a race or ruined a session?":
    "La nutrition vous a-t-elle déjà coûté une course ou gâché une séance ?",
  "Your profile is ready. Fuelnode will now generate your personalized nutrition protocol from your answers, your training level, and your preferences.":
    "Votre profil est prêt. Fuelnode va maintenant générer votre protocole nutritionnel personnalisé à partir de vos réponses, de votre niveau d'entraînement et de vos préférences.",

  // ---------------------------------------------------------------------
  // Onboarding — no-change confirmation + generating overlay
  // ---------------------------------------------------------------------
  "No changes detected": "Aucun changement détecté",
  "Your answers are the same as your last submission. Do you want to continue and generate a new protocol anyway?":
    "Vos réponses sont identiques à votre dernière soumission. Voulez-vous quand même continuer et générer un nouveau protocole ?",
  "Go back and review": "Revenir en arrière",
  "Continue anyway": "Continuer quand même",
  "Generating your personalized nutrition protocol. This can take up to a minute — please wait...":
    "Génération de votre protocole nutritionnel personnalisé. Cela peut prendre jusqu'à une minute — veuillez patienter...",
};

export default fr;
