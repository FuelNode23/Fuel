import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./AccountBar.css";

/**
 * Floating "logged in as X" indicator + logout, shown on every
 * authenticated page. Renders nothing when signed out, so it's safe to
 * drop into a page unconditionally (e.g. both the auth gate and the
 * question wizard in OnboardingFlow) without extra checks at the call site.
 */
export default function AccountBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="account-bar">
      <span className="account-bar__name">{user.fullName}</span>
      <button type="button" className="account-bar__logout" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}
