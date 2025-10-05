/**
 * IndexedDB Utilities
 * 
 * Provides a robust interface for browser IndexedDB operations.
 * Used for storing larger data like generated images, metadata, and blob data.
 * Handles database versioning, migrations, and error recovery.
 */

import { logError } from './errorHandling.js';

// Database configuration
const DB_NAME = 'VisualAIContentStudio';
const DB_VERSION = 1;

// Object store names
export const STORES = {
  IMAGES: 'images',
  LAYOUTS: 'layouts',
  PROJECTS: 'projects'
};

// Global database instance
let dbInstance = null;

/**
 * Check if IndexedDB is available
 * @returns {boolean} True if IndexedDB is supported
 */
export const isIndexedDBAvailable = () => {
  return 'indexedDB' in window && window.indexedDB !== null;
};

/**
 * Initialize the IndexedDB database
 * @returns {Promise<IDBDatabase>} The database instance
 */
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB is not available in this browser'));
      return;
    }

    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      const error = request.error || new Error('Failed to open IndexedDB');
      logError(error, 'IndexedDB open');
      reject(error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      
      // Handle unexpected close
      dbInstance.onclose = () => {
        dbInstance = null;
        logError(new Error('IndexedDB connection closed unexpectedly'), 'IndexedDB close');
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create Images object store
      if (!db.objectStoreNames.contains(STORES.IMAGES)) {
        const imageStore = db.createObjectStore(STORES.IMAGES, { 
          keyPath: 'id',
          autoIncrement: false
        });
        imageStore.createIndex('createdAt', 'createdAt', { unique: false });
        imageStore.createIndex('prompt', 'prompt', { unique: false });
        imageStore.createIndex('platform', 'platform', { unique: false });
      }

      // Create Layouts object store
      if (!db.objectStoreNames.contains(STORES.LAYOUTS)) {
        const layoutStore = db.createObjectStore(STORES.LAYOUTS, { 
          keyPath: 'id',
          autoIncrement: false
        });
        layoutStore.createIndex('imageId', 'imageId', { unique: false });
        layoutStore.createIndex('platform', 'platform', { unique: false });
      }

      // Create Projects object store
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        const projectStore = db.createObjectStore(STORES.PROJECTS, { 
          keyPath: 'id',
          autoIncrement: false
        });
        projectStore.createIndex('name', 'name', { unique: false });
        projectStore.createIndex('createdAt', 'createdAt', { unique: false });
        projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
};

/**
 * Get a transaction for the specified stores
 * @param {string|string[]} storeNames - Store name(s) to include in transaction
 * @param {string} mode - Transaction mode ('readonly' or 'readwrite')
 * @returns {Promise<IDBTransaction>} The transaction object
 */
const getTransaction = async (storeNames, mode = 'readonly') => {
  const db = await initDatabase();
  const stores = Array.isArray(storeNames) ? storeNames : [storeNames];
  return db.transaction(stores, mode);
};

/**
 * Generic method to add/update an item in an object store
 * @param {string} storeName - Object store name
 * @param {object} item - Item to store (must have 'id' property)
 * @returns {Promise<string>} The item ID
 */
export const setItem = async (storeName, item) => {
  try {
    const transaction = await getTransaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Ensure item has required fields
    if (!item.id) {
      item.id = generateId();
    }
    
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }
    
    item.updatedAt = new Date().toISOString();

    const request = store.put(item);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(item.id);
      request.onerror = () => {
        logError(request.error, `IndexedDB setItem: ${storeName}`);
        reject(request.error);
      };
    });
  } catch (error) {
    logError(error, `IndexedDB setItem: ${storeName}`);
    throw error;
  }
};

/**
 * Get an item from an object store by ID
 * @param {string} storeName - Object store name
 * @param {string} id - Item ID
 * @returns {Promise<object|null>} The item or null if not found
 */
export const getItem = async (storeName, id) => {
  try {
    const transaction = await getTransaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => {
        logError(request.error, `IndexedDB getItem: ${storeName}/${id}`);
        reject(request.error);
      };
    });
  } catch (error) {
    logError(error, `IndexedDB getItem: ${storeName}/${id}`);
    throw error;
  }
};

/**
 * Get all items from an object store with optional filtering
 * @param {string} storeName - Object store name
 * @param {object} options - Query options (limit, orderBy, where)
 * @returns {Promise<object[]>} Array of items
 */
export const getAllItems = async (storeName, options = {}) => {
  try {
    const transaction = await getTransaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    
    let request;
    if (options.orderBy && store.indexNames.contains(options.orderBy)) {
      const index = store.index(options.orderBy);
      request = index.getAll();
    } else {
      request = store.getAll();
    }
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        let results = request.result || [];
        
        // Apply filtering if specified
        if (options.where) {
          results = results.filter(item => {
            return Object.entries(options.where).every(([key, value]) => {
              return item[key] === value;
            });
          });
        }
        
        // Apply limit if specified
        if (options.limit && options.limit > 0) {
          results = results.slice(0, options.limit);
        }
        
        resolve(results);
      };
      request.onerror = () => {
        logError(request.error, `IndexedDB getAllItems: ${storeName}`);
        reject(request.error);
      };
    });
  } catch (error) {
    logError(error, `IndexedDB getAllItems: ${storeName}`);
    throw error;
  }
};

