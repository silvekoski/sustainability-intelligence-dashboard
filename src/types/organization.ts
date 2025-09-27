export interface Organization {
  id: string;
  name: string;
  slug: string;
  license_type: 'trial' | 'basic' | 'premium' | 'enterprise';
  license_expires_at: string;
  max_users: number;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationUser {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'user';
  invited_by?: string;
  invited_at: string;
  joined_at?: string;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
  // Joined data
  organization?: Organization;
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
  invited_by_user?: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
}

export interface InviteUserData {
  email: string;
  role: 'admin' | 'user';
}

export interface OrganizationStats {
  total_users: number;
  active_users: number;
  pending_invitations: number;
  license_days_remaining: number;
}

export interface LicenseInfo {
  type: 'trial' | 'basic' | 'premium' | 'enterprise';
  expires_at: string;
  days_remaining: number;
  max_users: number;
  features: string[];
  is_expired: boolean;
  is_expiring_soon: boolean; // < 7 days
}