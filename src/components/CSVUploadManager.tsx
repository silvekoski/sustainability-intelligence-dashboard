import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, Trash2, AlertCircle, CheckCircle, Loader2, Download, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CSVService } from '../services/csvService';
import { UserCSVFile } from '../types/csv';

interface CSVUploadManagerProps {
  onDataChange: (data: any[] | null) => void;
  currentData: any[] | null;
}

export const CSVUploadManager: React.FC<CSVUploadManagerProps> = ({ onDataChange, currentData }) => {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userFiles, setUserFiles] = useState<UserCSVFile[]>([]);
  const [currentFile, setCurrentFile] = useState<UserCSVFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadUserFiles();
    }
  }, [user?.id]);

  const loadUserFiles = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const result = await CSVService.getUserCSVFiles(user.id);
      if (result.success && result.files) {
        setUserFiles(result.files);
        
        // If there's a file and no current data, load the most recent file
        if (result.files.length > 0 && !currentData) {
          const mostRecent = result.files[0];
          await loadCSVData(mostRecent);
        }
      } else {
        setError(result.error || 'Failed to load files');
      }
    } catch (err) {
      setError('Failed to load user files');
    } finally {
      setLoading(false);
    }
  };

  const loadCSVData = async (file: UserCSVFile) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await CSVService.downloadAndParseCSV(file.filePath);
      if (result.success && result.data) {
        onDataChange(result.data);
        setCurrentFile(file);
        setSuccess(`Loaded data from ${file.fileName}`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to load CSV data');
      }
    } catch (err) {
      setError('Failed to load CSV data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await CSVService.uploadCSV(file, user.id);
      
      if (result.success && result.filePath) {
        // Reload user files
        await loadUserFiles();
        
        // Load the newly uploaded file
        const newFile: UserCSVFile = {
          fileName: result.fileName!,
          filePath: result.filePath,
          uploadedAt: new Date().toISOString(),
          size: file.size
        };
        
        await loadCSVData(newFile);
        setSuccess(`Successfully uploaded ${file.name}`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (file: UserCSVFile) => {
    if (!confirm(`Are you sure you want to delete ${file.fileName}?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await CSVService.deleteCSV(file.filePath);
      
      if (result.success) {
        // If we're deleting the currently loaded file, clear the data
        if (currentFile?.filePath === file.filePath) {
          onDataChange(null);
          setCurrentFile(null);
        }
        
        // Reload user files
        await loadUserFiles();
        setSuccess(`Deleted ${file.fileName}`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Delete failed');
      }
    } catch (err) {
      setError('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    onDataChange(null);
    setCurrentFile(null);
    setSuccess('Data cleared');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">CSV Data Management</h3>
            <p className="text-sm text-gray-600">Upload and manage your power plant data files</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {currentData && (
            <button
              onClick={clearData}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear Data</span>
            </button>
          )}
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploading ? 'Uploading...' : 'Upload CSV'}</span>
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv,application/csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Status Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Current Data Status */}
      {currentData && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {currentFile ? `Data loaded from: ${currentFile.fileName}` : 'Data loaded'}
                </p>
                <p className="text-xs text-blue-700">
                  {currentData.length.toLocaleString()} records available
                </p>
              </div>
            </div>
            {currentFile && (
              <p className="text-xs text-blue-600">
                Uploaded: {new Date(currentFile.uploadedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* File List */}
      {userFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Your CSV Files</h4>
          <div className="space-y-2">
            {userFiles.map((file) => (
              <div
                key={file.filePath}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  currentFile?.filePath === file.filePath
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <File className={`w-4 h-4 ${
                    currentFile?.filePath === file.filePath ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {CSVService.formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentFile?.filePath !== file.filePath && (
                    <button
                      onClick={() => loadCSVData(file)}
                      disabled={loading}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                      title="Load this file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={loading}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                    title="Delete this file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schema Information */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            CSV Schema Requirements
          </summary>
          <div className="mt-3 text-xs text-gray-600 space-y-2">
            <p>Your CSV file must include these columns in any order:</p>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs bg-gray-50 p-3 rounded">
              <div>• date</div>
              <div>• plant_id</div>
              <div>• plant_name</div>
              <div>• fuel_type</div>
              <div>• electricity_output_MWh</div>
              <div>• heat_output_MWh</div>
              <div>• fuel_consumption_MWh</div>
              <div>• CO2_emissions_tonnes</div>
              <div>• CH4_emissions_kg</div>
              <div>• N2O_emissions_kg</div>
              <div>• efficiency_percent</div>
            </div>
            <p className="text-xs">Maximum file size: 10MB</p>
          </div>
        </details>
      </div>
    </div>
  );
};