import React from 'react';
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

  // Show loading while auth is initializing
  if (!initialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-lg font-medium text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  // If no user, let the auth system handle it
  if (!user) {
    return <>{children}</>;
  }

  // Show loading while organization data is loading
  if (orgLoading) {
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
    return (
      <OrganizationSelector 
        onComplete={() => {
          // This will trigger a re-render with the selected organization
        }} 
      />
    );
  }

  // User has an organization, show the protected content
  return <>{children}</>;
};