import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { completePendingOnboarding } from "../api/client.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import CopyrightFooter from "../components/CopyrightFooter.jsx";
import "./Login.css";

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("Password must be at least 8 characters long."));
      return;
    }

    setSubmitting(true);

    try {
      await register(email, password, fullName);

      // register() already persists a session, so if the person came from
      // onboarding, finish that submission now instead of making them log
      // in again just to redo the same request.
      const resumed = await completePendingOnboarding(navigate);
      if (!resumed) navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Registration failed. Please try again.")
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
        <h1>{t("Create your account")}</h1>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            {t("Full Name")}
            <input
              type="text"
              placeholder={t("Enter your full name")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

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
              minLength={8}
              required
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? t("Creating account...") : t("Sign Up")}
          </button>
        </form>

        <p>
          {t("Already have an account?")} <Link to="/login">{t("Log in")}</Link>
        </p>

        <CopyrightFooter />
      </div>
    </div>
  );
}
