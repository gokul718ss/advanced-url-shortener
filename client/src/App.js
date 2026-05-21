import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';

// Premium Design System
import './styles/design-system.css';
import './styles/components-library.css';
import './styles/premium-dashboard.css';
import './styles/ai-insights.css';
import './styles/advanced-analytics.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/os-components.css';
import './styles/os-dashboard.css';
import './styles/premium-overhaul.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CreateLink from './pages/CreateLink';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import UrlTable from './components/UrlTable';
import CommandPalette from './components/CommandPalette';

// Wrapper to redirect authenticated users away from auth routes
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <>
      <div className="aurora-bg"><div className="aurora-bg-center"></div></div>
      <div className="noise-overlay"></div>
      <Routes>
        {/* Public Routes */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="links" element={<UrlTable />} />
        <Route path="create" element={<CreateLink />} />
        <Route path="analytics" element={<Navigate to="/dashboard" replace />} />
        <Route path="analytics/:shortCode" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <UIProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <CommandPalette />
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'toast-custom',
              duration: 4000,
              style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: 'var(--bg-secondary)' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: 'var(--bg-secondary)' },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </UIProvider>
  );
};

export default App;
