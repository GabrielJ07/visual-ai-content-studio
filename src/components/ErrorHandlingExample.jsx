import React, { useState } from 'react';
import { useError } from '../utils/errorContext.js';
import { errorHandlers, withErrorHandling } from '../utils/errorHandling.js';
import { ZapIcon, UploadIcon, AlertTriangleIcon } from './Icons.jsx';

/**
 * Example component demonstrating proper error handling patterns
 * This shows how to replace console.error with user-friendly feedback
 */
const ErrorHandlingExample = () => {
  const { showError, showSuccess, showWarning, showInfo, handleApiError, handleFirebaseError, handleNetworkError } = useError();
  const [loading, setLoading] = useState(false);

  // Example: Image generation with proper error handling
  const simulateImageGeneration = withErrorHandling(
    async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate different types of failures
      const outcomes = [
        'success',
        'safety_error', 
        'quota_error',
        'network_error',
        'generic_error'
      ];
      
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      switch (outcome) {
        case 'success':
          return 'image-url';
        case 'safety_error':
          throw new Error('Content blocked due to safety policies');
        case 'quota_error':
          throw { status: 429, message: 'Quota exceeded' };
        case 'network_error':
          throw new Error('Network request failed');
        default:
          throw new Error('Unknown API error');
      }
    },
    errorHandlers.api.imageGeneration,
    showError
  );

  // Example: Firebase operation with error handling
  const simulateFirebaseOperation = async () => {
    try {
      setLoading(true);
      
      // Simulate Firebase call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate Firebase errors
      const errors = [
        { code: 'permission-denied' },
        { code: 'unavailable' },
        { code: 'unauthenticated' },
        null // success
      ];
      
      const error = errors[Math.floor(Math.random() * errors.length)];
      
      if (error) {
        throw error;
      }
      
      showSuccess('Data saved successfully!');
    } catch (error) {
      errorHandlers.firebase.firestore(error, showError, 'save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleImageGeneration = async () => {
    try {
      const result = await simulateImageGeneration();
      if (result) {
        showSuccess('Image generated successfully!');
      }
    } catch (error) {
      // Error already handled by withErrorHandling wrapper
    } finally {
      setLoading(false);
    }
  };

  // Example: Network error handling
  const simulateNetworkRequest = async () => {
    try {
      setLoading(true);
      
      // Simulate network request
      if (Math.random() < 0.7) {
        throw { 
          status: [401, 403, 429, 500, 502][Math.floor(Math.random() * 5)],
          message: 'Network request failed'
        };
      }
      
      showSuccess('Network request completed!');
    } catch (error) {
      handleNetworkError(error, 'API request');
    } finally {
      setLoading(false);
    }
  };

  // Example: File upload error handling
  const simulateFileUpload = async () => {
    try {
      setLoading(true);
      
      // Simulate file validation errors
      const errors = [
        new Error('File size exceeds limit'),
        new Error('Invalid file type'),
        new Error('File processing failed'),
        null // success
      ];
      
      const error = errors[Math.floor(Math.random() * errors.length)];
      
      if (error) {
        throw error;
      }
      
      showSuccess('File uploaded successfully!');
    } catch (error) {
      errorHandlers.file.upload(error, showError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangleIcon className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-gray-900">
          Error Handling Examples
        </h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        This component demonstrates how to replace console.error with user-friendly feedback.
        Try the buttons below to see different error handling scenarios.
      </p>
      
      <div className="space-y-4">
        {/* Example buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleImageGeneration}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ZapIcon className="w-4 h-4" />
            {loading ? 'Generating...' : 'Generate Image'}
          </button>

          <button
            onClick={simulateFirebaseOperation}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Firebase Operation
          </button>

          <button
            onClick={simulateNetworkRequest}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Network Request
          </button>

          <button
            onClick={simulateFileUpload}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <UploadIcon className="w-4 h-4" />
            Upload File
          </button>
        </div>

        {/* Toast type examples */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Toast Examples</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => showInfo('This is an info message')}
              className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors"
            >
              Info
            </button>
            <button
              onClick={() => showSuccess('Operation successful!')}
              className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded hover:bg-green-200 transition-colors"
            >
              Success  
            </button>
            <button
              onClick={() => showWarning('This is a warning')}
              className="text-xs bg-yellow-100 text-yellow-700 px-3 py-2 rounded hover:bg-yellow-200 transition-colors"
            >
              Warning
            </button>
            <button
              onClick={() => showError('This is an error', { label: 'Retry', onClick: () => showSuccess('Retry successful!') })}
              className="text-xs bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 transition-colors"
            >
              Error
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingExample;