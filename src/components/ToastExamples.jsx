import React from 'react';

/**
 * ToastExamples component demonstrates different toast notification types
 * Separated from the main ErrorHandlingExample for better modularity
 * 
 * @param {Object} props - Component props
 * @param {Function} props.showInfo - Handler to show info toast
 * @param {Function} props.showSuccess - Handler to show success toast
 * @param {Function} props.showWarning - Handler to show warning toast
 * @param {Function} props.showError - Handler to show error toast
 */
const ToastExamples = ({ showInfo, showSuccess, showWarning, showError }) => {
  return (
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
          onClick={() => showError('This is an error', { 
            label: 'Retry', 
            onClick: () => showSuccess('Retry successful!') 
          })}
          className="text-xs bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 transition-colors"
        >
          Error
        </button>
      </div>
    </div>
  );
};

export default ToastExamples;