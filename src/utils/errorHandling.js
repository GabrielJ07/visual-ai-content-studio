/**
 * Error handling utilities to replace console.error with user-friendly feedback
 * Use these functions instead of console.error throughout the application
 */

// Generic error logger that can be configured for different environments
export const logError = (error, context = '', additionalInfo = {}) => {
  const errorDetails = {
    message: error.message || error.toString(),
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator?.userAgent,
    url: window?.location?.href,
    ...additionalInfo
  };

  if (process.env.NODE_ENV === 'production') {
    // In production, send to error reporting service
    // Replace with your error reporting service (e.g., Sentry, LogRocket, etc.)
    // errorReportingService.captureException(error, { extra: errorDetails });
    
    // For now, store in localStorage for debugging (remove in final implementation)
    try {
      const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
      errorLog.push(errorDetails);
      // Keep only last 50 errors
      if (errorLog.length > 50) errorLog.splice(0, errorLog.length - 50);
      localStorage.setItem('errorLog', JSON.stringify(errorLog));
    } catch (e) {
      // Ignore localStorage errors
    }
  } else {
    // Only log to console in development
    console.error(`Error in ${context}:`, error, errorDetails);
  }
};

// Specific error handling patterns for common scenarios
export const errorHandlers = {
  // API/Network errors
  api: {
    // Image generation failures
    imageGeneration: (error, showError) => {
      logError(error, 'Image Generation');
      
      if (error.message?.includes('safety')) {
        return showError(
          'Image generation blocked due to content policy. Please try a different prompt.',
          {
            label: 'Learn More',
            onClick: () => window.open('https://policies.google.com/terms', '_blank')
          }
        );
      }
      
      if (error.message?.includes('quota') || error.status === 429) {
        return showError(
          'Image generation limit reached. Please try again in a few minutes.',
          {
            label: 'Try Text Only',
            onClick: () => document.getElementById('text-input')?.focus()
          }
        );
      }
      
      return showError('Failed to generate image. Please try again with a different prompt.');
    },

    // Text generation failures  
    textGeneration: (error, showError) => {
      logError(error, 'Text Generation');
      
      if (error.message?.includes('safety')) {
        return showError('Content generation blocked. Please try a different prompt.');
      }
      
      return showError('Failed to generate text. Please check your input and try again.');
    },

    // Layout generation failures
    layoutGeneration: (error, showError) => {
      logError(error, 'Layout Generation');
      return showError(
        'Failed to generate layout. Using default layout instead.',
        {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      );
    }
  },

  // Firebase errors
  firebase: {
    // Authentication errors
    auth: (error, showError) => {
      logError(error, 'Firebase Auth');
      
      if (error.code === 'auth/network-request-failed') {
        return showError(
          'Connection failed. Please check your internet connection.',
          {
            label: 'Retry',
            onClick: () => window.location.reload()
          }
        );
      }
      
      return showError(
        'Authentication error. Please refresh the page and try again.',
        {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
      );
    },

    // Firestore errors
    firestore: (error, showError, operation = 'operation') => {
      logError(error, 'Firestore', { operation });
      
      if (error.code === 'permission-denied') {
        return showError(
          `Permission denied for ${operation}. Please sign in again.`,
          {
            label: 'Sign In',
            onClick: () => window.location.reload()
          }
        );
      }
      
      if (error.code === 'unavailable') {
        return showError(
          'Service temporarily unavailable. Please try again in a moment.',
          {
            label: 'Retry',
            onClick: () => window.location.reload()
          }
        );
      }
      
      return showError(`Failed to ${operation}. Please try again.`);
    }
  },

  // File handling errors
  file: {
    upload: (error, showError) => {
      logError(error, 'File Upload');
      
      if (error.message?.includes('size')) {
        return showError('File is too large. Please choose a smaller image (max 10MB).');
      }
      
      if (error.message?.includes('type')) {
        return showError('Invalid file type. Please upload a valid image file (PNG, JPG, WEBP).');
      }
      
      return showError('Failed to upload file. Please try again.');
    },

    processing: (error, showError) => {
      logError(error, 'File Processing');
      return showError('Failed to process file. Please try uploading again.');
    }
  }
};

// Wrapper for async operations with error handling
export const withErrorHandling = (asyncOperation, errorHandler, showError) => {
  return async (...args) => {
    try {
      return await asyncOperation(...args);
    } catch (error) {
      if (typeof errorHandler === 'function') {
        errorHandler(error, showError);
      } else {
        logError(error, 'Async Operation');
        showError('An unexpected error occurred. Please try again.');
      }
      throw error; // Re-throw to allow caller to handle if needed
    }
  };
};

// Development helper to view error log
export const getErrorLog = () => {
  try {
    return JSON.parse(localStorage.getItem('errorLog') || '[]');
  } catch {
    return [];
  }
};

export const clearErrorLog = () => {
  try {
    localStorage.removeItem('errorLog');
  } catch {
    // Ignore
  }
};