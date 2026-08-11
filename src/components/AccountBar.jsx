import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./AccountBar.css";

function formatLastLogin(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Floating "welcome back" indicator + logout, shown on every authenticated
 * page. Renders nothing when signed out, so it's safe to drop into a page
 * unconditionally (e.g. both the auth gate and the question wizard in
 * OnboardingFlow) without extra checks at the call site.
 */
export default function AccountBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const firstName = user.fullName?.split(" ")[0] || user.fullName;
  const lastLoginText = formatLastLogin(user.lastLoginAt);

  return (
    <div className="account-bar">
      <div className="account-bar__greeting">
        <span className="account-bar__welcome">Welcome, {firstName}</span>
        {lastLoginText && (
          <span className="account-bar__last-login">Last login: {lastLoginText}</span>
        )}
      </div>
      <button type="button" className="account-bar__logout" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}
