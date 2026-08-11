import { Icon } from "./Icons.jsx";

// All display strings here are the English source text — pass them through
// t() at render time in Hero/HowItWorks/Delivery to get the French version
// from src/i18n/fr.js. Only "value"/"item" fields that are raw data
// (measurements, product names) are left untranslated.

export const heroBadges = [
  { icon: Icon.Zap, label: "Fuel adapted to your effort" },
  { icon: Icon.Droplets, label: "Hydration adjusted to conditions" },
  { icon: Icon.Package, label: "Box prepared every week" },
  { icon: Icon.MapPin, label: "Flexible pickup-point delivery" },
];

export const steps = [
  {
    icon: Icon.Activity,
    n: "01",
    title: "Smart analysis",
    body: "Connect your training data or fill in your athletic profile, your goal, and your digestive preferences.",
  },
  {
    icon: Icon.Cpu,
    n: "02",
    title: "Personalized protocol",
    body: "FuelNode calculates your exact carb, sodium, and hydration needs based on your sport, the weather, and your training phase.",
  },
  {
    icon: Icon.Package,
    n: "03",
    title: "Box assembled and delivered",
    body: "Your weekly box is automatically prepared and delivered to a pickup point or smart locker near you.",
  },
];

export const deliveryPoints = [
  { icon: Icon.ShoppingBag, label: "Precise weekly assembly" },
  { icon: Icon.CalendarCheck, label: "Pickup at a relay point or smart locker" },
  { icon: Icon.MapPin, label: "Availability aligned with your schedule" },
];

export const boxItems = [
  "Maurten Gel 160",
  "Skratch Hydration Mix",
  "Naak Ultra Energy Bar",
  "Electrolyte capsules",
];

export const heroPanel = {
  session: "Long run",
  weekTag: "Key week",
  stats: [
    { icon: Icon.Clock, label: "Duration", value: "2h15" },
    { icon: Icon.Thermometer, label: "Temperature", value: "28°C" },
    { icon: Icon.Wind, label: "Humidity", value: "72%" },
  ],
  macros: [
    { label: "Carbs/h", value: "72g", tone: "fn-accent" },
    { label: "Sodium/h", value: "820mg", tone: "fn-cyan-text" },
    { label: "Fluids/h", value: "750ml", tone: "" },
  ],
};
