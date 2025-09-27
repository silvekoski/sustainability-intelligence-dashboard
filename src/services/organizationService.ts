import { supabase } from '../lib/supabase';
import { Organization, OrganizationUser, CreateOrganizationData, InviteUserData, OrganizationStats, LicenseInfo } from '../types/organization';

export class OrganizationService {
  // Create new organization
  static async createOrganization(data: CreateOrganizationData) {
    try {
      const { data: result, error } = await supabase.rpc('create_organization_with_owner', {
        org_name: data.name,
        org_slug: data.slug
      });

      if (error) throw error;
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Get user's organizations
  static async getUserOrganizations() {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'active');

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Get current organization
  static async getCurrentOrganization(): Promise<{ data: Organization | null; error: any }> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.current_organization_id) {
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.current_organization_id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Switch current organization
  static async switchOrganization(organizationId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          current_organization_id: organizationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: this.formatError(error) };
    }
  }

  // Get organization members
  static async getOrganizationMembers(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .select(`
          *,
          user:profiles!organization_users_user_id_fkey(id, email, full_name),
          invited_by_user:profiles!organization_users_invited_by_fkey(id, email, full_name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Invite user to organization
  static async inviteUser(organizationId: string, inviteData: InviteUserData) {
    try {
      const { data, error } = await supabase.rpc('invite_user_to_organization', {
        org_id: organizationId,
        user_email: inviteData.email,
        user_role: inviteData.role
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Get pending invitations for current user
  static async getPendingInvitations() {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .select(`
          *,
          organization:organizations(*),
          invited_by_user:profiles!organization_users_invited_by_fkey(id, email, full_name)
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Accept organization invitation
  static async acceptInvitation(invitationId: string) {
    try {
      const { data, error } = await supabase.rpc('accept_organization_invitation', {
        invitation_id: invitationId
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Decline organization invitation
  static async declineInvitation(invitationId: string) {
    try {
      const { error } = await supabase
        .from('organization_users')
        .delete()
        .eq('id', invitationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'pending');

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: this.formatError(error) };
    }
  }

  // Update user role in organization
  static async updateUserRole(organizationUserId: string, role: 'admin' | 'user') {
    try {
      const { error } = await supabase
        .from('organization_users')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationUserId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: this.formatError(error) };
    }
  }

  // Remove user from organization
  static async removeUser(organizationUserId: string) {
    try {
      const { error } = await supabase
        .from('organization_users')
        .delete()
        .eq('id', organizationUserId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: this.formatError(error) };
    }
  }

  // Get organization statistics
  static async getOrganizationStats(organizationId: string): Promise<{ data: OrganizationStats | null; error: any }> {
    try {
      const { data: members, error: membersError } = await supabase
        .from('organization_users')
        .select('status')
        .eq('organization_id', organizationId);

      if (membersError) throw membersError;

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('license_expires_at')
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;

      const totalUsers = members?.length || 0;
      const activeUsers = members?.filter(m => m.status === 'active').length || 0;
      const pendingInvitations = members?.filter(m => m.status === 'pending').length || 0;
      
      const expiresAt = new Date(org.license_expires_at);
      const now = new Date();
      const licenseDaysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      const stats: OrganizationStats = {
        total_users: totalUsers,
        active_users: activeUsers,
        pending_invitations: pendingInvitations,
        license_days_remaining: licenseDaysRemaining
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Get license information
  static async getLicenseInfo(organizationId: string): Promise<{ data: LicenseInfo | null; error: any }> {
    try {
      const { data: org, error } = await supabase
        .from('organizations')
        .select('license_type, license_expires_at, max_users')
        .eq('id', organizationId)
        .single();

      if (error) throw error;

      const expiresAt = new Date(org.license_expires_at);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      const features = this.getLicenseFeatures(org.license_type);

      const licenseInfo: LicenseInfo = {
        type: org.license_type,
        expires_at: org.license_expires_at,
        days_remaining: daysRemaining,
        max_users: org.max_users,
        features,
        is_expired: daysRemaining <= 0,
        is_expiring_soon: daysRemaining <= 7 && daysRemaining > 0
      };

      return { data: licenseInfo, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Get license features based on type
  private static getLicenseFeatures(licenseType: string): string[] {
    const features = {
      trial: [
        'Up to 5 users',
        'Basic dashboard',
        'Email support',
        '30-day trial'
      ],
      basic: [
        'Up to 10 users',
        'Full dashboard',
        'Email support',
        'Basic reporting'
      ],
      premium: [
        'Up to 50 users',
        'Advanced analytics',
        'Priority support',
        'Custom reports',
        'API access'
      ],
      enterprise: [
        'Unlimited users',
        'Advanced analytics',
        'Dedicated support',
        'Custom integrations',
        'White-label options',
        'SLA guarantee'
      ]
    };

    return features[licenseType as keyof typeof features] || [];
  }

  // Check if organization slug is available
  static async isSlugAvailable(slug: string) {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return { available: !data, error: null };
    } catch (error: any) {
      return { available: false, error: this.formatError(error) };
    }
  }

  // Update organization
  static async updateOrganization(organizationId: string, updates: Partial<Organization>) {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: this.formatError(error) };
    }
  }

  // Format error messages
  private static formatError(error: any): { message: string } {
    if (error.message) {
      // Handle specific database errors
      if (error.message.includes('duplicate key value violates unique constraint')) {
        if (error.message.includes('organizations_slug_key')) {
          return { message: 'Organization name is already taken. Please choose a different name.' };
        }
        return { message: 'This value is already in use. Please choose a different one.' };
      }
      if (error.message.includes('User with email') && error.message.includes('not found')) {
        return { message: 'User with this email address was not found. They need to create an account first.' };
      }
      return { message: error.message };
    }
    return { message: 'An unexpected error occurred' };
  }
}