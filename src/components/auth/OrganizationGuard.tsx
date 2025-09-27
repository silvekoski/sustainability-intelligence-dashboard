import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { OrganizationSelector } from './OrganizationSelector';

interface OrganizationGuardProps {
  children: React.ReactNode;
}

export const OrganizationGuard: React.FC<OrganizationGuardProps> = ({ children }) => {
  const { user, loading: authLoading, initialized } = useAuth();
  const { currentOrganization, loading: orgLoading } = useOrganization();
  const location = useLocation();

  console.log('[OrganizationGuard] State:', {
    user: !!user,
    authLoading,
    initialized,
    orgLoading,
    currentOrganization: !!currentOrganization,
    pathname: location.pathname
  });

  // Show loading while auth is initializing
  if (!initialized) {
    console.log('[OrganizationGuard] Auth not initialized, showing loader');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-lg font-medium text-gray-700">Initializing...</span>
        </div>
      </div>
    );
  }

  // If on auth routes, don't apply organization guard
  if (location.pathname.startsWith('/auth/')) {
    console.log('[OrganizationGuard] On auth route, allowing access');
    return <>{children}</>;
  }

  // If no user, redirect to login
  if (!user) {
    console.log('[OrganizationGuard] No user, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Show loading while organization data is loading
  if (orgLoading) {
    console.log('[OrganizationGuard] Organization loading, showing loader');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-lg font-medium text-gray-700">Loading organization...</span>
        </div>
      </div>
    );
  }

  // If user has no current organization, show organization selector
  if (!currentOrganization) {
    console.log('[OrganizationGuard] No current organization, showing selector');
    return (
      <OrganizationSelector 
        onComplete={() => {
          console.log('[OrganizationGuard] Organization selection completed');
          // Force a page refresh to ensure clean state
          window.location.reload();
        }} 
      />
    );
  }

  // User has an organization, show the protected content
  console.log('[OrganizationGuard] All checks passed, showing protected content');
  return <>{children}</>;
};