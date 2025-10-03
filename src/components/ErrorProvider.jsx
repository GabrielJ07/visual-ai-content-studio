import React from 'react';
import { ErrorProvider as ErrorContextProvider } from '../utils/errorContext.js';
import { ToastContainer } from './Toast.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { useError } from '../utils/errorContext.js';

// Component that renders the toast container
const ToastRenderer = () => {
  const { toasts, removeToast } = useError();
  return <ToastContainer toasts={toasts} onRemoveToast={removeToast} />;
};

/**
 * Integrated Error Provider Component
 * 
 * This component provides:
 * 1. Error Context for centralized error handling
 * 2. Toast notifications for user feedback
 * 3. Error boundary for catching React errors
 * 
 * Usage:
 * Wrap your entire app with this component:
 * 
 * <ErrorProvider>
 *   <App />
 * </ErrorProvider>
 */
const IntegratedErrorProvider = ({ children }) => {
  return (
    <ErrorBoundary>
      <ErrorContextProvider>
        {children}
        <ToastRenderer />
      </ErrorContextProvider>
    </ErrorBoundary>
  );
};

export default IntegratedErrorProvider;