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

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('[App] Rendering App component');
  
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;