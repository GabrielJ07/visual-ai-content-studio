/**
 * Cloudflare R2 Storage Utilities
 * 
 * Provides storage operations for Cloudflare R2 and Workers integration.
 * Replaces Firebase Firestore persistence functionality.
 */

import { getCloudflareConfig } from './config.js';

/**
 * Base storage API class for Cloudflare R2 integration
 */
class CloudflareStorage {
  constructor() {
    try {
      this.config = getCloudflareConfig();
      this.baseUrl = this.config.workerUrl;
      this.isConfigured = true;
    } catch (error) {
      console.warn('Cloudflare storage not configured, using local fallback:', error.message);
      this.config = null;
      this.baseUrl = null;
      this.isConfigured = false;
    }
  }

  /**
   * Make authenticated request to Cloudflare Workers API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Response object
   */
  async request(endpoint, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Cloudflare storage is not configured. Please check your environment variables.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiToken}`,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = new Error(`Storage request failed: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response;
  }

  /**
   * Save user settings to storage
   * @param {string} userId - User identifier
   * @param {Object} settings - Settings object
   * @returns {Promise<Object>} Response data
   */
  async saveSettings(userId, settings) {
    const response = await this.request('/api/settings', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        settings,
        timestamp: new Date().toISOString()
      })
    });

    return response.json();
  }

  /**
   * Load user settings from storage
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Settings object
   */
  async loadSettings(userId) {
    const response = await this.request(`/api/settings/${userId}`, {
      method: 'GET'
    });

    if (response.status === 404) {
      return null; // No settings found
    }

    return response.json();
  }

  /**
   * Save image metadata to storage
   * @param {string} userId - User identifier
   * @param {string} imageId - Image identifier
   * @param {Object} metadata - Image metadata
   * @returns {Promise<Object>} Response data
   */
  async saveImageMetadata(userId, imageId, metadata) {
    const response = await this.request('/api/images', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        imageId,
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString()
        }
      })
    });

    return response.json();
  }

  /**
   * Get recent images for user
   * @param {string} userId - User identifier
   * @param {number} limit - Number of images to retrieve
   * @returns {Promise<Array>} Array of image metadata
   */
  async getRecentImages(userId, limit = 10) {
    const response = await this.request(`/api/images/${userId}?limit=${limit}`, {
      method: 'GET'
    });

    return response.json();
  }

  /**
   * Upload image to R2 storage
   * @param {string} userId - User identifier
   * @param {string} imageId - Image identifier
   * @param {Blob} imageBlob - Image data
   * @returns {Promise<string>} Image URL
   */
  async uploadImage(userId, imageId, imageBlob) {
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('userId', userId);
    formData.append('imageId', imageId);

    const response = await this.request('/api/upload', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let FormData set boundary
        'Authorization': `Bearer ${this.config.apiToken}`
      },
      body: formData
    });

    const result = await response.json();
    return result.url;
  }

  /**
   * Delete image from storage
   * @param {string} userId - User identifier
   * @param {string} imageId - Image identifier
   * @returns {Promise<boolean>} Success status
   */
  async deleteImage(userId, imageId) {
    const response = await this.request(`/api/images/${userId}/${imageId}`, {
      method: 'DELETE'
    });

    return response.ok;
  }
}

// Singleton instance
let storageInstance = null;

/**
 * Get storage instance (singleton pattern)
 * @returns {CloudflareStorage} Storage instance
 */
export const getStorage = () => {
  if (!storageInstance) {
    storageInstance = new CloudflareStorage();
  }
  return storageInstance;
};

/**
 * High-level storage operations with error handling
 */
export const storage = {
  /**
   * Save user configuration
   * @param {string} userId - User identifier
   * @param {Object} config - Configuration object
   */
  async saveConfig(userId, config) {
    try {
      const storage = getStorage();
      return await storage.saveSettings(userId, config);
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  },

  /**
   * Load user configuration
   * @param {string} userId - User identifier
   * @returns {Promise<Object|null>} Configuration object or null if not found
   */
  async loadConfig(userId) {
    try {
      const storage = getStorage();
      return await storage.loadSettings(userId);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      console.error('Failed to load config:', error);
      throw error;
    }
  },

  /**
   * Save generated image
   * @param {string} userId - User identifier
   * @param {Blob} imageBlob - Image data
   * @param {Object} metadata - Image metadata (prompt, settings, etc.)
   * @returns {Promise<Object>} Image info with URL and ID
   */
  async saveImage(userId, imageBlob, metadata) {
    try {
      const storage = getStorage();
      const imageId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      
      // Upload image and save metadata in parallel
      const [imageUrl] = await Promise.all([
        storage.uploadImage(userId, imageId, imageBlob),
        storage.saveImageMetadata(userId, imageId, metadata)
      ]);

      return {
        id: imageId,
        url: imageUrl,
        metadata,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to save image:', error);
      throw error;
    }
  },

  /**
   * Get user's recent images
   * @param {string} userId - User identifier
   * @param {number} limit - Number of images to retrieve
   * @returns {Promise<Array>} Array of image objects
   */
  async getImages(userId, limit = 10) {
    try {
      const storage = getStorage();
      return await storage.getRecentImages(userId, limit);
    } catch (error) {
      console.error('Failed to get images:', error);
      throw error;
    }
  },

  /**
   * Delete image
   * @param {string} userId - User identifier
   * @param {string} imageId - Image identifier
   * @returns {Promise<boolean>} Success status
   */
  async deleteImage(userId, imageId) {
    try {
      const storage = getStorage();
      return await storage.deleteImage(userId, imageId);
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }
};

/**
 * Local storage fallback for development/offline use
 */
export const localStorageFallback = {
  /**
   * Save config to localStorage
   * @param {string} userId - User identifier
   * @param {Object} config - Configuration object
   */
  saveConfig(userId, config) {
    try {
      const key = `visual-ai-config-${userId}`;
      const data = {
        ...config,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Failed to save config to localStorage:', error);
      throw error;
    }
  },

  /**
   * Load config from localStorage
   * @param {string} userId - User identifier
   * @returns {Object|null} Configuration object or null if not found
   */
  loadConfig(userId) {
    try {
      const key = `visual-ai-config-${userId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load config from localStorage:', error);
      return null;
    }
  },

  /**
   * Save image metadata to localStorage (URL only, not the actual image)
   * @param {string} userId - User identifier
   * @param {Object} imageInfo - Image info object
   */
  saveImage(userId, imageInfo) {
    try {
      const key = `visual-ai-images-${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(imageInfo);
      
      // Keep only last 20 images
      if (existing.length > 20) {
        existing.splice(20);
      }
      
      localStorage.setItem(key, JSON.stringify(existing));
      return imageInfo;
    } catch (error) {
      console.error('Failed to save image info to localStorage:', error);
      throw error;
    }
  },

  /**
   * Get images from localStorage
   * @param {string} userId - User identifier
   * @param {number} limit - Number of images to retrieve
   * @returns {Array} Array of image objects
   */
  getImages(userId, limit = 10) {
    try {
      const key = `visual-ai-images-${userId}`;
      const images = JSON.parse(localStorage.getItem(key) || '[]');
      return images.slice(0, limit);
    } catch (error) {
      console.error('Failed to get images from localStorage:', error);
      return [];
    }
  }
};

export default storage;