/**
 * Delete an item from an object store
 * @param {string} storeName - Object store name
 * @param {string} id - Item ID to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteItem = async (storeName, id) => {
  try {
    const transaction = await getTransaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        logError(request.error, `IndexedDB deleteItem: ${storeName}/${id}`);
        reject(request.error);
      };
    });
  } catch (error) {
    logError(error, `IndexedDB deleteItem: ${storeName}/${id}`);
    throw error;
  }
};

/**
 * Clear all data from an object store
 * @param {string} storeName - Object store name
 * @returns {Promise<boolean>} True if cleared successfully
 */
export const clearStore = async (storeName) => {
  try {
    const transaction = await getTransaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        logError(request.error, `IndexedDB clearStore: ${storeName}`);
        reject(request.error);
      };
    });
  } catch (error) {
    logError(error, `IndexedDB clearStore: ${storeName}`);
    throw error;
  }
};

/**
 * Get database usage information
 * @returns {Promise<object>} Usage statistics
 */
export const getDatabaseInfo = async () => {
  try {
    const db = await initDatabase();
    const info = {
      name: DB_NAME,
      version: DB_VERSION,
      stores: [],
      totalItems: 0
    };

    for (const storeName of db.objectStoreNames) {
      const items = await getAllItems(storeName);
      info.stores.push({
        name: storeName,
        count: items.length
      });
      info.totalItems += items.length;
    }

    return info;
  } catch (error) {
    logError(error, 'IndexedDB getDatabaseInfo');
    return { error: error.message, available: false };
  }
};

/**
 * Generate a unique ID for database entries
 * @returns {string} Unique identifier
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Specialized handlers for different data types

/**
 * Image storage operations
 */
export const images = {
  /**
   * Save a generated image with metadata
   * @param {object} imageData - Image data object
   * @returns {Promise<string>} Image ID
   */
  save: async (imageData) => {
    const data = {
      ...imageData,
      id: imageData.id || generateId(),
      type: 'image',
      createdAt: imageData.createdAt || new Date().toISOString()
    };
    return await setItem(STORES.IMAGES, data);
  },

  /**
   * Get an image by ID
   * @param {string} id - Image ID
   * @returns {Promise<object|null>} Image data
   */
  get: async (id) => await getItem(STORES.IMAGES, id),

  /**
   * Get recent images with optional limit
   * @param {number} limit - Maximum number of images to return
   * @returns {Promise<object[]>} Array of image objects
   */
  getRecent: async (limit = 20) => {
    const items = await getAllItems(STORES.IMAGES, { 
      orderBy: 'createdAt',
      limit 
    });
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Search images by prompt text
   * @param {string} searchText - Text to search for in prompts
   * @returns {Promise<object[]>} Matching images
   */
  search: async (searchText) => {
    const allImages = await getAllItems(STORES.IMAGES);
    return allImages.filter(img => 
      img.prompt && img.prompt.toLowerCase().includes(searchText.toLowerCase())
    );
  },

  /**
   * Delete an image
   * @param {string} id - Image ID
   * @returns {Promise<boolean>} True if deleted
   */
  delete: async (id) => await deleteItem(STORES.IMAGES, id),

  /**
   * Clear all images
   * @returns {Promise<boolean>} True if cleared
   */
  clear: async () => await clearStore(STORES.IMAGES)
};

/**
 * Layout storage operations
 */
export const layouts = {
  /**
   * Save layout data for a specific image and platform
   * @param {object} layoutData - Layout data object
   * @returns {Promise<string>} Layout ID
   */
  save: async (layoutData) => {
    const data = {
      ...layoutData,
      id: layoutData.id || generateId(),
      type: 'layout'
    };
    return await setItem(STORES.LAYOUTS, data);
  },

  /**
   * Get layouts for a specific image
   * @param {string} imageId - Image ID
   * @returns {Promise<object[]>} Array of layouts
   */
  getByImageId: async (imageId) => {
    return await getAllItems(STORES.LAYOUTS, { 
      where: { imageId } 
    });
  },

  /**
   * Delete a layout
   * @param {string} id - Layout ID
   * @returns {Promise<boolean>} True if deleted
   */
  delete: async (id) => await deleteItem(STORES.LAYOUTS, id),

  /**
   * Clear all layouts
   * @returns {Promise<boolean>} True if cleared
   */
  clear: async () => await clearStore(STORES.LAYOUTS)
};

/**
 * Project storage operations (for future use)
 */
export const projects = {
  save: async (projectData) => await setItem(STORES.PROJECTS, projectData),
  get: async (id) => await getItem(STORES.PROJECTS, id),
  getAll: async () => await getAllItems(STORES.PROJECTS, { orderBy: 'updatedAt' }),
  delete: async (id) => await deleteItem(STORES.PROJECTS, id),
  clear: async () => await clearStore(STORES.PROJECTS)
};

/**
 * Initialize the database (call this on app startup)
 * @returns {Promise<boolean>} True if initialized successfully
 */
export const initialize = async () => {
  try {
    await initDatabase();
    return true;
  } catch (error) {
    logError(error, 'IndexedDB initialization');
    return false;
  }
};

/**
 * Clean up old data (call periodically for maintenance)
 * @param {number} daysOld - Delete items older than this many days
 * @returns {Promise<number>} Number of items deleted
 */
export const cleanupOldData = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    let deletedCount = 0;

    // Clean up old images
    const oldImages = await getAllItems(STORES.IMAGES);
    for (const image of oldImages) {
      if (image.createdAt < cutoffISO) {
        await images.delete(image.id);
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    logError(error, 'IndexedDB cleanup');
    return 0;
  }
};