/**
 * Integration Example for Cloudflare Storage and Auth
 * 
 * This file demonstrates how to use the new storage and authentication
 * systems in place of Firebase. Remove this file once real integration is complete.
 */

import { auth, initializeAuth } from './auth.js';
import { storage, localStorageFallback } from './storage.js';
import { getCloudflareConfig } from './config.js';

/**
 * Example of complete user workflow with new architecture
 */
export class IntegrationExample {
  constructor() {
    this.user = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      console.log('🚀 Initializing Visual AI Content Studio...');
      
      // Initialize authentication
      this.user = await initializeAuth();
      console.log('✅ Authentication initialized:', this.user);
      
      // Verify configuration
      const config = getCloudflareConfig();
      console.log('✅ Cloudflare configuration loaded:', {
        hasAccountId: !!config.accountId,
        hasBucket: !!config.r2Bucket,
        hasWorkerUrl: !!config.workerUrl,
        hasApiToken: !!config.apiToken
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      
      // Fallback to local storage for development
      console.log('🔄 Falling back to local storage mode...');
      this.user = { uid: 'local_user', isAnonymous: true };
      this.isInitialized = true;
      return false; // Indicates fallback mode
    }
  }

  /**
   * Example: Save user brand kit settings
   */
  async saveBrandKit(brandKit) {
    if (!this.isInitialized) {
      throw new Error('Application not initialized');
    }

    try {
      console.log('💾 Saving brand kit...');
      
      const settings = {
        brandKit,
        updatedAt: new Date().toISOString()
      };

      // Try cloud storage first
      try {
        await storage.saveConfig(this.user.uid, settings);
        console.log('✅ Brand kit saved to cloud storage');
        return { success: true, location: 'cloud' };
      } catch (error) {
        console.warn('⚠️ Cloud storage failed, using local fallback:', error.message);
        
        // Fallback to local storage
        localStorageFallback.saveConfig(this.user.uid, settings);
        console.log('✅ Brand kit saved to local storage');
        return { success: true, location: 'local' };
      }
    } catch (error) {
      console.error('❌ Failed to save brand kit:', error);
      throw error;
    }
  }

  /**
   * Example: Load user brand kit settings
   */
  async loadBrandKit() {
    if (!this.isInitialized) {
      throw new Error('Application not initialized');
    }

    try {
      console.log('📁 Loading brand kit...');
      
      // Try cloud storage first
      try {
        const settings = await storage.loadConfig(this.user.uid);
        if (settings) {
          console.log('✅ Brand kit loaded from cloud storage');
          return { ...settings, location: 'cloud' };
        }
      } catch (error) {
        console.warn('⚠️ Cloud storage failed, trying local fallback:', error.message);
      }

      // Fallback to local storage
      const settings = localStorageFallback.loadConfig(this.user.uid);
      if (settings) {
        console.log('✅ Brand kit loaded from local storage');
        return { ...settings, location: 'local' };
      }

      console.log('ℹ️ No brand kit found, using defaults');
      return null;
    } catch (error) {
      console.error('❌ Failed to load brand kit:', error);
      throw error;
    }
  }

  /**
   * Example: Save generated image
   */
  async saveGeneratedImage(imageBlob, metadata) {
    if (!this.isInitialized) {
      throw new Error('Application not initialized');
    }

    try {
      console.log('🖼️ Saving generated image...');
      
      // Try cloud storage first
      try {
        const imageInfo = await storage.saveImage(this.user.uid, imageBlob, metadata);
        console.log('✅ Image saved to cloud storage:', imageInfo.id);
        return { ...imageInfo, location: 'cloud' };
      } catch (error) {
        console.warn('⚠️ Cloud storage failed, using local fallback:', error.message);
        
        // For local fallback, create a blob URL (temporary)
        const imageUrl = URL.createObjectURL(imageBlob);
        const imageInfo = {
          id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          url: imageUrl,
          metadata,
          createdAt: new Date().toISOString()
        };
        
        localStorageFallback.saveImage(this.user.uid, imageInfo);
        console.log('✅ Image saved locally:', imageInfo.id);
        return { ...imageInfo, location: 'local' };
      }
    } catch (error) {
      console.error('❌ Failed to save image:', error);
      throw error;
    }
  }

  /**
   * Example: Get user's recent images
   */
  async getRecentImages(limit = 10) {
    if (!this.isInitialized) {
      throw new Error('Application not initialized');
    }

    try {
      console.log('📷 Loading recent images...');
      
      // Try cloud storage first
      try {
        const images = await storage.getImages(this.user.uid, limit);
        console.log(`✅ Loaded ${images.length} images from cloud storage`);
        return images.map(img => ({ ...img, location: 'cloud' }));
      } catch (error) {
        console.warn('⚠️ Cloud storage failed, trying local fallback:', error.message);
      }

      // Fallback to local storage
      const images = localStorageFallback.getImages(this.user.uid, limit);
      console.log(`✅ Loaded ${images.length} images from local storage`);
      return images.map(img => ({ ...img, location: 'local' }));
    } catch (error) {
      console.error('❌ Failed to load recent images:', error);
      return [];
    }
  }

  /**
   * Example: User authentication flow
   */
  async signOut() {
    try {
      console.log('👋 Signing out...');
      await auth.signOut();
      this.user = auth.currentUser();
      console.log('✅ Signed out, new anonymous user:', this.user.uid);
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    }
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Check if using cloud storage
   */
  isCloudMode() {
    try {
      getCloudflareConfig();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Example usage for developers:
 * 
 * const app = new IntegrationExample();
 * 
 * // Initialize
 * const cloudMode = await app.initialize();
 * console.log('Cloud mode:', cloudMode);
 * 
 * // Save brand kit
 * await app.saveBrandKit({
 *   colors: ['#FF0000', '#00FF00', '#0000FF'],
 *   typography: 'Modern sans-serif',
 *   style: 'minimalist'
 * });
 * 
 * // Load brand kit
 * const brandKit = await app.loadBrandKit();
 * console.log('Brand kit:', brandKit);
 * 
 * // Save image (you would get imageBlob from canvas or AI generation)
 * const imageBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
 * const imageInfo = await app.saveGeneratedImage(imageBlob, {
 *   prompt: 'A beautiful sunset',
 *   platform: 'instagram',
 *   dimensions: { width: 1080, height: 1080 }
 * });
 * 
 * // Get recent images  
 * const recentImages = await app.getRecentImages(5);
 * console.log('Recent images:', recentImages);
 */

export default IntegrationExample;