import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, Save, Loader2, AlertCircle, CheckCircle, Building, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EUPermitsService } from '../services/euPermitsService';
import { EUPermitInput, EUPermit } from '../types/permits';

export const EUPermitsForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingPermit, setExistingPermit] = useState<EUPermit | null>(null);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<EUPermitInput>({
    defaultValues: {
      active_permits: 0,
      company_name: '',
      permit_year: new Date().getFullYear(),
      notes: ''
    }
  });

  const activePermits = watch('active_permits');

  // Load existing permit data
  useEffect(() => {
    const loadExistingPermit = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const { data, error } = await EUPermitsService.getCurrentYearPermit(user.id);
        if (error) {
          setError(error.message);
        } else if (data) {
          setExistingPermit(data);
          reset({
            active_permits: data.active_permits,
            company_name: data.company_name || '',
            permit_year: data.permit_year,
            notes: data.notes || ''
          });
        }
      } catch (err) {
        setError('Failed to load existing permit data');
      } finally {
        setLoading(false);
      }
    };

    loadExistingPermit();
  }, [user?.id, reset]);

  const onSubmit = async (data: EUPermitInput) => {
    if (!user?.id) return;

    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      // Validate input
      const validation = EUPermitsService.validatePermitInput(data);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      let result;
      if (existingPermit) {
        result = await EUPermitsService.updatePermit(existingPermit.id, data);
      } else {
        result = await EUPermitsService.createPermit(user.id, data);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
        setExistingPermit(result.data);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('Failed to save permit data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>EU Emissions Permits</span>
        </h2>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">
              Permit data {existingPermit ? 'updated' : 'saved'} successfully!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Permits Count *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('active_permits', {
                    required: 'Active permits count is required',
                   min: { value: 0, message: 'Must be a non-negative number' },
                   valueAsNumber: true
                  })}
                  type="number"
                  min="0"
                  step="1"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.active_permits ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter number of active permits"
                />
              </div>
              {errors.active_permits && (
                <p className="mt-1 text-sm text-red-600">{errors.active_permits.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Number of EU ETS allowances currently held
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permit Year *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register('permit_year', {
                    required: 'Permit year is required'
                  })}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.permit_year ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {errors.permit_year && (
                <p className="mt-1 text-sm text-red-600">{errors.permit_year.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('company_name', {
                  maxLength: { value: 100, message: 'Company name must be less than 100 characters' }
                })}
                type="text"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.company_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your company name"
              />
            </div>
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                {...register('notes', {
                  maxLength: { value: 500, message: 'Notes must be less than 500 characters' }
                })}
                rows={3}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  errors.notes ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Add any additional notes about your permits..."
              />
            </div>
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Permit Value Display */}
          {activePermits > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Permit Value Estimate</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Capacity:</span>
                  <span className="font-semibold text-blue-900 ml-2">
                    {(activePermits * 100000).toLocaleString()} tCO₂
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Est. Market Value:</span>
                  <span className="font-semibold text-blue-900 ml-2">
                    €{(activePermits * 100000 * 85).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Based on 100,000 tCO₂ per permit and €85/tCO₂ market price
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{existingPermit ? 'Update' : 'Save'} Permit Data</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};