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
import { Routes, Route, NavLink } from 'react-router-dom';
import StudioPage from './components/StudioPage.jsx';
import PreviewPage from './components/PreviewPage.jsx';
import SchedulePage from './components/SchedulePage.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import DemoPage from './components/DemoPage.jsx';
import { validateConfiguration, getConfigSummary } from './utils/config.js';
import { ProfilerWrapper, useRenderPerformance } from './utils/performance.jsx';

const App = () => {
  const [configStatus, setConfigStatus] = useState('loading');
  const [configError, setConfigError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [altText, setAltText] = useState('');
  
  // Performance monitoring for the main App component
  useRenderPerformance('App', [configStatus, configError, generatedImage]);

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

  const navLinkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-200'
    }`;

  // Main application render
  return (
    <ErrorBoundary>
      <ProfilerWrapper id="App">
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Visual AI Content Studio
              </h1>
              <p className="text-lg text-gray-600">
                AI-Powered Visual Content Creation Platform
              </p>
            </header>

            <nav className="mb-8 flex justify-center space-x-4 bg-gray-100 p-2 rounded-lg">
              <NavLink to="/" className={navLinkClasses} end>Studio</NavLink>
              <NavLink to="/preview" className={navLinkClasses}>Preview</NavLink>
              <NavLink to="/schedule" className={navLinkClasses}>Schedule</NavLink>
              <NavLink to="/settings" className={navLinkClasses}>Settings</NavLink>
              <NavLink to="/demo" className={navLinkClasses}>Demo</NavLink>
            </nav>

            <ErrorProvider>
              {/* Toast Container needs to be within ErrorProvider */}
              <Toast />

              <main>
                <Routes>
                  <Route
                    path="/"
                    element={<StudioPage
                      generatedImage={generatedImage}
                      setGeneratedImage={setGeneratedImage}
                      altText={altText}
                      setAltText={setAltText}
                    />}
                  />
                  <Route
                    path="/preview"
                    element={<PreviewPage
                      generatedImage={generatedImage}
                      altText={altText}
                    />}
                  />
                  <Route
                    path="/schedule"
                    element={<SchedulePage
                      generatedImage={generatedImage}
                      altText={altText}
                    />}
                  />
                  <Route path="/settings" element={<SettingsPanel />} />
                  <Route path="/demo" element={<DemoPage />} />
                </Routes>
              </main>
            </ErrorProvider>
          </div>
        </div>
      </ProfilerWrapper>
    </ErrorBoundary>
  );
};

export default App;