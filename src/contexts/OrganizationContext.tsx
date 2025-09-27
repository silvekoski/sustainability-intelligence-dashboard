import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Organization, OrganizationUser, OrganizationStats, LicenseInfo } from '../types/organization';
import { OrganizationService } from '../services/organizationService';
import { useAuth } from './AuthContext';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  userOrganizations: OrganizationUser[];
  organizationStats: OrganizationStats | null;
  licenseInfo: LicenseInfo | null;
  pendingInvitations: OrganizationUser[];
  loading: boolean;
  
  // Actions
  createOrganization: (data: { name: string; slug: string }) => Promise<{ error: any }>;
  switchOrganization: (organizationId: string) => Promise<{ error: any }>;
  inviteUser: (email: string, role: 'admin' | 'user') => Promise<{ error: any }>;
  acceptInvitation: (invitationId: string) => Promise<{ error: any }>;
  declineInvitation: (invitationId: string) => Promise<{ error: any }>;
  refreshData: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<OrganizationUser[]>([]);
  const [organizationStats, setOrganizationStats] = useState<OrganizationStats | null>(null);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, initialized } = useAuth();

  // Load organization data when user is authenticated
  useEffect(() => {
    if (initialized && user) {
      loadOrganizationData();
    } else if (initialized && !user) {
      // Clear data when user logs out
      setCurrentOrganization(null);
      setUserOrganizations([]);
      setOrganizationStats(null);
      setLicenseInfo(null);
      setPendingInvitations([]);
      setLoading(false);
    }
  }, [user, initialized]);

  const loadOrganizationData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Load all data in parallel
      const [
        currentOrgResult,
        userOrgsResult,
        pendingInvitationsResult
      ] = await Promise.all([
        OrganizationService.getCurrentOrganization(),
        OrganizationService.getUserOrganizations(),
        OrganizationService.getPendingInvitations()
      ]);

      if (userOrgsResult.data) {
        setUserOrganizations(userOrgsResult.data);
      }

      if (pendingInvitationsResult.data) {
        setPendingInvitations(pendingInvitationsResult.data);
      }

      if (currentOrgResult.data) {
        setCurrentOrganization(currentOrgResult.data);
        
        // Load organization-specific data
        const [statsResult, licenseResult] = await Promise.all([
          OrganizationService.getOrganizationStats(currentOrgResult.data.id),
          OrganizationService.getLicenseInfo(currentOrgResult.data.id)
        ]);

        if (statsResult.data) {
          setOrganizationStats(statsResult.data);
        }

        if (licenseResult.data) {
          setLicenseInfo(licenseResult.data);
        }
      } else {
        setCurrentOrganization(null);
        setOrganizationStats(null);
        setLicenseInfo(null);
      }
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (data: { name: string; slug: string }) => {
    const result = await OrganizationService.createOrganization(data);
    
    if (!result.error) {
      // Refresh data to get the new organization
      await loadOrganizationData();
    }
    
    return { error: result.error };
  };

  const switchOrganization = async (organizationId: string) => {
    const result = await OrganizationService.switchOrganization(organizationId);
    
    if (!result.error) {
      // Refresh data to get the new current organization
      await loadOrganizationData();
    }
    
    return { error: result.error };
  };

  const inviteUser = async (email: string, role: 'admin' | 'user') => {
    if (!currentOrganization) {
      return { error: { message: 'No organization selected' } };
    }

    const result = await OrganizationService.inviteUser(currentOrganization.id, { email, role });
    
    if (!result.error) {
      // Refresh stats to update member count
      const statsResult = await OrganizationService.getOrganizationStats(currentOrganization.id);
      if (statsResult.data) {
        setOrganizationStats(statsResult.data);
      }
    }
    
    return { error: result.error };
  };

  const acceptInvitation = async (invitationId: string) => {
    const result = await OrganizationService.acceptInvitation(invitationId);
    
    if (!result.error) {
      // Refresh all data since user joined a new organization
      await loadOrganizationData();
    }
    
    return { error: result.error };
  };

  const declineInvitation = async (invitationId: string) => {
    const result = await OrganizationService.declineInvitation(invitationId);
    
    if (!result.error) {
      // Remove from pending invitations
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    }
    
    return { error: result.error };
  };

  const refreshData = async () => {
    await loadOrganizationData();
  };

  const value: OrganizationContextType = {
    currentOrganization,
    userOrganizations,
    organizationStats,
    licenseInfo,
    pendingInvitations,
    loading,
    createOrganization,
    switchOrganization,
    inviteUser,
    acceptInvitation,
    declineInvitation,
    refreshData
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}