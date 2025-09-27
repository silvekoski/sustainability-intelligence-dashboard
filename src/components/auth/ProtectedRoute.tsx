import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children, 
  requireAuth = true 
}) => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth is initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-lg font-medium text-gray-700">Initializing...</span>
        </div>
      </div>
    );
  }

  // If route requires auth and user is not authenticated, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route doesn't require auth and user is authenticated, redirect to dashboard
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};