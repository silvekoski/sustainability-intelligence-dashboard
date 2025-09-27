import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { OrganizationGuard } from './components/auth/OrganizationGuard';
import { AuthLayout } from './components/auth/AuthLayout';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ProfileSettings } from './components/auth/ProfileSettings';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <OrganizationProvider>
          <OrganizationGuard>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginForm />
                  </ProtectedRoute>
                } />
                <Route path="register" element={
                  <ProtectedRoute requireAuth={false}>
                    <RegisterForm />
                  </ProtectedRoute>
                } />
                <Route path="forgot-password" element={
                  <ProtectedRoute requireAuth={false}>
                    <ForgotPasswordForm />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Legacy auth routes (redirect to new structure) */}
              <Route path="/login" element={<Navigate to="/auth/login" replace />} />
              <Route path="/register" element={<Navigate to="/auth/register" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />

              {/* Protected routes */}
              <Route path="/" element={
                <DashboardLayout />
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="settings" element={<ProfileSettings />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </OrganizationGuard>
        </OrganizationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;