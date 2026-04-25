import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RpDemoPage from './pages/RpDemoPage';
import LoginPage from './pages/LoginPage';
import OtpPage from './pages/OtpPage';
import ConsentPage from './pages/ConsentPage';
import SuccessPage from './pages/SuccessPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import SecurityPage from './pages/SecurityPage';
import AuditLogPage from './pages/AuditLogPage';
import DeveloperPortalPage from './pages/DeveloperPortalPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-aadhaar-dark">
        <Routes>
          {/* OIDC Auth Flow */}
          <Route path="/" element={<RpDemoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/consent" element={<ConsentPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/callback" element={<RpDemoPage />} />

          {/* Dashboard (post-auth) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="developer" element={<DeveloperPortalPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
