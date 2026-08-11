import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { completePendingOnboarding } from "../api/client.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      const resumed = await completePendingOnboarding(navigate);
      if (!resumed) navigate("/landing");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Login failed. Please check your credentials.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="form-card">
        <div className="form-card__topbar">
          <LanguageToggle />
        </div>
        <h1>{t("Log in")}</h1>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            {t("Email")}
            <input
              type="email"
              placeholder={t("Enter your email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            {t("Password")}
            <input
              type="password"
              placeholder={t("Enter your password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? t("Logging in...") : t("Log in")}
          </button>
        </form>

        <p>
          {t("Don't have an account?")} <Link to="/register">{t("Sign up")}</Link>
        </p>

        <CopyrightFooter />
      </div>
    </div>
  );
}
