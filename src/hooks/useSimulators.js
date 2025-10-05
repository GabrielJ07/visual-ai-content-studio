import { useState } from 'react';
import { useError } from '../utils/errorContext.jsx';
import { errorHandlers, withErrorHandling } from '../utils/errorHandling.js';

/**
 * Custom hook for image generation simulation with proper error handling
 * Demonstrates API error handling patterns
 */
export const useImageGenerationSimulator = () => {
  const { showError, showSuccess } = useError();
  const [loading, setLoading] = useState(false);

  const simulateImageGeneration = withErrorHandling(
    async () => {
      setLoading(true);
      
      // Simulate API call delay
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

  return {
    loading,
    handleImageGeneration
  };
};

/**
 * Custom hook for storage operation simulation with proper error handling
 * Demonstrates Cloudflare R2 storage error patterns
 */
export const useStorageSimulator = () => {
  const { showError, showSuccess } = useError();
  const [loading, setLoading] = useState(false);

  const simulateStorageOperation = async () => {
    try {
      setLoading(true);
      
      // Simulate storage API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate storage errors
      const errors = [
        { status: 401, message: 'Unauthorized' },
        { status: 403, message: 'Forbidden' },
        { status: 413, message: 'File too large' },
        { status: 503, message: 'Service unavailable' },
        null // success
      ];
      
      const error = errors[Math.floor(Math.random() * errors.length)];
      
      if (error) {
        throw error;
      }
      
      showSuccess('Data saved to storage successfully!');
    } catch (error) {
      errorHandlers.storage.upload(error, showError, 'save data');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    simulateStorageOperation
  };
};

/**
 * Custom hook for network request simulation with proper error handling
 * Demonstrates network and API error patterns
 */
export const useNetworkSimulator = () => {
  const { handleNetworkError, showSuccess } = useError();
  const [loading, setLoading] = useState(false);

  const simulateNetworkRequest = async () => {
    try {
      setLoading(true);
      
      // Simulate network request delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Simulate network request failure (70% chance)
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

  return {
    loading,
    simulateNetworkRequest
  };
};

/**
 * Custom hook for file upload simulation with proper error handling
 * Demonstrates file handling error patterns
 */
export const useFileUploadSimulator = () => {
  const { showError, showSuccess } = useError();
  const [loading, setLoading] = useState(false);

  const simulateFileUpload = async () => {
    try {
      setLoading(true);
      
      // Simulate file processing delay
      await new Promise(resolve => setTimeout(resolve, 900));
      
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

  return {
    loading,
    simulateFileUpload
  };
};