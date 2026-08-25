import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { Icon } from "../../components/Icons.jsx";
import AccountBar from "../../components/AccountBar.jsx";
import UserManagement from "./UserManagement.jsx";
import ProductManagement from "./ProductManagement.jsx";
import "./Admin.css";

const TABS = [
  { key: "users", label: "User Management", icon: Icon.User },
  { key: "products", label: "Product Management", icon: Icon.Package },
];

/**
 * Top-level admin page - only reachable via the AccountBar "Admin" link,
 * which only renders for user.role === "ADMIN" (see AccountBar.jsx). The
 * redirect below is a UX nicety for anyone who lands here directly (typed
 * URL, bookmark, back button after a role change); it is not the real
 * security boundary - every request either tab makes is independently
 * gated server-side by SecurityConfig's hasRole("ADMIN").
 */
export default function AdminPanel() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") {
      navigate("/landing", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="admin-panel">
      <AccountBar />
      <div className="admin-panel__container">
        <div className="admin-panel__header">
          <span className="admin-panel__eyebrow">
            <Icon.Shield width={14} height={14} />
            {t("Admin")}
          </span>
          <h1 className="admin-panel__title">{t("Admin panel")}</h1>
          <p className="admin-panel__subtitle">
            {t("Manage registered users and the product catalog.")}
          </p>
        </div>

        <div className="admin-panel__tabs" role="tablist">
          {TABS.map(({ key, label, icon: TabIcon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              className={`admin-panel__tab${activeTab === key ? " admin-panel__tab--active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <TabIcon width={16} height={16} />
              {t(label)}
            </button>
          ))}
        </div>

        <div className="admin-panel__content">
          {activeTab === "users" ? <UserManagement /> : <ProductManagement />}
        </div>
      </div>
    </div>
  );
}
