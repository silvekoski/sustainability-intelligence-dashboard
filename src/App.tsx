import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthLayout } from './components/auth/AuthLayout';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ProfileSettings } from './components/auth/ProfileSettings';
import { DashboardOverview } from './pages/DashboardOverview';
import { DashboardAnalytics } from './pages/DashboardAnalytics';
import { DashboardPlants } from './pages/DashboardPlants';
import { DashboardCompliance } from './pages/DashboardCompliance';
import { DashboardReports } from './pages/DashboardReports';
import { DashboardBenchmarking } from './pages/DashboardBenchmarking';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={
              <LoginForm />
            } />
            <Route path="register" element={
              <RegisterForm />
            } />
            <Route path="forgot-password" element={
              <ForgotPasswordForm />
            } />
          </Route>

          {/* Legacy auth routes (redirect to new structure) */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />


          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="dashboard/analytics" element={<DashboardAnalytics />} />
            <Route path="dashboard/plants" element={<DashboardPlants />} />
            <Route path="dashboard/compliance" element={<DashboardCompliance />} />
            <Route path="dashboard/reports" element={<DashboardReports />} />
            <Route path="dashboard/benchmarking" element={<DashboardBenchmarking />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;