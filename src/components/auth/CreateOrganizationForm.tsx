import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Building2, Users, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useOrganization } from '../../contexts/OrganizationContext';
import { OrganizationService } from '../../services/organizationService';

const createOrgSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(50, 'Organization name must be less than 50 characters')
    .required('Organization name is required'),
  slug: yup
    .string()
    .min(2, 'Organization ID must be at least 2 characters')
    .max(30, 'Organization ID must be less than 30 characters')
    .matches(/^[a-z0-9-]+$/, 'Organization ID can only contain lowercase letters, numbers, and hyphens')
    .required('Organization ID is required'),
});

interface CreateOrganizationData {
  name: string;
  slug: string;
}

interface CreateOrganizationFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CreateOrganizationForm: React.FC<CreateOrganizationFormProps> = ({ onBack, onSuccess }) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const { createOrganization } = useOrganization();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CreateOrganizationData>({
    resolver: yupResolver(createOrgSchema),
  });

  const watchedName = watch('name');
  const watchedSlug = watch('slug');

  // Auto-generate slug from name
  React.useEffect(() => {
    if (watchedName && !watchedSlug) {
      const generatedSlug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', generatedSlug);
    }
  }, [watchedName, watchedSlug, setValue]);

  // Check slug availability
  React.useEffect(() => {
    const checkSlug = async () => {
      if (!watchedSlug || watchedSlug.length < 2) {
        setSlugAvailable(null);
        return;
      }

      setCheckingSlug(true);
      const result = await OrganizationService.isSlugAvailable(watchedSlug);
      setSlugAvailable(result.available);
      setCheckingSlug(false);
    };

    const timeoutId = setTimeout(checkSlug, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedSlug]);

  const onSubmit = async (data: CreateOrganizationData) => {
    setAuthError(null);
    
    const { error } = await createOrganization(data);
    
    if (error) {
      setAuthError(error.message);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <Building2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Your Organization
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Set up your organization to start using the Sustainability Intelligence Dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{authError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your organization name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Organization ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">@</span>
                </div>
                <input
                  {...register('slug')}
                  type="text"
                  className={`block w-full pl-8 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.slug ? 'border-red-300' : 
                    slugAvailable === false ? 'border-red-300' :
                    slugAvailable === true ? 'border-green-300' : 'border-gray-300'
                  }`}
                  placeholder="organization-id"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {checkingSlug ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : slugAvailable === true ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : slugAvailable === false ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : null}
                </div>
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
              )}
              {!errors.slug && slugAvailable === false && (
                <p className="mt-1 text-sm text-red-600">This organization ID is already taken</p>
              )}
              {!errors.slug && slugAvailable === true && (
                <p className="mt-1 text-sm text-green-600">This organization ID is available</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will be your unique organization identifier. Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>
          </div>

          {/* License Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">30-Day Free Trial</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Your organization will start with a 30-day free trial including:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Up to 5 users</li>
                  <li>• Full dashboard access</li>
                  <li>• Basic reporting</li>
                  <li>• Email support</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || slugAvailable === false || checkingSlug}
              className="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};