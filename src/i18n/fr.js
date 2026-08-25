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
  "Sign In": "Se connecter",

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
  "Log out of FuelNode?": "Se déconnecter de FuelNode ?",
  "You'll need to sign in again to see your protocol and weekly box.":
    "Vous devrez vous reconnecter pour voir votre protocole et votre box hebdomadaire.",
  Cancel: "Annuler",
  "Yes, log out": "Oui, se déconnecter",
  "See you again!": "À bientôt !",
  "You've been logged out safely. Come back soon.":
    "Vous avez été déconnecté(e) en toute sécurité. Revenez vite.",

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

  // Password/OTP login tabs (Login.jsx) - same strings Account.jsx's Email
  // tab already used with no French entry, so this also fixes that gap.
  "One-time code": "Code à usage unique",
  "We'll send a 6-digit code to your email. No password needed.":
    "Nous enverrons un code à 6 chiffres à votre e-mail. Aucun mot de passe requis.",
  "We'll send a 6-digit code to your email. Fuelnode does not create or store passwords.":
    "Nous enverrons un code à 6 chiffres à votre e-mail. Fuelnode ne crée ni ne stocke de mots de passe.",
  "Send code": "Envoyer le code",
  "Sending...": "Envoi en cours...",
  "Enter your code": "Entrez votre code",
  "We sent a 6-digit code to {email}.": "Nous avons envoyé un code à 6 chiffres à {email}.",
  "Verify & continue": "Vérifier et continuer",
  "Verifying...": "Vérification en cours...",
  "Use a different email": "Utiliser un autre e-mail",
  "Could not send the code right now. Please try again.":
    "Impossible d'envoyer le code pour le moment. Veuillez réessayer.",
  "No FuelNode account found for this email.": "Aucun compte FuelNode trouvé pour cet e-mail.",
  "Something went wrong. Please try again.": "Un problème est survenu. Veuillez réessayer.",

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
  "Discover your FuelNode box": "Découvrez votre box FuelNode",
  "Three options built around your profile, your protocol, and your preferences. Choose the one that fits you best this week.":
    "Trois options construites autour de votre profil, votre protocole et vos préférences. Choisissez celle qui vous convient le mieux cette semaine.",
  "No box to show yet — generate a protocol first to see your weekly box.":
    "Aucune box à afficher pour l'instant — générez d'abord un protocole pour voir votre box hebdomadaire.",

  // Box variant columns
  International: "International",
  "Best value": "Meilleure valeur",
  "French brands": "Marques françaises",
  "A box matched to your protocol, with non-French brands.":
    "Une box adaptée à votre protocole, avec des marques non françaises.",
  "A box matched to your protocol, optimized for the best value.":
    "Une box adaptée à votre protocole, optimisée pour le meilleur rapport valeur.",
  "A box matched to your protocol, centered on French-origin brands.":
    "Une box adaptée à votre protocole, centrée sur des marques d'origine française.",
  "Value score is a reference estimate (nutrition per euro, by brand/category) for ranking only — it's not a live catalog price.":
    "Le score de valeur est une estimation de référence (nutrition par euro, par marque/catégorie) utilisée uniquement pour le classement — ce n'est pas un prix catalogue en temps réel.",
  "{score} pts/€": "{score} pts/€",
  "Reference estimate, not a live price": "Estimation de référence, pas un prix en temps réel",
  "{filled} out of 4 value rating": "{filled} sur 4 en score de valeur",
  "Reference value rating, not a live score": "Score de valeur de référence, pas un score en temps réel",
  "Discover the product science": "Découvrir la science du produit",
  "Choose this box": "Choisir cette box",
  "Selected ✓": "Sélectionnée ✓",

  // Product edit / replacement picker
  Edit: "Modifier",
  "Save changes": "Enregistrer les modifications",
  "Saving...": "Enregistrement...",
  "Couldn't save your changes. Please try again.":
    "Impossible d'enregistrer vos modifications. Veuillez réessayer.",
  "Choose a different product": "Choisir un autre produit",
  "Hide alternatives": "Masquer les alternatives",
  "Loading alternatives...": "Chargement des alternatives...",
  "Couldn't load alternatives. Try again in a moment.":
    "Impossible de charger les alternatives. Réessayez dans un instant.",
  "No other product found for this slot yet.": "Aucun autre produit trouvé pour cette catégorie pour l'instant.",
  Current: "Actuel",
  Selected: "Sélectionné",
  Pending: "En attente",

  // "Ambitious for your load" banner
  "This box is a little ambitious for your current load":
    "Cette box est un peu ambitieuse pour votre charge actuelle",
  "Based on your answers, your training volume is still light. The {count}-product weekly box is built for busier weeks, so it gives you more nutrition than your current sessions will actually use.":
    "D'après vos réponses, votre volume d'entraînement est encore léger. La box hebdomadaire de {count} produits est conçue pour les semaines plus chargées, elle vous apporte donc plus de nutrition que ce que vos séances actuelles utiliseront réellement.",
  "We're still offering it to you, openly: it's a great way to discover the products, find what works for you, and be a step ahead for when you ramp up.":
    "Nous vous la proposons quand même, en toute transparence : c'est une bonne façon de découvrir les produits, de trouver ce qui vous convient, et d'avoir une longueur d'avance quand vous monterez en charge.",
  "Tip: if you raise your training volume in your profile, your box adjusts to your needs automatically.":
    "Astuce : si vous augmentez votre volume d'entraînement dans votre profil, votre box s'ajuste automatiquement à vos besoins.",
  "Got it": "Compris",

  // Bottom "Continue" bar
  "Choose a box above to continue.": "Choisissez une box ci-dessus pour continuer.",
  "Continue →": "Continuer →",

  // Subscriptions page
  "Back to your box": "Retour à votre box",
  Subscriptions: "Abonnements",
  "Choose your plan": "Choisissez votre formule",
  "Pick the plan that keeps your weekly box and protocol coming.":
    "Choisissez la formule qui vous permet de continuer à recevoir votre box hebdomadaire et votre protocole.",
  "Pricing shown is illustrative — checkout isn't connected yet, so plan selection doesn't charge anything.":
    "Les tarifs affichés sont indicatifs — le paiement n'est pas encore connecté, donc choisir une formule ne débite rien.",
  "Most popular": "Le plus populaire",
  Free: "Gratuit",
  "/ month": "/ mois",
  "Select plan": "Choisir cette formule",
  Starter: "Starter",
  Performance: "Performance",
  "1 nutrition protocol generation / month": "1 génération de protocole nutritionnel / mois",
  "Weekly box preview (International variant only)": "Aperçu de la box hebdomadaire (variante International uniquement)",
  "Email support": "Support par e-mail",
  "Unlimited protocol regeneration": "Régénération illimitée du protocole",
  "All 3 weekly box variants (International, Best value, French brands)":
    "Les 3 variantes de la box hebdomadaire (International, Meilleure valeur, Marques françaises)",
  "Specialist protocols & science cards": "Protocoles spécialisés et fiches science",
  "Priority support": "Support prioritaire",
  "Everything in Performance": "Tout ce qui est inclus dans Performance",
  "Apple Health auto-sync": "Synchronisation automatique avec Apple Health",
  "Race-day fueling plans": "Plans de ravitaillement jour de course",
  "1:1 protocol review": "Revue de protocole en tête-à-tête",

  // Subscription page (4-tier reference design)
  "Back to weekly box": "Retour à la box hebdomadaire",
  "Back to account": "Retour au compte",
  "Pick the Fuelnode rhythm you want to continue with":
    "Choisissez le rythme Fuelnode que vous voulez adopter",
  "After your protocol and weekly box selection, choose how Fuelnode should continue. Free keeps protocol access with no delivery. Paid tiers add a recurring box delivery cadence depending on the tier.":
    "Après le choix de votre protocole et de votre box hebdomadaire, choisissez comment Fuelnode doit continuer. La formule Gratuite conserve l'accès au protocole sans livraison. Les formules payantes ajoutent une cadence de livraison de box récurrente selon la formule.",
  "Recommended for your {category} box: {tier}.":
    "Recommandé pour votre box {category} : {tier}.",
  chosen: "choisie",
  Tier: "Formule",
  Price: "Prix",
  Cadence: "Cadence",
  Box: "Box",
  Included: "Inclus",
  "Keep Fuelnode protocol access without any physical box delivery.":
    "Conservez l'accès au protocole Fuelnode sans livraison physique de box.",
  "Base protocol box": "Box protocole de base",
  "8-product base": "Base 8 produits",
  "Same 8-product Amateur base box + 2 support products.":
    "Même box de base Amateur à 8 produits + 2 produits de soutien.",
  "8 + 2 support": "8 + 2 soutien",
  "Same 8-product Amateur base box + 9 premium products as a 14-day fueling block.":
    "Même box de base Amateur à 8 produits + 9 produits premium pour un bloc de ravitaillement de 14 jours.",
  "Premium choice": "Choix premium",
  "8 + 9 premium": "8 + 9 premium",
  "Everything in Free, plus:": "Tout ce qui est dans Gratuit, plus :",
  "Everything in Amateur, plus:": "Tout ce qui est dans Amateur, plus :",
  "Everything in Performance, plus:": "Tout ce qui est dans Performance, plus :",
  "No physical box": "Pas de box physique",
  "Protocol refresh every 24 hours": "Actualisation du protocole toutes les 24 heures",
  "No box delivery": "Pas de livraison de box",
  "Unlimited protocol access*": "Accès illimité au protocole*",
  "Core 8-product protocol base box": "Box protocole de base à 8 produits",
  "Weekly delivery": "Livraison hebdomadaire",
  "The 8-product Amateur base box": "La box de base Amateur à 8 produits",
  "2 support products": "2 produits de soutien",
  "9 extra premium products": "9 produits premium supplémentaires",
  "Continue with Free": "Continuer avec Gratuit",
  "Choose Amateur": "Choisir Amateur",
  "Choose Performance": "Choisir Performance",
  "Choose Elite": "Choisir Elite",
  "Cancel before each cutoff — full refund": "Annulez avant chaque date limite — remboursement intégral",
  "Show box details →": "Voir le détail de la box →",
  "What stays included on every plan": "Ce qui reste inclus dans toutes les formules",
  "AI protocol access": "Accès au protocole IA",
  "Personalised nutritional content": "Contenu nutritionnel personnalisé",
  Newsletters: "Newsletters",
  "Race recommendations": "Recommandations de course",
  "Choose your tier now. If you pick a paid plan, you can continue to payment later from your athlete hub. *For paid subscribers, protocol updates are available every 5 minutes to keep the experience stable.":
    "Choisissez votre formule maintenant. Si vous optez pour une formule payante, vous pourrez procéder au paiement plus tard depuis votre espace athlète. *Pour les abonnés payants, le protocole est actualisé toutes les 5 minutes pour garder l'expérience stable.",
  International: "International",
  "Best value": "Meilleure valeur",
  "French brands": "Marques françaises",

  // Account (sign-in) page
  Account: "Compte",
  "Sign in to open your account": "Connectez-vous pour accéder à votre compte",
  "Your Fuelnode account is protected. Sign in here to access your subscription, contact details, and legal documents.":
    "Votre compte Fuelnode est protégé. Connectez-vous ici pour accéder à votre abonnement, vos coordonnées et vos documents légaux.",
  SMS: "SMS",
  "Magic link by email": "Lien magique par e-mail",
  "Receive a secure link. Fuelnode does not create or store passwords.":
    "Recevez un lien sécurisé. Fuelnode ne crée ni ne stocke de mot de passe.",
  "you@example.com": "vous@exemple.com",
  "Magic link by SMS": "Lien magique par SMS",
  "Receive a secure link by text message.": "Recevez un lien sécurisé par SMS.",
  "+33 6 12 34 56 78": "+33 6 12 34 56 78",
  "Send magic link": "Envoyer le lien magique",
  "I accept the": "J'accepte les",
  "Terms of use": "Conditions d'utilisation",
  and: "et",
  "Privacy policy": "Politique de confidentialité",
  "OR CONTINUE WITH": "OU CONTINUER AVEC",
  "Continue with Google": "Continuer avec Google",
  "Continue with Apple": "Continuer avec Apple",
  "Continue with Yahoo": "Continuer avec Yahoo",
  "Yahoo is only available through a configured custom OAuth/OIDC provider.":
    "Yahoo n'est disponible qu'via un fournisseur OAuth/OIDC personnalisé configuré.",

  // Athlete dashboard page
  "{name}, your athlete hub": "{name}, votre espace athlète",
  "Your onboarding data now lives here as a working athlete profile. Update it anytime to steer your protocol, your event logic, and your next box.":
    "Vos données d'inscription vivent désormais ici, dans un profil athlète actif. Modifiez-le à tout moment pour orienter votre protocole, la logique de votre événement et votre prochaine box.",
  "Athlete hub": "Espace athlète",
  "Your profile is live. Keep it up to date here, review your protocol, and activate a recurring box whenever you want Fuelnode to turn this profile into weekly execution.":
    "Votre profil est actif. Tenez-le à jour ici, consultez votre protocole, et activez une box récurrente dès que vous voulez que Fuelnode transforme ce profil en exécution hebdomadaire.",
  Plan: "Formule",
  "No active plan": "Aucune formule active",
  Status: "Statut",
  Pending: "En attente",
  "Profile updated": "Profil mis à jour",
  "Updated today": "Mis à jour aujourd'hui",
  "Go to dashboard": "Aller au tableau de bord",
  "Race calendar": "Calendrier de courses",
  "No race saved yet": "Aucune course enregistrée pour l'instant",
  "Add a race to unlock event-specific logic, race assortments, and the dedicated event protocol flow.":
    "Ajoutez une course pour débloquer la logique propre à l'événement, les assortiments de course, et le protocole dédié à l'événement.",
  "Add a race": "Ajouter une course",
  "Best routes for you": "Meilleurs parcours pour vous",
  "Routes picked from your sport, your distances, and your race goals.":
    "Parcours sélectionnés selon votre sport, vos distances et vos objectifs de course.",
  "Current subscription": "Abonnement actuel",
  "Free — protocol only": "Gratuit — protocole seul",
  "Amateur — 8 products weekly": "Amateur — 8 produits par semaine",
  "Performance — 10 products weekly": "Performance — 10 produits par semaine",
  "Elite — 17 products / 2 weeks": "Elite — 17 produits / 2 semaines",
  "Your selected plan is saved. Continue to payment when you're ready.":
    "Votre formule sélectionnée est enregistrée. Passez au paiement quand vous êtes prêt.",
  "Complete your subscription to unlock your weekly box.":
    "Complétez votre abonnement pour débloquer votre box hebdomadaire.",
  "You're subscribed - your weekly box is active.":
    "Vous êtes abonné(e) - votre box hebdomadaire est active.",
  "Subscribed ✓ - manage your box from here anytime.":
    "Abonné(e) ✓ - gérez votre box ici à tout moment.",
  "Continue with subscription": "Continuer avec l'abonnement",
  "Please complete both email and phone before continuing.":
    "Veuillez renseigner l'e-mail et le téléphone avant de continuer.",
  "Choose a plan": "Choisir une formule",
  "Preview box": "Aperçu de la box",
  "What your box could look like": "À quoi votre box pourrait ressembler",
  "Even without an active subscription, your profile can preview the kind of products Fuelnode would bias toward right now.":
    "Même sans abonnement actif, votre profil permet d'apercevoir le type de produits que Fuelnode privilégierait actuellement.",
  "Delivery & pickup preferences": "Préférences de livraison et de retrait",
  "Delivery Preferences": "Préférences de livraison",
  "Choose where to collect your Fuelnode box.": "Choisissez où récupérer votre box Fuelnode.",
  "Manage preferences": "Gérer les préférences",
  "Post-delivery feedback": "Retour après livraison",
  "Rate your products": "Évaluez vos produits",
  "Tell us what worked for training, taste, and digestion.":
    "Dites-nous ce qui a fonctionné pour l'entraînement, le goût et la digestion.",
  "Open feedback form": "Ouvrir le formulaire de retour",
  "Customer details": "Coordonnées client",
  "Contact details": "Coordonnées",
  Phone: "Téléphone",
  "Smart locker": "Casier connecté",
  "Zone to confirm · smart locker pickup Friday": "Zone à confirmer · retrait casier connecté le vendredi",
  "Next billing date": "Prochaine date de facturation",
  "No due date": "Aucune échéance",
  "Save my contact details": "Enregistrer mes coordonnées",
  Notifications: "Notifications",
  "High-signal reminders only": "Rappels à signal fort uniquement",
  "Push notifications": "Notifications push",
  "Email notifications": "Notifications par e-mail",
  "Pre-cutoff inactivity reminders": "Rappels d'inactivité avant la date limite",
  "Post-delivery feedback prompts": "Invitations à donner un avis après livraison",
  "1-hour post-race feedback prompts": "Invitations à donner un avis 1h après la course",
  Yes: "Oui",
  No: "Non",
  "Protocol & box": "Protocole et box",
  "Keep your protocol up to date": "Gardez votre protocole à jour",
  "Update my protocol": "Mettre à jour mon protocole",
  "Update my data to regenerate my protocol and box.":
    "Mettez à jour mes données pour régénérer mon protocole et ma box.",
  "Upcoming races": "Courses à venir",
  "What's your next race? Add it to lock your protocol onto it.":
    "Quelle est votre prochaine course ? Ajoutez-la pour y verrouiller votre protocole.",
  "Add your next race →": "Ajouter votre prochaine course →",
  "Pause subscription": "Suspendre l'abonnement",
  "Manage subscription continuity here. Pause requests are recorded operationally and sent to the team.":
    "Gérez ici la continuité de votre abonnement. Les demandes de pause sont enregistrées et transmises à l'équipe.",
  "For the next box, the modification window closes Thursday at noon.":
    "Pour la prochaine box, la fenêtre de modification se ferme jeudi à midi.",
  "Request a pause": "Demander une pause",
  "Health disclaimer": "Avertissement santé",

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
  "Select your delivery day": "Sélectionnez votre jour de livraison",
  "Paris only, for now": "Paris uniquement, pour l'instant",
  "We deliver within Paris only for now — expanding our zone soon.":
    "Nous livrons uniquement à Paris pour l'instant — notre zone s'agrandit bientôt.",
  "You can cancel or change your protocol until Tuesday at noon.":
    "Vous pouvez annuler ou modifier votre protocole jusqu'à mardi midi.",
  "You can collect your box upto 7 days after delivery":
    "Vous pouvez récupérer votre box jusqu'à 7 jours après la livraison",

  // ---------------------------------------------------------------------
  // Order confirmation
  // ---------------------------------------------------------------------
  "Next delivery": "Prochaine livraison",

  // ---------------------------------------------------------------------
  // Onboarding — Step 11
  // ---------------------------------------------------------------------
  "Has nutrition ever cost you a race or ruined a session?":
    "La nutrition vous a-t-elle déjà coûté une course ou gâché une séance ?",
  "Your profile is ready. Fuelnode will now generate your personalized nutrition protocol from your answers, your training level, and your preferences.":
    "Votre profil est prêt. Fuelnode va maintenant générer votre protocole nutritionnel personnalisé à partir de vos réponses, de votre niveau d'entraînement et de vos préférences.",

  // ---------------------------------------------------------------------
  // Onboarding — inline field validation errors (numeric bounds)
  // ---------------------------------------------------------------------
  "Enter a value": "Entrez une valeur",
  "at least": "au moins",
  "more than": "supérieure à",
  "and less than": "et inférieure à",
  "(whole number)": "(nombre entier)",
  "Enter a pace under": "Entrez une allure inférieure à",
  "e.g.": "ex.",

  // ---------------------------------------------------------------------
  // Onboarding — no-change confirmation + generating overlay
  // ---------------------------------------------------------------------
  "No changes detected": "Aucun changement détecté",
  "Your answers are the same as your last submission. Do you want to continue and generate a new protocol anyway?":
    "Vos réponses sont identiques à votre dernière soumission. Voulez-vous quand même continuer et générer un nouveau protocole ?",
  "Go back and review": "Revenir en arrière",
  "Continue anyway": "Continuer quand même",

  // ---------------------------------------------------------------------
  // GeneratingOverlay — Finish / resumed-onboarding wait screen
  // ---------------------------------------------------------------------
  "Analyzing your body metrics and goals...": "Analyse de vos données corporelles et de vos objectifs...",
  "Calculating your optimal macro split...": "Calcul de votre répartition optimale de macronutriments...",
  "Cross-referencing 500+ food combinations for your preferences...":
    "Comparaison de plus de 500 combinaisons alimentaires selon vos préférences...",
  "Balancing protein, carbs, and fats for your activity level...":
    "Équilibrage des protéines, glucides et lipides selon votre niveau d'activité...",
  "Fine-tuning meal timing around your schedule...": "Ajustement du timing des repas selon votre emploi du temps...",
  "Almost there — packaging your personalized protocol...": "Presque terminé — préparation de votre protocole personnalisé...",
  "Nutrition fact": "Le saviez-vous",
  "Did you know? Your muscles keep using protein for up to 24 hours after a workout to repair and grow.":
    "Le saviez-vous ? Vos muscles continuent d'utiliser des protéines jusqu'à 24 heures après l'entraînement pour se réparer et se développer.",
  "Fun fact: Spreading protein evenly across meals builds more muscle than eating it all at dinner.":
    "Anecdote : répartir les protéines uniformément sur les repas construit plus de muscle que de tout consommer au dîner.",
  "Tip: Drinking water before meals can improve digestion and help you feel fuller.":
    "Astuce : boire de l'eau avant les repas peut améliorer la digestion et procurer une sensation de satiété.",
  "Did you know? Carbs restock the glycogen your muscles burn through during endurance training.":
    "Le saviez-vous ? Les glucides reconstituent le glycogène que vos muscles consomment pendant l'entraînement d'endurance.",
  "Fun fact: Bananas are rich in potassium, which helps prevent exercise-induced muscle cramps.":
    "Anecdote : les bananes sont riches en potassium, ce qui aide à prévenir les crampes musculaires liées à l'effort.",
  "Tip: Eating within 30-60 minutes after training speeds up glycogen recovery.":
    "Astuce : manger dans les 30 à 60 minutes après l'entraînement accélère la récupération du glycogène.",
  "Did you know? Caffeine 30-60 minutes before a session can measurably boost endurance performance.":
    "Le saviez-vous ? La caféine prise 30 à 60 minutes avant une séance peut nettement améliorer la performance d'endurance.",
  "Fun fact: Beetroot juice is a natural source of nitrates that can improve running economy.":
    "Anecdote : le jus de betterave est une source naturelle de nitrates qui peut améliorer l'économie de course.",
  "This can take up to a minute — please don't close this page.":
    "Cela peut prendre jusqu'à une minute — veuillez ne pas fermer cette page.",

  // ---------------------------------------------------------------------
  // Protocol page redesign — athlete fueling card / session protocol /
  // meal guidance
  // ---------------------------------------------------------------------
  Athlete: "Athlète",
  "Week {n}": "Semaine {n}",
  "This week, your plan connects your daily intake, workout fueling, and recovery meals.":
    "Cette semaine, votre plan relie votre alimentation quotidienne, votre ravitaillement à l'effort et vos repas de récupération.",
  "Update protocol": "Mettre à jour le protocole",
  "The targets below were raised to the safety floor — do not go under them.":
    "Les objectifs ci-dessous ont été relevés au seuil de sécurité — ne descendez pas en dessous.",
  "Your training load is estimated from the weekly volume you reported — neither your actual intake nor your body composition has been measured.":
    "Votre charge d'entraînement est estimée à partir du volume hebdomadaire que vous avez indiqué — ni votre apport réel ni votre composition corporelle n'ont été mesurés.",
  "These volumes are an indicative range: drink to thirst. Do not force fluid beyond it — overdrinking during exercise risks hyponatremia.":
    "Ces volumes sont une fourchette indicative : buvez selon votre soif. Ne forcez pas au-delà — une hyperhydratation pendant l'effort expose au risque d'hyponatrémie.",
  "This protocol is not medical advice and recommends no supplements. Iron in particular should never be supplemented without blood work and medical advice.":
    "Ce protocole ne constitue pas un avis médical et ne recommande aucun complément. Le fer en particulier ne doit jamais être supplémenté sans bilan sanguin et avis médical.",
  "Athlete fueling card": "Fiche de ravitaillement de l'athlète",
  "Sessions / week": "Séances / semaine",
  Height: "Taille",
  Weight: "Poids",
  "Daily targets": "Objectifs du jour",
  "Fueling rate": "Débit glucidique",
  "kcal on training day": "kcal en jour d'entraînement",
  carbs: "glucides",
  proteins: "protéines",
  fats: "lipides",
  "total hydration · to thirst": "hydratation totale · selon la soif",
  electrolytes: "électrolytes",
  "Computed for a {session_time} session, from your training load, sport, level, and body profile.":
    "Calculé pour une séance en {session_time}, à partir de votre charge d'entraînement, de votre sport, de votre niveau et de votre profil corporel.",
  "your usual": "votre créneau habituel",
  "Early morning": "Tôt le matin",
  Morning: "Matin",
  Afternoon: "Après-midi",
  Evening: "Soir",
  Night: "Nuit",
  "Your off-day targets": "Vos objectifs en jour de repos",
  Calories: "Calories",
  Proteins: "Protéines",
  Fats: "Lipides",
  "Total Hydration": "Hydratation totale",
  Electrolytes: "Électrolytes",
  "Off-day targets correspond to nutrition guidance for days without training: fewer total carbs, calmer hydration, but still enough protein and quality fats to support recovery and next-day readiness.":
    "Les objectifs de jour de repos correspondent aux repères nutritionnels des jours sans entraînement : moins de glucides au total, une hydratation plus calme, mais toujours assez de protéines et de bons lipides pour soutenir la récupération et la séance du lendemain.",

  "Session protocol": "Protocole de séance",
  "This session protocol matches your usual practice and uses the products from your session box.":
    "Ce protocole de séance correspond à votre pratique habituelle et utilise les produits de votre box de séance.",
  "Before the session": "Avant la séance",
  "During the session": "Pendant la séance",
  "After the session": "Après la séance",
  "Box product": "Produit de la box",
  "Why?": "Pourquoi ?",

  "Meal guidance": "Repères repas",
  "Nutrition target": "Objectif nutritionnel",
  "{g}g carbs": "{g}g glucides",
  "{g}g proteins": "{g}g protéines",
  "{g}g fats": "{g}g lipides",
  "Generic recommendation": "Recommandation générique",
  "Source examples": "Exemples de sources",
  "Carbs:": "Glucides :",
  "Proteins:": "Protéines :",
  "Fats:": "Lipides :",
  "Ready to review your weekly box?": "Prêt à découvrir votre box hebdomadaire ?",
  "Discover the 3 session-box options, compare their fueling logic, and choose your usual assortment.":
    "Découvrez les 3 options de box de séance, comparez leur logique de ravitaillement, et choisissez votre assortiment habituel.",
  "Discover my box": "Découvrir ma box",
  "Pre-session meal": "Repas avant séance",
  "Pre-session snack": "Collation avant séance",
  Recovery: "Récupération",
  "Main meal": "Repas principal",
  Breakfast: "Petit-déjeuner",
  Lunch: "Déjeuner",
  Dinner: "Dîner",
  "This meal bridges your day and your session, topping up energy without weighing you down.":
    "Ce repas fait le lien entre votre journée et votre séance, en refaisant le plein d'énergie sans vous alourdir.",
  "This snack bridges the gap between your last meal and the start, without restarting a full digestion.":
    "Cette collation comble l'écart entre votre dernier repas et le départ, sans relancer une digestion complète.",
  "This window kickstarts recovery right after the session, while your body is most receptive to it.":
    "Cette fenêtre relance la récupération juste après la séance, quand votre corps y est le plus réceptif.",
  "This meal is above all about restarting recovery and setting up tomorrow's session.":
    "Ce repas vise avant tout à relancer la récupération et à préparer la séance de demain.",
  "This meal starts the day and lays down much of your energy for it.":
    "Ce repas ouvre la journée et pose une bonne partie de votre énergie pour la suite.",
  "This is the day's central meal — it tops you back up and keeps energy steady.":
    "C'est le repas central de la journée — il fait le plein et maintient l'énergie stable.",
  "This dinner is above all about restarting recovery right after your session.":
    "Ce dîner vise avant tout à relancer la récupération juste après votre séance.",
  "Between {start} and {end}": "Entre {start} et {end}",

  // Goal pill short labels (src/data/mealGuidanceContent.js)
  Endurance: "Endurance",
  "Race prep": "Préparation course",
  "Body composition": "Composition corporelle",
  "Fueling tolerance": "Tolérance digestive",
  Simplicity: "Simplicité",

  // Specialist protocols (real field names: protocol_name, trigger_reason,
  // modifications_to_core, duration, additional_products, removed_products)
  "Added to your box": "Ajouté à votre box",
  "Removed from your box": "Retiré de votre box",

  // Race day (protocol.fueling_protocol.race_day — only shown once populated)
  "Race day": "Jour de course",
  "Wake up": "Réveil",
  "T-90 min": "T-90 min",
  "T-60 min": "T-60 min",
  "T-30 min": "T-30 min",
  "T-15 min": "T-15 min",
  "During the race": "Pendant la course",
  "Race finish": "Arrivée",

  // ---------------------------------------------------------------------
  // Admin panel (AccountBar link + Admin/AdminPanel, UserManagement, ProductManagement)
  // ---------------------------------------------------------------------
  Admin: "Admin",
  "Admin panel": "Panneau d'administration",
  "Manage registered users and the product catalog.": "Gérez les utilisateurs inscrits et le catalogue produits.",
  "User Management": "Gestion des utilisateurs",
  "Product Management": "Gestion des produits",
  Actions: "Actions",

  "Loading users…": "Chargement des utilisateurs…",
  "Couldn't load users. Please try again.": "Impossible de charger les utilisateurs. Veuillez réessayer.",
  "Couldn't update that user's status.": "Impossible de modifier le statut de cet utilisateur.",
  "Couldn't update that user's role.": "Impossible de modifier le rôle de cet utilisateur.",
  Name: "Nom",
  Email: "E-mail",
  Role: "Rôle",
  Status: "Statut",
  Joined: "Inscrit le",
  "Last login": "Dernière connexion",
  you: "vous",
  Athlete: "Athlète",
  Enabled: "Activé",
  Disabled: "Désactivé",
  Enable: "Activer",
  Disable: "Désactiver",
  Promote: "Promouvoir",
  Demote: "Rétrograder",
  "No users yet.": "Aucun utilisateur pour le moment.",
  "No users match your search.": "Aucun utilisateur ne correspond à votre recherche.",
  "Search by name or email…": "Rechercher par nom ou e-mail…",

  "Loading products…": "Chargement des produits…",
  "Couldn't load products. Please try again.": "Impossible de charger les produits. Veuillez réessayer.",
  "Couldn't save this product. Check the fields and try again.":
    "Impossible d'enregistrer ce produit. Vérifiez les champs et réessayez.",
  "Couldn't delete this product. Please try again.": "Impossible de supprimer ce produit. Veuillez réessayer.",
  "Add product": "Ajouter un produit",
  "Edit product": "Modifier le produit",
  Brand: "Marque",
  Product: "Produit",
  "Product name": "Nom du produit",
  Category: "Catégorie",
  "Protocol slot": "Créneau du protocole",
  Stock: "Stock",
  "Stock quantity": "Quantité en stock",
  "Price (EUR)": "Prix (EUR)",
  "Retail price (EUR)": "Prix de vente (EUR)",
  Edit: "Modifier",
  Delete: "Supprimer",
  "Confirm delete": "Confirmer la suppression",
  Cancel: "Annuler",
  Save: "Enregistrer",
  "Saving…": "Enregistrement…",
  "No products yet.": "Aucun produit pour le moment.",
  "No products match your search.": "Aucun produit ne correspond à votre recherche.",
  "Search by brand, product, category, or slot…": "Rechercher par marque, produit, catégorie ou créneau…",

  // Pagination (Admin/Pagination.jsx) - shared by both tabs
  "{count} result(s)": "{count} résultat(s)",
  Previous: "Précédent",
  Next: "Suivant",
  "Page {page} of {total}": "Page {page} sur {total}",
  "Show advanced fields": "Afficher les champs avancés",
  "Hide advanced fields": "Masquer les champs avancés",
  "Catalog tier": "Niveau de catalogue",
  Format: "Format",
  Phase: "Phase",
  "Athlete level": "Niveau d'athlète",
  "Brand origin": "Origine de la marque",
  "Sport fit": "Adéquation sportive",
  "Target demographic": "Public cible",
  "Market role": "Rôle sur le marché",
  "Innovation score": "Score d'innovation",
  "Innovativeness band": "Bande d'innovation",
  "Market fit (Paris) score": "Score d'adéquation marché (Paris)",
  "Paris market viability": "Viabilité marché parisien",
  "Premium perception score": "Score de perception premium",
  "Premium band": "Bande premium",
  "Elite tier fit score": "Score d'adéquation niveau élite",
  "Elite recommendation": "Recommandation élite",
  "Margin status": "Statut de marge",
  "Innovation rationale": "Justification de l'innovation",
};

export default fr;
