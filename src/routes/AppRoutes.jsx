// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Landing from "../pages/Landing";
import Register from "../pages/Register";
import OnboardingFlow from "../pages/OnboardingFlow";
import Protocol from "../pages/Protocol" ;
import WeeklyBox from "../pages/Weeklybox";
import Profile from "../pages/Profile";
import Dashboard from "../pages/Dashboard";
import Subscriptions from "../pages/Subscriptions";
import Account from "../pages/Account";
import AthleteDashboard from "../pages/AthleteDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* App starts on the landing/onboarding flow, not Login - Login is
          only reached explicitly (nav, logout) or after onboarding's
          Finish step for a visitor who isn't authenticated yet. */}
      <Route path="/" element={<Navigate to="/landing" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/landing" element={<Landing />} />

      <Route path="/onboarding" element={<OnboardingFlow />} />

       <Route path="/protocol" element={<Protocol />} />

        <Route path="/weeklybox" element={<WeeklyBox />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/dashboard" element={<Dashboard />} />

      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
};

export default AppRoutes;