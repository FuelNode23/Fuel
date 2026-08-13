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
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/landing" element={<Landing />} />

      <Route path="/onboarding" element={<OnboardingFlow />} />

       <Route path="/protocol" element={<Protocol />} />

        <Route path="/weeklybox" element={<WeeklyBox />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/dashboard" element={<Dashboard />} />

        {/* Singular path matches the reference design's URL
            (localhost:3000/subscription); /subscriptions kept as an alias
            so any older link/bookmark still resolves. */}
        <Route path="/subscription" element={<Subscriptions />} />
        <Route path="/subscriptions" element={<Subscriptions />} />

        <Route path="/account" element={<Account />} />

        <Route path="/athlete-dashboard" element={<AthleteDashboard />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;