/**
 * Blob URL Management Utility
 * 
 * This module provides utilities for proper Blob URL management to prevent memory leaks.
 * Always use these functions instead of directly calling URL.createObjectURL/revokeObjectURL.
 */

// Track active blob URLs to ensure proper cleanup
const activeBlobUrls = new Set();

/**
 * Creates a blob URL and tracks it for automatic cleanup
 * @param {Blob|File} blob - The blob or file to create URL for
 * @returns {string} The blob URL
 */
export const createBlobUrl = (blob) => {
  if (!blob || typeof blob !== 'object') {
    throw new Error('createBlobUrl requires a valid Blob or File object');
  }

  const url = URL.createObjectURL(blob);
  activeBlobUrls.add(url);
  
  // Log in development mode for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Created blob URL: ${url}, Active URLs: ${activeBlobUrls.size}`);
  }
  
  return url;
};

/**
 * Revokes a blob URL and removes it from tracking
 * @param {string} url - The blob URL to revoke
 */
export const revokeBlobUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('blob:')) {
    return; // Silently ignore invalid URLs
  }

  try {
    URL.revokeObjectURL(url);
    activeBlobUrls.delete(url);
    
    // Log in development mode for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Revoked blob URL: ${url}, Active URLs: ${activeBlobUrls.size}`);
    }
  } catch (error) {
    // Log error but don't throw - cleanup should be resilient
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Failed to revoke blob URL: ${url}`, error);
    }
  }
};

/**
 * Revokes multiple blob URLs at once
 * @param {string[]} urls - Array of blob URLs to revoke
 */
export const revokeBlobUrls = (urls) => {
  if (!Array.isArray(urls)) {
    return;
  }
  
  urls.forEach(revokeBlobUrl);
};

/**
 * Clean up all active blob URLs (use with caution)
 * Useful for component unmounting or page navigation
 */
export const revokeAllBlobUrls = () => {
  const urlsToRevoke = Array.from(activeBlobUrls);
  urlsToRevoke.forEach(revokeBlobUrl);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Cleaned up ${urlsToRevoke.length} blob URLs`);
  }
};

/**
 * Get the count of active blob URLs (for debugging)
 * @returns {number} Number of active blob URLs
 */
export const getActiveBlobUrlCount = () => {
  return activeBlobUrls.size;
};

/**
 * Check if a URL is a blob URL that we're tracking
 * @param {string} url - URL to check
 * @returns {boolean} True if it's a tracked blob URL
 */
export const isManagedBlobUrl = (url) => {
  return typeof url === 'string' && activeBlobUrls.has(url);
};

/**
 * React hook for managing blob URLs with automatic cleanup
 * @returns {object} Object with createBlobUrl, revokeBlobUrl, and cleanup functions
 */
export const useBlobUrlManager = () => {
  const urlsCreatedByHook = new Set();
  
  const createManagedBlobUrl = (blob) => {
    const url = createBlobUrl(blob);
    urlsCreatedByHook.add(url);
    return url;
  };
  
  const revokeManagedBlobUrl = (url) => {
    revokeBlobUrl(url);
    urlsCreatedByHook.delete(url);
  };
  
  const cleanupHookUrls = () => {
    const urls = Array.from(urlsCreatedByHook);
    urls.forEach(revokeBlobUrl);
    urlsCreatedByHook.clear();
  };
  
  // Return cleanup function for useEffect
  return {
    createBlobUrl: createManagedBlobUrl,
    revokeBlobUrl: revokeManagedBlobUrl,
    cleanup: cleanupHookUrls
  };
};

// Automatic cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', revokeAllBlobUrls);
  
  // Also cleanup on page hide (for mobile browsers)
  window.addEventListener('pagehide', revokeAllBlobUrls);
}