import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { User, Mail, Calendar, Loader2, AlertCircle, CheckCircle, Trash2, Lock, X, Shield, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updatePasswordSchema } from '../../utils/validation';
import { UpdateProfileData, UpdatePasswordCredentials } from '../../types/auth';
import { AuthService } from '../../services/authService';
import { EUPermitsForm } from '../EUPermitsForm';
import { CSVUploadManager } from '../CSVUploadManager';
import { PowerPlantData } from '../../types';

export const ProfileSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'permits' | 'datasource' | 'password' | 'danger'>('profile');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [csvData, setCsvData] = useState<PowerPlantData[] | null>(null);

  const { user, updatePassword, deleteAccount, logout, loading } = useAuth();
  const navigate = useNavigate();

  const profileForm = useForm<UpdateProfileData>({
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      avatar_url: user?.user_metadata?.avatar_url || '',
    },
  });

  const passwordForm = useForm<UpdatePasswordCredentials>({
    resolver: yupResolver(updatePasswordSchema),
  });

  const onProfileSubmit = async (data: UpdateProfileData) => {
    setProfileError(null);
    const result = await AuthService.updateProfile(data);
    if (result.error) {
      setProfileError(result.error.message);
    } else {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
    setProfileSuccess(false);
    /* 
        const { error } = await updateProfile(data);
    
        if (error) {
          setProfileError(error.message);
        } else {
          setProfileSuccess(true);
          setTimeout(() => setProfileSuccess(false), 3000);
        } */
  };

  const onPasswordSubmit = async (data: UpdatePasswordCredentials) => {
    setPasswordError(null);
    setPasswordSuccess(false);

    const { error } = await updatePassword(
      data.currentPassword,
      data.newPassword,
      data.confirmPassword
    );

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount();

    if (error) {
      setProfileError(error.message);
    } else {
      await logout();
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'permits', label: 'EU Permits', icon: Shield },
    { id: 'datasource', label: 'Data Source', icon: Database },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account preferences and security settings</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close settings"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>

                  {profileSuccess && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-sm text-green-700">Profile updated successfully!</p>
                    </div>
                  )}

                  {profileError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{profileError}</p>
                    </div>
                  )}

                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        {...profileForm.register('full_name')}
                        type="text"
                        className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${profileForm.formState.errors.full_name ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter your full name"
                      />
                      {profileForm.formState.errors.full_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileForm.formState.errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Avatar URL (Optional)
                      </label>
                      <input
                        {...profileForm.register('avatar_url')}
                        type="url"
                        className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${profileForm.formState.errors.avatar_url ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      {profileForm.formState.errors.avatar_url && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileForm.formState.errors.avatar_url.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                          disabled
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={profileForm.formState.isSubmitting || loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {profileForm.formState.isSubmitting || loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'permits' && (
              <div className="space-y-6">
                <EUPermitsForm />
              </div>
            )}

            {activeTab === 'datasource' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Source Management</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Upload and manage your power plant data files. These files will be used across all dashboard analytics and compliance reports.
                  </p>
                  <CSVUploadManager 
                    onDataChange={setCsvData} 
                    currentData={csvData} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

                  {passwordSuccess && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-sm text-green-700">Password updated successfully!</p>
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{passwordError}</p>
                    </div>
                  )}

                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        {...passwordForm.register('currentPassword')}
                        type="password"
                        className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${passwordForm.formState.errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter your current password"
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        {...passwordForm.register('newPassword')}
                        type="password"
                        className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${passwordForm.formState.errors.newPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter your new password"
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        {...passwordForm.register('confirmPassword')}
                        type="password"
                        className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${passwordForm.formState.errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Confirm your new password"
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={passwordForm.formState.isSubmitting || loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {passwordForm.formState.isSubmitting || loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-red-900 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Delete Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-red-900">
                          Are you absolutely sure? This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                                Deleting...
                              </>
                            ) : (
                              'Yes, delete my account'
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};