/**
 * Main Application Component
 * 
 * This is the root component that sets up the application structure,
 * error handling, and routing between different pages.
 */

import React, { useEffect, useState, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ErrorProvider } from './utils/errorContext.jsx';
import Toast from './components/Toast.jsx';
import ErrorHandlingExample from './components/ErrorHandlingExample.jsx';
import { validateConfiguration, getConfigSummary } from './utils/config.js';
import { ProfilerWrapper, useRenderPerformance } from './utils/performance.jsx';

const App = () => {
  const [configStatus, setConfigStatus] = useState('loading');
  const [configError, setConfigError] = useState(null);
  
  // Performance monitoring for the main App component
  useRenderPerformance('App', [configStatus, configError]);

  // Memoize app initialization function
  const initializeApp = useCallback(async () => {
    try {
      validateConfiguration();
      const summary = getConfigSummary();
      console.log('Configuration loaded:', summary);
      setConfigStatus('ready');
    } catch (error) {
      setConfigError(error.message);
      setConfigStatus('error');
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Show loading state while validating configuration
  if (configStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Visual AI Content Studio</h2>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  // Show configuration error
  if (configStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Configuration Error
          </h2>
          
          <div className="text-left bg-gray-100 p-3 rounded text-sm mb-4">
            <pre className="whitespace-pre-wrap text-red-600">{configError}</pre>
          </div>

          <div className="space-y-2">
            <p className="text-gray-600 text-sm">
              Please check your environment variables or configuration files.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            
            <a
              href="#env-setup"
              className="block text-blue-600 hover:text-blue-800 text-sm"
            >
              View Setup Instructions
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Main application render
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <ProfilerWrapper id="App">
          <div className="min-h-screen bg-gray-50">
            {/* Toast Container */}
            <Toast />
            
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
              <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Visual AI Content Studio
              </h1>
              <p className="text-lg text-gray-600">
                AI-Powered Visual Content Creation Platform
              </p>
            </header>

            {/* Temporary: Show error handling example */}
            <main>
              <ErrorHandlingExample />
            </main>

            {/* Future: This will contain the main application components */}
            {/* 
            <Routes>
              <Route path="/" element={<StudioPage />} />
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/settings" element={<SettingsPanel />} />
            </Routes>
            */}
            </div>
          </div>
        </ProfilerWrapper>
      </ErrorProvider>
    </ErrorBoundary>
  );
};

export default App;