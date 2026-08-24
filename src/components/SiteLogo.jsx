import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/fuelnode-logo.png";
import "./SiteLogo.css";

// Pages that already build their own logo treatment inline (Landing's own
// <Nav>, Login's hero-pane brand block) - this generic top-left overlay
// would either duplicate or visually collide with those, so it stays out
// of the way there and only fills in the pages that have no logo at all.
const SUPPRESSED_ROUTES = ["/landing", "/login"];

/**
 * Fixed top-left brand mark, rendered once at the app root (see App.jsx)
 * so it persists across every route that doesn't already have its own -
 * unlike AccountBar (top-right, renders nothing unless signed in), this
 * shows regardless of auth state. Clicking it goes to whichever "home"
 * makes sense for the current session: the athlete hub if signed in,
 * otherwise the marketing landing page - same destination pattern
 * AccountBar's own nav links use.
 */
export default function SiteLogo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (SUPPRESSED_ROUTES.includes(pathname)) return null;

  return (
    <button
      type="button"
      className="site-logo"
      onClick={() => navigate(user ? "/athlete-dashboard" : "/landing")}
      aria-label="FuelNode"
    >
      <img src={logo} alt="" className="site-logo__image" />
      <span className="site-logo__wordmark">
        Fuel<span className="site-logo__wordmark-accent">Node</span>
      </span>
    </button>
  );
}
