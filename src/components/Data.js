import { Icon } from "./Icons.jsx";

export const heroBadges = [
  { icon: Icon.Zap, label: "Fuel adapté à votre effort" },
  { icon: Icon.Droplets, label: "Hydratation ajustée aux conditions" },
  { icon: Icon.Package, label: "Box préparée chaque semaine" },
  { icon: Icon.MapPin, label: "Livraison flexible en point relais" },
];

export const steps = [
  {
    icon: Icon.Activity,
    n: "01",
    title: "Analyse intelligente",
    body: "Connectez vos données d'entraînement ou renseignez votre profil sportif, votre objectif et vos préférences digestives.",
  },
  {
    icon: Icon.Cpu,
    n: "02",
    title: "Protocole personnalisé",
    body: "FuelNode calcule vos besoins exacts en glucides, sodium et hydratation selon votre sport, la météo et la phase d'entraînement.",
  },
  {
    icon: Icon.Package,
    n: "03",
    title: "Box assemblée et livrée",
    body: "Votre box hebdomadaire est préparée automatiquement et livrée en point relais ou smart locker proche de vous.",
  },
];

export const deliveryPoints = [
  { icon: Icon.ShoppingBag, label: "Assemblage hebdomadaire précis" },
  { icon: Icon.CalendarCheck, label: "Retrait en point relais ou smart locker" },
  { icon: Icon.MapPin, label: "Disponibilité alignée à votre calendrier" },
];

export const boxItems = [
  "Maurten Gel 160",
  "Skratch Hydration Mix",
  "Naak Ultra Energy Bar",
  "Capsules électrolytes",
];

export const heroPanel = {
  session: "Sortie longue",
  weekTag: "Semaine clé",
  stats: [
    { icon: Icon.Clock, label: "Durée", value: "2h15" },
    { icon: Icon.Thermometer, label: "Température", value: "28°C" },
    { icon: Icon.Wind, label: "Humidité", value: "72%" },
  ],
  macros: [
    { label: "Glucides/h", value: "72g", tone: "fn-accent" },
    { label: "Sodium/h", value: "820mg", tone: "fn-cyan-text" },
    { label: "Liquides/h", value: "750ml", tone: "" },
  ],
};