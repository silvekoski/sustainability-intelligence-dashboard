import React, { useState } from 'react';
import { Building2, Plus, Users, Calendar, Crown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useOrganization } from '../../contexts/OrganizationContext';
import { CreateOrganizationForm } from './CreateOrganizationForm';

interface OrganizationSelectorProps {
  onComplete: () => void;
}

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ onComplete }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { 
    currentOrganization, 
    userOrganizations, 
    pendingInvitations,
    licenseInfo,
    switchOrganization, 
    acceptInvitation, 
    declineInvitation,
    loading 
  } = useOrganization();

  const handleSwitchOrganization = async (organizationId: string) => {
    await switchOrganization(organizationId);
    onComplete();
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    await acceptInvitation(invitationId);
    onComplete();
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    onComplete();
  };

  if (showCreateForm) {
    return (
      <CreateOrganizationForm
        onBack={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  const getLicenseColor = (licenseType: string) => {
    switch (licenseType) {
      case 'trial': return 'text-blue-600 bg-blue-100';
      case 'basic': return 'text-green-600 bg-green-100';
      case 'premium': return 'text-purple-600 bg-purple-100';
      case 'enterprise': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLicenseIcon = (licenseType: string) => {
    switch (licenseType) {
      case 'enterprise': return <Crown className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <Building2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Select Organization
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose an organization to continue or create a new one
          </p>
        </div>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Pending Invitations</span>
            </h3>
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {invitation.organization?.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Invited by {invitation.invited_by_user?.full_name || invitation.invited_by_user?.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Role: {invitation.role} • Invited {new Date(invitation.invited_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineInvitation(invitation.id)}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Organizations */}
        {userOrganizations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Your Organizations</span>
            </h3>
            <div className="grid gap-4">
              {userOrganizations.map((orgUser) => {
                const org = orgUser.organization!;
                const isCurrent = currentOrganization?.id === org.id;
                
                return (
                  <div
                    key={orgUser.id}
                    className={`border-2 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${
                      isCurrent 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => !isCurrent && handleSwitchOrganization(org.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isCurrent ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {getLicenseIcon(org.license_type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{org.name}</h4>
                            {isCurrent && (
                              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">@{org.slug}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getLicenseColor(org.license_type)}`}>
                              {getLicenseIcon(org.license_type)}
                              <span className="capitalize">{org.license_type}</span>
                            </span>
                            <span className="text-xs text-gray-500 flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>Role: {orgUser.role}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {isCurrent && licenseInfo && (
                        <div className="text-right">
                          {licenseInfo.is_expired ? (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-medium">Expired</span>
                            </div>
                          ) : licenseInfo.is_expiring_soon ? (
                            <div className="flex items-center space-x-1 text-orange-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-medium">{licenseInfo.days_remaining} days left</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">{licenseInfo.days_remaining} days left</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create New Organization */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <Plus className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create New Organization</h3>
              <p className="text-sm text-gray-600">
                Start a new organization with a 30-day free trial
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </button>
          </div>
        </div>

        {/* Continue Button */}
        {currentOrganization && (
          <div className="text-center">
            <button
              onClick={onComplete}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};