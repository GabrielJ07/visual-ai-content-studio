import React from 'react';
import { useError } from '../utils/errorContext.js';
import { AlertTriangleIcon } from './Icons.jsx';
import { 
  useImageGenerationSimulator, 
  useFirebaseSimulator, 
  useNetworkSimulator, 
  useFileUploadSimulator 
} from '../hooks/useSimulators.js';
import SimulationButtons from './SimulationButtons.jsx';
import ToastExamples from './ToastExamples.jsx';

/**
 * Example component demonstrating proper error handling patterns
 * This shows how to replace console.error with user-friendly feedback
 * 
 * Refactored to use custom hooks and smaller components for better maintainability:
 * - Business logic extracted to custom hooks in /hooks/useSimulators.js
 * - UI components separated into SimulationButtons and ToastExamples
 * - Cleaner separation of concerns between data and presentation
 */
const ErrorHandlingExample = () => {
  const { showError, showSuccess, showWarning, showInfo } = useError();
  
  // Use custom hooks for simulation logic
  const imageSimulator = useImageGenerationSimulator();
  const firebaseSimulator = useFirebaseSimulator();
  const networkSimulator = useNetworkSimulator();
  const fileUploadSimulator = useFileUploadSimulator();

  // Combine loading states from all simulators
  const isAnyLoading = imageSimulator.loading || firebaseSimulator.loading || 
                      networkSimulator.loading || fileUploadSimulator.loading;

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
        <SimulationButtons 
          onImageGeneration={imageSimulator.handleImageGeneration}
          onFirebaseOperation={firebaseSimulator.simulateFirebaseOperation}
          onNetworkRequest={networkSimulator.simulateNetworkRequest}
          onFileUpload={fileUploadSimulator.simulateFileUpload}
          loading={isAnyLoading}
        />

        <ToastExamples 
          showInfo={showInfo}
          showSuccess={showSuccess}
          showWarning={showWarning}
          showError={showError}
        />
      </div>
    </div>
  );
};

export default ErrorHandlingExample;