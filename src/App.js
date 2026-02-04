import React, { useContext } from "react";
import PublicRegistrationPage from "./pages/PublicRegistrationPage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
// Layout and Pages
import DashboardLayout from "./components/layout/DashboardLayout";
import LoginPage from "./components/auth/LoginPage";
import PrivateRoute from "./components/routing/PrivateRoute";

// --- IMPORT NEW PAGES ---
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
// ------------------------

// Role-specific Dashboards
// ... (OPHomePage, DoctorHomePage, etc.)
import OPHomePage from "./pages/OPHomePage";
import DoctorHomePage from "./pages/DoctorHomePage";
import PharmacyHomePage from "./pages/PharmacyHomePage";
import LabHomePage from "./pages/LabHomePage";
import OfficeHomePage from "./pages/OfficeHomePage";
import MasterHomePage from "./pages/MasterHomePage";

const AppContent = () => {

  return (
    <Routes>
      {/* --- ADD PUBLIC ROUTES HERE --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/public-registration" element={<PublicRegistrationPage />} />
      {/* ------------------------------ */}

      {/* All protected routes are nested under the DashboardLayout */}
      <Route element={<DashboardLayout />}>
        {/* Redirect root path to role-specific dashboard or login */}


        {/* OP Routes */}
        <Route element={<PrivateRoute roles={["OP"]} />}>
          <Route path="op" element={<OPHomePage />} />
        </Route>

        {/* ... other private routes ... */}
        <Route element={<PrivateRoute roles={["Doctor"]} />}>
          <Route path="doctor" element={<DoctorHomePage />} />
        </Route>
        <Route element={<PrivateRoute roles={["Pharmacy"]} />}>
          <Route path="pharmacy" element={<PharmacyHomePage />} />
        </Route>
        <Route element={<PrivateRoute roles={["Lab"]} />}>
          <Route path="lab" element={<LabHomePage />} />
        </Route>
        <Route element={<PrivateRoute roles={["Office"]} />}>
          <Route path="office" element={<OfficeHomePage />} />
        </Route>
        <Route element={<PrivateRoute roles={["Master"]} />}>
          <Route path="master" element={<MasterHomePage />} />
        </Route>
      </Route>

      {/* Fallback route for any other path */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
