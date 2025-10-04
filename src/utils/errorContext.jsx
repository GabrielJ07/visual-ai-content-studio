import React, { createContext, useContext, useState, useCallback } from 'react';

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addToast = useCallback((toast) => {
    const id = generateId();
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Core error handling functions
  const showError = useCallback((message, action = null) => {
    return addToast({
      type: 'error',
      message,
      action,
      duration: 0 // Don't auto-dismiss errors
    });
  }, [addToast]);

  const showWarning = useCallback((message, action = null, duration = 5000) => {
    return addToast({
      type: 'warning',
      message,
      action,
      duration
    });
  }, [addToast]);

  const showSuccess = useCallback((message, duration = 3000) => {
    return addToast({
      type: 'success',
      message,
      duration
    });
  }, [addToast]);

  const showInfo = useCallback((message, action = null, duration = 5000) => {
    return addToast({
      type: 'info',
      message,
      action,
      duration
    });
  }, [addToast]);

  // Network error handling with actionable messages
  const handleNetworkError = useCallback((error, context = '') => {
    // Log to error reporting service instead of console in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service (e.g., Sentry, LogRocket)
      // errorReportingService.captureException(error, { context: `Network error${context ? ` in ${context}` : ''}` });
    } else {
      console.error(`Network error${context ? ` in ${context}` : ''}:`, error);
    }
    
    let message = 'Something went wrong. Please try again.';
    let action = null;

    if (!navigator.onLine) {
      message = 'No internet connection. Please check your network and try again.';
      action = {
        label: 'Retry',
        onClick: () => window.location.reload()
      };
    } else if (error.status === 429) {
      message = 'Too many requests. Please wait a moment before trying again.';
    } else if (error.status === 401 || error.status === 403) {
      message = 'Authentication failed. Please refresh the page and sign in again.';
      action = {
        label: 'Refresh',
        onClick: () => window.location.reload()
      };
    } else if (error.status >= 500) {
      message = 'Server error. Please try again in a few minutes.';
      action = {
        label: 'Retry',
        onClick: () => window.location.reload()
      };
    } else if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      message = 'Connection failed. Please check your internet and try again.';
      action = {
        label: 'Retry',
        onClick: () => window.location.reload()
      };
    }

    return showError(message, action);
  }, [showError]);

  // API error handling with specific context
  const handleApiError = useCallback((error, operation = '') => {
    // Log to error reporting service instead of console in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service (e.g., Sentry, LogRocket)
      // errorReportingService.captureException(error, { context: `API error${operation ? ` during ${operation}` : ''}` });
    } else {
      console.error(`API error${operation ? ` during ${operation}` : ''}:`, error);
    }
    
    let message = `Failed to ${operation || 'complete operation'}. Please try again.`;
    let action = null;

    if (error.message?.includes('API key')) {
      message = 'API configuration error. Please contact support.';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      message = 'Service limit reached. Please try again later.';
    } else if (error.message?.includes('invalid') || error.status === 400) {
      message = `Invalid request for ${operation || 'operation'}. Please check your input and try again.`;
    }

    return showError(message, action);
  }, [showError]);

  // Firebase error handling
  const handleFirebaseError = useCallback((error, operation = '') => {
    // Log to error reporting service instead of console in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service (e.g., Sentry, LogRocket)
      // errorReportingService.captureException(error, { context: `Firebase error${operation ? ` during ${operation}` : ''}` });
    } else {
      console.error(`Firebase error${operation ? ` during ${operation}` : ''}:`, error);
    }
    
    let message = `Failed to ${operation || 'complete operation'}. Please try again.`;
    let action = null;

    if (error.code === 'permission-denied') {
      message = 'Permission denied. Please sign in again.';
      action = {
        label: 'Refresh',
        onClick: () => window.location.reload()
      };
    } else if (error.code === 'unavailable') {
      message = 'Service temporarily unavailable. Please try again in a moment.';
    } else if (error.code === 'unauthenticated') {
      message = 'Authentication required. Please sign in again.';
      action = {
        label: 'Refresh',
        onClick: () => window.location.reload()
      };
    }

    return showError(message, action);
  }, [showError]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showError,
    showWarning,
    showSuccess,
    showInfo,
    handleNetworkError,
    handleApiError,
    handleFirebaseError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};