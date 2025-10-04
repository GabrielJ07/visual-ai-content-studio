/**
 * Local Storage Utilities
 * 
 * Provides a safe, typed interface for browser localStorage operations.
 * Handles JSON serialization, error handling, and fallback behaviors.
 * Used for storing user settings, brand kit, and other small data.
 */

import { logError } from './errorHandling.js';

// Storage keys for different data types
export const STORAGE_KEYS = {
  BRAND_KIT: 'visualai_brand_kit',
  USER_INFO: 'visualai_user_info', 
  CAMPAIGN_VARIABLE: 'visualai_campaign_variable',
  APP_PREFERENCES: 'visualai_app_preferences',
  RECENT_PROMPTS: 'visualai_recent_prompts'
};

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is supported and available
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    logError(error, 'localStorage availability check');
    return false;
  }
};

/**
 * Safely get an item from localStorage with JSON parsing
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {any} The parsed value or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    if (!isLocalStorageAvailable()) {
      return defaultValue;
    }

    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }

    return JSON.parse(item);
  } catch (error) {
    logError(error, `localStorage getItem: ${key}`);
    return defaultValue;
  }
};

/**
 * Safely set an item in localStorage with JSON stringification
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store
 * @returns {boolean} True if successful, false otherwise
 */
export const setStorageItem = (key, value) => {
  try {
    if (!isLocalStorageAvailable()) {
      return false;
    }

    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    logError(error, `localStorage setItem: ${key}`, { valueType: typeof value });
    return false;
  }
};

/**
 * Remove an item from localStorage
 * @param {string} key - The localStorage key to remove
 * @returns {boolean} True if successful, false otherwise
 */
export const removeStorageItem = (key) => {
  try {
    if (!isLocalStorageAvailable()) {
      return false;
    }

    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logError(error, `localStorage removeItem: ${key}`);
    return false;
  }
};

/**
 * Clear all visual AI content studio data from localStorage
 * @returns {boolean} True if successful, false otherwise
 */
export const clearAllStorageData = () => {
  try {
    if (!isLocalStorageAvailable()) {
      return false;
    }

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    logError(error, 'localStorage clearAll');
    return false;
  }
};

/**
 * Get storage usage information
 * @returns {object} Storage usage stats
 */
export const getStorageInfo = () => {
  try {
    if (!isLocalStorageAvailable()) {
      return { available: false, usage: 0, keys: [] };
    }

    const keys = Object.values(STORAGE_KEYS).filter(key => localStorage.getItem(key) !== null);
    let totalSize = 0;

    keys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    });

    return {
      available: true,
      usage: totalSize,
      keys: keys.length,
      usageKB: Math.round(totalSize / 1024 * 100) / 100
    };
  } catch (error) {
    logError(error, 'localStorage getStorageInfo');
    return { available: false, usage: 0, keys: [] };
  }
};

// Specific data handlers for different content types

/**
 * Brand Kit storage operations
 */
export const brandKit = {
  get: () => getStorageItem(STORAGE_KEYS.BRAND_KIT, {
    colors: ['#000000', '#ffffff', '#cccccc'],
    typography: '',
    styleKeywords: []
  }),
  
  set: (brandKitData) => setStorageItem(STORAGE_KEYS.BRAND_KIT, brandKitData),
  
  update: (updates) => {
    const current = brandKit.get();
    return brandKit.set({ ...current, ...updates });
  },
  
  clear: () => removeStorageItem(STORAGE_KEYS.BRAND_KIT)
};

/**
 * User Info storage operations
 */
export const userInfo = {
  get: () => getStorageItem(STORAGE_KEYS.USER_INFO, {
    companyName: '',
    primaryPlatform: '',
    socialHandle: '',
    missionBio: ''
  }),
  
  set: (userInfoData) => setStorageItem(STORAGE_KEYS.USER_INFO, userInfoData),
  
  update: (updates) => {
    const current = userInfo.get();
    return userInfo.set({ ...current, ...updates });
  },
  
  clear: () => removeStorageItem(STORAGE_KEYS.USER_INFO)
};

/**
 * Campaign Variable storage operations
 */
export const campaignVariable = {
  get: () => getStorageItem(STORAGE_KEYS.CAMPAIGN_VARIABLE, ''),
  
  set: (campaignData) => setStorageItem(STORAGE_KEYS.CAMPAIGN_VARIABLE, campaignData),
  
  clear: () => removeStorageItem(STORAGE_KEYS.CAMPAIGN_VARIABLE)
};

/**
 * App Preferences storage operations
 */
export const appPreferences = {
  get: () => getStorageItem(STORAGE_KEYS.APP_PREFERENCES, {
    theme: 'light',
    autoSave: true,
    notifications: true,
    defaultPlatforms: ['instagram', 'tiktok']
  }),
  
  set: (preferences) => setStorageItem(STORAGE_KEYS.APP_PREFERENCES, preferences),
  
  update: (updates) => {
    const current = appPreferences.get();
    return appPreferences.set({ ...current, ...updates });
  },
  
  clear: () => removeStorageItem(STORAGE_KEYS.APP_PREFERENCES)
};

/**
 * Recent Prompts storage operations (limited history)
 */
export const recentPrompts = {
  get: () => getStorageItem(STORAGE_KEYS.RECENT_PROMPTS, []),
  
  add: (prompt) => {
    const prompts = recentPrompts.get();
    const newPrompts = [prompt, ...prompts.slice(0, 9)]; // Keep last 10
    return setStorageItem(STORAGE_KEYS.RECENT_PROMPTS, newPrompts);
  },
  
  clear: () => removeStorageItem(STORAGE_KEYS.RECENT_PROMPTS)
};

/**
 * Export all user data for backup/migration
 * @returns {object} All user data in a single object
 */
export const exportAllData = () => {
  return {
    brandKit: brandKit.get(),
    userInfo: userInfo.get(),
    campaignVariable: campaignVariable.get(),
    appPreferences: appPreferences.get(),
    recentPrompts: recentPrompts.get(),
    exportedAt: new Date().toISOString()
  };
};

/**
 * Import user data from backup
 * @param {object} data - The data object to import
 * @returns {boolean} True if successful, false otherwise
 */
export const importAllData = (data) => {
  try {
    if (data.brandKit) brandKit.set(data.brandKit);
    if (data.userInfo) userInfo.set(data.userInfo);
    if (data.campaignVariable) campaignVariable.set(data.campaignVariable);
    if (data.appPreferences) appPreferences.set(data.appPreferences);
    if (data.recentPrompts) setStorageItem(STORAGE_KEYS.RECENT_PROMPTS, data.recentPrompts);
    
    return true;
  } catch (error) {
    logError(error, 'localStorage importAllData');
    return false;
  }
};