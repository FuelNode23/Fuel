import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { APP_URL_SCHEME } from "../native/platform.js";

/**
 * Web-only bounce page. When checkout is started from the mobile app, the
 * backend points Stripe's success/cancel URLs at
 *   https://app.fuelnode.fr/app-return/<route>?<query>
 * (Stripe only accepts https URLs). This page - opened inside the in-app
 * browser - hands control back to the app via the fuelnode:// scheme,
 * e.g. fuelnode://order-confirmed?plan=elite. The button is the fallback
 * for browsers that block a scheme redirect without a user tap.
 */
export default function AppReturn() {
  const { pathname, search } = useLocation();
  const { t } = useLanguage();
  const target = pathname.replace(/^\/app-return\/?/, "");
  const deepLink = `${APP_URL_SCHEME}://${target}${search}`;

  useEffect(() => {
    window.location.href = deepLink;
  }, [deepLink]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className="card" style={{ maxWidth: 420, textAlign: "center", padding: "2rem", background: "rgba(10,14,26,0.9)", borderRadius: "1rem", color: "#f4f7fb" }}>
        <h2 style={{ marginTop: 0 }}>{t("Returning to the FuelNode app...")}</h2>
        <p>{t("If nothing happens, tap the button below.")}</p>
        <a
          href={deepLink}
          style={{ display: "inline-block", marginTop: "1rem", padding: "0.8rem 1.4rem", borderRadius: "0.75rem", background: "#22c55e", color: "#0a0e1a", fontWeight: 700, textDecoration: "none" }}
        >
          {t("Open FuelNode app")}
        </a>
      </div>
    </div>
  );
}
