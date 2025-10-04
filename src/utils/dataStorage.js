/**
 * Data Storage Abstraction Layer
 * 
 * Provides a unified interface for storing user data locally.
 * Automatically chooses between localStorage and IndexedDB based on data size and type.
 * Replaces all Firebase Firestore operations with local storage.
 */

import * as localStorage from './localStorage.js';
import * as indexedDB from './indexedDB.js';
import { logError } from './errorHandling.js';

// Initialize storage systems
let isInitialized = false;

/**
 * Initialize the data storage system
 * @returns {Promise<boolean>} True if initialization successful
 */
export const initializeStorage = async () => {
  if (isInitialized) return true;

  try {
    // Initialize IndexedDB for larger data
    const indexedDBReady = await indexedDB.initialize();
    
    // Check localStorage availability
    const localStorageReady = localStorage.isLocalStorageAvailable();
    
    if (!localStorageReady && !indexedDBReady) {
      throw new Error('No storage mechanisms available');
    }
    
    isInitialized = true;
    console.log('✅ Local storage initialized successfully', {
      localStorage: localStorageReady,
      indexedDB: indexedDBReady
    });
    
    return true;
  } catch (error) {
    logError(error, 'Storage initialization');
    return false;
  }
};

/**
 * Get storage system status and usage information
 * @returns {Promise<object>} Storage system information
 */
export const getStorageStatus = async () => {
  try {
    const localStorageInfo = localStorage.getStorageInfo();
    const indexedDBInfo = await indexedDB.getDatabaseInfo();
    
    return {
      initialized: isInitialized,
      localStorage: localStorageInfo,
      indexedDB: indexedDBInfo,
      mode: 'local-only'
    };
  } catch (error) {
    logError(error, 'Get storage status');
    return { error: error.message };
  }
};

// User Settings Storage (replaces Firebase user settings)

/**
 * Save user brand kit settings
 * @param {object} brandKitData - Brand kit configuration
 * @returns {Promise<boolean>} True if saved successfully
 */
export const saveBrandKit = async (brandKitData) => {
  try {
    return localStorage.brandKit.set(brandKitData);
  } catch (error) {
    logError(error, 'Save brand kit');
    return false;
  }
};

/**
 * Load user brand kit settings
 * @returns {Promise<object>} Brand kit configuration
 */
export const loadBrandKit = async () => {
  try {
    return localStorage.brandKit.get();
  } catch (error) {
    logError(error, 'Load brand kit');
    return localStorage.brandKit.get(); // Returns default values on error
  }
};

/**
 * Save user information
 * @param {object} userInfoData - User information
 * @returns {Promise<boolean>} True if saved successfully
 */
export const saveUserInfo = async (userInfoData) => {
  try {
    return localStorage.userInfo.set(userInfoData);
  } catch (error) {
    logError(error, 'Save user info');
    return false;
  }
};

/**
 * Load user information
 * @returns {Promise<object>} User information
 */
export const loadUserInfo = async () => {
  try {
    return localStorage.userInfo.get();
  } catch (error) {
    logError(error, 'Load user info');
    return localStorage.userInfo.get();
  }
};

/**
 * Save campaign variable
 * @param {string} campaignData - Campaign variable text
 * @returns {Promise<boolean>} True if saved successfully
 */
export const saveCampaignVariable = async (campaignData) => {
  try {
    return localStorage.campaignVariable.set(campaignData);
  } catch (error) {
    logError(error, 'Save campaign variable');
    return false;
  }
};

/**
 * Load campaign variable
 * @returns {Promise<string>} Campaign variable text
 */
export const loadCampaignVariable = async () => {
  try {
    return localStorage.campaignVariable.get();
  } catch (error) {
    logError(error, 'Load campaign variable');
    return '';
  }
};

/**
 * Save app preferences
 * @param {object} preferences - App preference settings
 * @returns {Promise<boolean>} True if saved successfully
 */
export const saveAppPreferences = async (preferences) => {
  try {
    return localStorage.appPreferences.set(preferences);
  } catch (error) {
    logError(error, 'Save app preferences');
    return false;
  }
};

/**
 * Load app preferences
 * @returns {Promise<object>} App preference settings
 */
export const loadAppPreferences = async () => {
  try {
    return localStorage.appPreferences.get();
  } catch (error) {
    logError(error, 'Load app preferences');
    return localStorage.appPreferences.get();
  }
};

// Generated Content Storage (replaces Firebase image storage)

/**
 * Save a generated image with metadata
 * @param {object} imageData - Image data and metadata
 * @returns {Promise<string|null>} Image ID if successful, null otherwise
 */
export const saveGeneratedImage = async (imageData) => {
  try {
    await initializeStorage();
    return await indexedDB.images.save(imageData);
  } catch (error) {
    logError(error, 'Save generated image');
    return null;
  }
};

/**
 * Load a generated image by ID
 * @param {string} imageId - Image ID
 * @returns {Promise<object|null>} Image data or null if not found
 */
export const loadGeneratedImage = async (imageId) => {
  try {
    await initializeStorage();
    return await indexedDB.images.get(imageId);
  } catch (error) {
    logError(error, 'Load generated image');
    return null;
  }
};

/**
 * Get recent generated images
 * @param {number} limit - Maximum number of images to return
 * @returns {Promise<object[]>} Array of recent images
 */
export const getRecentImages = async (limit = 20) => {
  try {
    await initializeStorage();
    return await indexedDB.images.getRecent(limit);
  } catch (error) {
    logError(error, 'Get recent images');
    return [];
  }
};

