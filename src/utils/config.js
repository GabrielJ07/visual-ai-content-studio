/**
 * Configuration Management Utility
 * 
 * Centralizes environment variable access and configuration management.
 * Provides fallbacks and validation for required configuration values.
 */

/**
 * Get environment variable with optional fallback
 * @param {string} key - Environment variable key
 * @param {string} fallback - Optional fallback value
 * @param {boolean} required - Whether this variable is required
 * @returns {string} The configuration value
 */
const getEnvVar = (key, fallback = null, required = false) => {
  // Try environment variable first
  let value = process.env[key];
  
  // If not found and we're in browser, try window globals (for runtime injection)
  if (!value && typeof window !== 'undefined') {
    // Handle special cases for Firebase config
    if (key.startsWith('REACT_APP_FIREBASE_')) {
      try {
        const firebaseConfig = window.firebaseconfig ? JSON.parse(window.firebaseconfig) : null;
        if (firebaseConfig) {
          const configKey = key.replace('REACT_APP_FIREBASE_', '').toLowerCase();
          // Map environment variable names to Firebase config keys
          const keyMap = {
            'api_key': 'apiKey',
            'auth_domain': 'authDomain',
            'project_id': 'projectId',
            'storage_bucket': 'storageBucket',
            'messaging_sender_id': 'messagingSenderId',
            'app_id': 'appId'
          };
          value = firebaseConfig[keyMap[configKey] || configKey];
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // Handle app ID
    if (key === 'REACT_APP_APP_ID' && window.appid) {
      value = window.appid;
    }
  }
  
  // Use fallback if still not found
  if (!value) {
    value = fallback;
  }
  
  // Check if required value is missing
  if (required && !value) {
    throw new Error(`Required configuration variable ${key} is not set. Please check your .env file or runtime configuration.`);
  }
  
  return value;
};

/**
 * Firebase Configuration
 */
export const getFirebaseConfig = () => {
  try {
    return {
      apiKey: getEnvVar('REACT_APP_FIREBASE_API_KEY', null, true),
      authDomain: getEnvVar('REACT_APP_FIREBASE_AUTH_DOMAIN', null, true),
      projectId: getEnvVar('REACT_APP_FIREBASE_PROJECT_ID', null, true),
      storageBucket: getEnvVar('REACT_APP_FIREBASE_STORAGE_BUCKET', null, true),
      messagingSenderId: getEnvVar('REACT_APP_FIREBASE_MESSAGING_SENDER_ID', null, true),
      appId: getEnvVar('REACT_APP_FIREBASE_APP_ID', null, true)
    };
  } catch (error) {
    console.error('Firebase configuration error:', error.message);
    throw new Error('Firebase is not properly configured. Please check your environment variables.');
  }
};

/**
 * Gemini AI Configuration
 */
export const getGeminiConfig = () => {
  const apiKey = getEnvVar('REACT_APP_GEMINI_API_KEY', null, true);
  
  return {
    apiKey,
    textModel: 'gemini-2.5-flash-preview-05-20',
    imageModel: 'gemini-2.5-flash-image-preview',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
  };
};

/**
 * Application Configuration
 */
export const getAppConfig = () => {
  return {
    appId: getEnvVar('REACT_APP_APP_ID', 'visual-ai-studio', false),
    initialAuthToken: getEnvVar('REACT_APP_INITIAL_AUTH_TOKEN', null, false),
    environment: getEnvVar('NODE_ENV', 'development', false)
  };
};

/**
 * Error Reporting Configuration
 */
export const getErrorReportingConfig = () => {
  return {
    sentryDsn: getEnvVar('REACT_APP_SENTRY_DSN', null, false),
    logRocketId: getEnvVar('REACT_APP_LOGROCKET_ID', null, false)
  };
};

/**
 * Validate all required configuration
 * Call this at app startup to fail fast if configuration is missing
 */
export const validateConfiguration = () => {
  const errors = [];
  
  try {
    getFirebaseConfig();
  } catch (error) {
    errors.push(`Firebase: ${error.message}`);
  }
  
  try {
    getGeminiConfig();
  } catch (error) {
    errors.push(`Gemini AI: ${error.message}`);
  }
  
  if (errors.length > 0) {
    const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  console.log('✅ All configuration validated successfully');
};

/**
 * Get configuration summary (for debugging, excludes sensitive values)
 */
export const getConfigSummary = () => {
  const firebase = getFirebaseConfig();
  const gemini = getGeminiConfig();
  const app = getAppConfig();
  
  return {
    firebase: {
      projectId: firebase.projectId,
      authDomain: firebase.authDomain,
      hasApiKey: !!firebase.apiKey
    },
    gemini: {
      hasApiKey: !!gemini.apiKey,
      textModel: gemini.textModel,
      imageModel: gemini.imageModel
    },
    app: {
      appId: app.appId,
      environment: app.environment,
      hasInitialAuthToken: !!app.initialAuthToken
    }
  };
};