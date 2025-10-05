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
    // Handle special cases for Cloudflare config
    if (key.startsWith('REACT_APP_CLOUDFLARE_')) {
      try {
        const cloudflareConfig = window.cloudflareconfig ? JSON.parse(window.cloudflareconfig) : null;
        if (cloudflareConfig) {
          const configKey = key.replace('REACT_APP_CLOUDFLARE_', '').toLowerCase();
          // Map environment variable names to Cloudflare config keys
          const keyMap = {
            'account_id': 'accountId',
            'r2_bucket': 'r2Bucket',
            'api_token': 'apiToken'
          };
          value = cloudflareConfig[keyMap[configKey] || configKey];
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
 * Cloudflare Configuration
 */
export const getCloudflareConfig = () => {
  try {
    return {
      accountId: getEnvVar('REACT_APP_CLOUDFLARE_ACCOUNT_ID', null, true),
      r2Bucket: getEnvVar('REACT_APP_CLOUDFLARE_R2_BUCKET', null, true),
      apiToken: getEnvVar('REACT_APP_CLOUDFLARE_API_TOKEN', null, true),
      workerUrl: getEnvVar('REACT_APP_WORKER_URL', null, true)
    };
  } catch (error) {
    console.error('Cloudflare configuration error:', error.message);
    throw new Error('Cloudflare is not properly configured. Please check your environment variables.');
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
    getCloudflareConfig();
  } catch (error) {
    errors.push(`Cloudflare: ${error.message}`);
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
  const cloudflare = getCloudflareConfig();
  const gemini = getGeminiConfig();
  const app = getAppConfig();
  
  return {
    cloudflare: {
      accountId: cloudflare.accountId,
      r2Bucket: cloudflare.r2Bucket,
      hasApiToken: !!cloudflare.apiToken,
      workerUrl: cloudflare.workerUrl
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