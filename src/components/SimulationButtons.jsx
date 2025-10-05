import React from 'react';
import { ZapIcon, UploadIcon } from './Icons.jsx';

/**
 * SimulationButtons component renders the main action buttons for error handling demonstrations
 * Separated from the main ErrorHandlingExample to improve maintainability
 * 
 * Performance optimized with React.memo to prevent unnecessary re-renders
 * when parent component updates but props haven't changed.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onImageGeneration - Handler for image generation simulation
 * @param {Function} props.onStorageOperation - Handler for storage operation simulation
 * @param {Function} props.onNetworkRequest - Handler for network request simulation
 * @param {Function} props.onFileUpload - Handler for file upload simulation
 * @param {boolean} props.loading - Loading state for all buttons
 */
const SimulationButtons = React.memo(({
  onImageGeneration,
  onStorageOperation,
  onNetworkRequest,
  onFileUpload,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        onClick={onImageGeneration}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ZapIcon className="w-4 h-4" />
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

      <button
        onClick={onStorageOperation}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Storage Operation
      </button>

      <button
        onClick={onNetworkRequest}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Network Request
      </button>

      <button
        onClick={onFileUpload}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <UploadIcon className="w-4 h-4" />
        Upload File
      </button>
    </div>
  );
});

// Display name for debugging
SimulationButtons.displayName = 'SimulationButtons';

export default SimulationButtons;