import React, { useEffect, useMemo, useCallback } from 'react';
import { AlertTriangleIcon, AlertCircleIcon, InfoIcon, CheckCircleIcon, XIcon } from './Icons.jsx';

const Toast = React.memo(({ id, type = 'info', message, action, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // Memoize icon and styles to prevent recalculation on every render
  const icon = useMemo(() => {
    switch (type) {
      case 'error':
        return <AlertCircleIcon className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangleIcon className="w-5 h-5" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <InfoIcon className="w-5 h-5" />;
    }
  }, [type]);

  const styles = useMemo(() => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  }, [type]);

  // Memoize close handler to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    onClose(id);
  }, [onClose, id]);

  const handleActionClick = useCallback(() => {
    action?.onClick();
  }, [action]);

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-lg shadow-md ${styles} animate-in slide-in-from-right duration-300`}>
      <div className="flex-shrink-0 mt-0.5">
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
        {action && (
          <div className="mt-2">
            <button
              onClick={handleActionClick}
              className="text-sm underline hover:no-underline font-medium"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
});

// Display name for debugging
Toast.displayName = 'Toast';

export const ToastContainer = React.memo(({ toasts, onRemoveToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
});

// Display name for debugging
ToastContainer.displayName = 'ToastContainer';

export default Toast;