/**
 * Search generated images by prompt text
 * @param {string} searchText - Text to search for
 * @returns {Promise<object[]>} Matching images
 */
export const searchImages = async (searchText) => {
  try {
    await initializeStorage();
    return await indexedDB.images.search(searchText);
  } catch (error) {
    logError(error, 'Search images');
    return [];
  }
};

/**
 * Delete a generated image
 * @param {string} imageId - Image ID to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteGeneratedImage = async (imageId) => {
  try {
    await initializeStorage();
    return await indexedDB.images.delete(imageId);
  } catch (error) {
    logError(error, 'Delete generated image');
    return false;
  }
};

/**
 * Save layout data for an image
 * @param {object} layoutData - Layout configuration and metadata
 * @returns {Promise<string|null>} Layout ID if successful
 */
export const saveLayout = async (layoutData) => {
  try {
    await initializeStorage();
    return await indexedDB.layouts.save(layoutData);
  } catch (error) {
    logError(error, 'Save layout');
    return null;
  }
};

/**
 * Get layouts for a specific image
 * @param {string} imageId - Image ID
 * @returns {Promise<object[]>} Array of layout configurations
 */
export const getLayoutsForImage = async (imageId) => {
  try {
    await initializeStorage();
    return await indexedDB.layouts.getByImageId(imageId);
  } catch (error) {
    logError(error, 'Get layouts for image');
    return [];
  }
};

// Data Management and Migration

/**
 * Export all user data for backup/migration
 * @returns {Promise<object>} Complete data export
 */
export const exportAllUserData = async () => {
  try {
    await initializeStorage();
    
    const localStorageData = localStorage.exportAllData();
    const recentImages = await getRecentImages(100); // Export up to 100 recent images
    const dbInfo = await indexedDB.getDatabaseInfo();
    
    return {
      ...localStorageData,
      images: recentImages,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        storageMode: 'local-only'
      },
      databaseInfo: dbInfo
    };
  } catch (error) {
    logError(error, 'Export all user data');
    throw error;
  }
};

/**
 * Import user data from backup
 * @param {object} data - Data to import
 * @returns {Promise<boolean>} True if import successful
 */
export const importUserData = async (data) => {
  try {
    await initializeStorage();
    
    // Import localStorage data
    const localImportSuccess = localStorage.importAllData(data);
    
    // Import images if present
    if (data.images && Array.isArray(data.images)) {
      for (const imageData of data.images) {
        await saveGeneratedImage(imageData);
      }
    }
    
    return localImportSuccess;
  } catch (error) {
    logError(error, 'Import user data');
    return false;
  }
};

/**
 * Clear all user data (factory reset)
 * @returns {Promise<boolean>} True if cleared successfully
 */
export const clearAllUserData = async () => {
  try {
    await initializeStorage();
    
    // Clear localStorage data
    const localCleared = localStorage.clearAllStorageData();
    
    // Clear IndexedDB data
    await indexedDB.images.clear();
    await indexedDB.layouts.clear();
    await indexedDB.projects.clear();
    
    console.log('✅ All user data cleared successfully');
    return localCleared;
  } catch (error) {
    logError(error, 'Clear all user data');
    return false;
  }
};

/**
 * Perform maintenance tasks (cleanup old data, optimize storage)
 * @param {object} options - Cleanup options
 * @returns {Promise<object>} Maintenance results
 */
export const performMaintenance = async (options = {}) => {
  try {
    await initializeStorage();
    
    const { daysOld = 30 } = options;
    
    const deletedCount = await indexedDB.cleanupOldData(daysOld);
    const storageStatus = await getStorageStatus();
    
    return {
      success: true,
      deletedItems: deletedCount,
      storageStatus
    };
  } catch (error) {
    logError(error, 'Perform maintenance');
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Legacy Firebase compatibility layer - these functions provide the same interface
 * as the old Firebase functions but use local storage instead
 */
export const legacyCompatibility = {
  /**
   * Simulates Firebase document save operation
   * @param {string} collection - Collection name (ignored in local storage)
   * @param {string} docId - Document ID (ignored in local storage) 
   * @param {object} data - Data to save
   * @returns {Promise<boolean>} Success status
   */
  saveDocument: async (collection, _docId, data) => {
    console.warn('Legacy Firebase saveDocument called - using local storage instead');
    
    // Route to appropriate local storage based on collection
    switch (collection) {
      case 'visualappsettings':
        if (data.brandKit) return saveBrandKit(data.brandKit);
        if (data.userInfo) return saveUserInfo(data.userInfo);
        if (data.campaignVariable) return saveCampaignVariable(data.campaignVariable);
        break;
      case 'recentimages':
        return await saveGeneratedImage(data);
      default:
        logError(new Error(`Unknown collection: ${collection}`), 'Legacy saveDocument');
        return false;
    }
    return false;
  },

  /**
   * Simulates Firebase document load operation
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @returns {Promise<object|null>} Document data
   */
  loadDocument: async (collection, _docId) => {
    console.warn('Legacy Firebase loadDocument called - using local storage instead');
    
    switch (collection) {
      case 'visualappsettings':
        return {
          brandKit: await loadBrandKit(),
          userInfo: await loadUserInfo(),
          campaignVariable: await loadCampaignVariable()
        };
      case 'recentimages':
        return await getRecentImages();
      default:
        return null;
    }
  }
};

// Auto-initialize on module load
initializeStorage().catch(error => {
  logError(error, 'Auto-initialize storage');
});