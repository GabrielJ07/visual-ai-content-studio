/**
 * Authentication utilities for Cloudflare Workers
 * 
 * Provides JWT-based authentication and session management
 * suitable for Cloudflare Workers deployment. Replaces Firebase Auth.
 */

import { getAppConfig, getCloudflareConfig } from './config.js';

/**
 * Simple JWT utilities (for demonstration - use a proper JWT library in production)
 */
const JWTUtils = {
  /**
   * Decode JWT payload (without verification - for development only)
   * In production, verification should be done server-side
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded payload
   */
  decode(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if expired
   */
  isExpired(token) {
    const payload = this.decode(token);
    if (!payload || !payload.exp) return true;
    
    return payload.exp * 1000 < Date.now();
  },

  /**
   * Create a simple unsigned token for anonymous users (development only)
   * @param {Object} payload - Token payload
   * @returns {string} Token string
   */
  createAnonymousToken(payload) {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const body = btoa(JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    
    return `${header}.${body}.`;
  }
};

/**
 * Authentication manager class
 */
class AuthManager {
  constructor() {
    this.config = getAppConfig();
    try {
      this.cloudflareConfig = getCloudflareConfig();
    } catch (error) {
      console.warn('Cloudflare config not available, proceeding without it:', error);
      this.cloudflareConfig = undefined;
    }
    this.currentUser = null;
    this.token = null;
    this.listeners = new Set();
  }

  /**
   * Initialize authentication
   */
  async initialize() {
    // Check for existing session
    const storedToken = this.getStoredToken();
    if (storedToken && !JWTUtils.isExpired(storedToken)) {
      await this.setAuthToken(storedToken);
    } else {
      // Create anonymous session if no valid token exists
      await this.signInAnonymously();
    }
  }

  /**
   * Get stored authentication token
   * @returns {string|null} Stored token
   */
  getStoredToken() {
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  /**
   * Store authentication token
   * @param {string} token - JWT token
   */
  setStoredToken(token) {
    try {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  /**
   * Set authentication token and decode user info
   * @param {string} token - JWT token
   */
  async setAuthToken(token) {
    this.token = token;
    this.setStoredToken(token);
    
    const payload = JWTUtils.decode(token);
    if (payload) {
      this.currentUser = {
        uid: payload.sub || payload.user_id,
        isAnonymous: payload.anonymous || false,
        email: payload.email || null,
        displayName: payload.name || null,
        createdAt: payload.created_at || new Date().toISOString()
      };
    }
    
    this.notifyListeners();
  }

  /**
   * Sign in anonymously (create temporary user session)
   */
  async signInAnonymously() {
    try {
      // Try to get token from Cloudflare Worker
      const response = await this.requestAnonymousToken();
      
      if (response.token) {
        await this.setAuthToken(response.token);
        return this.currentUser;
      }
      
      throw new Error('Failed to get anonymous token from server');
    } catch (error) {
      console.warn('Server auth failed, using local anonymous token:', error.message);
      
      // Fallback: create local anonymous token for development
      const userId = this.generateAnonymousUserId();
      const token = JWTUtils.createAnonymousToken({
        sub: userId,
        anonymous: true,
        created_at: new Date().toISOString()
      });
      
      await this.setAuthToken(token);
      return this.currentUser;
    }
  }

  /**
   * Request anonymous token from Cloudflare Worker
   * @returns {Promise<Object>} Response with token
   */
  async requestAnonymousToken() {
    const response = await fetch(`${this.cloudflareConfig.workerUrl}/api/auth/anonymous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appId: this.config.appId
      })
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sign in with custom token (for enhanced security)
   * @param {string} customToken - Custom token from server
   */
  async signInWithCustomToken(customToken) {
    try {
      const response = await fetch(`${this.cloudflareConfig.workerUrl}/api/auth/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: customToken,
          appId: this.config.appId
        })
      });

      if (!response.ok) {
        throw new Error(`Custom token authentication failed: ${response.statusText}`);
      }

      const { token } = await response.json();
      await this.setAuthToken(token);
      return this.currentUser;
    } catch (error) {
      console.error('Custom token authentication failed:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    this.token = null;
    this.currentUser = null;
    this.setStoredToken(null);
    
    // Create new anonymous session
    await this.signInAnonymously();
  }

  /**
   * Generate anonymous user ID
   * @returns {string} Anonymous user ID
   */
  generateAnonymousUserId() {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user
   * @returns {Object|null} Current user object
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current auth token
   * @returns {string|null} Current token
   */
  getToken() {
    return this.token;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return this.token && this.currentUser && !JWTUtils.isExpired(this.token);
  }

  /**
   * Add authentication state listener
   * @param {Function} callback - Callback function
   */
  onAuthStateChanged(callback) {
    this.listeners.add(callback);
    
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of auth state change
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentUser);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  /**
   * Refresh token if needed
   */
  async refreshTokenIfNeeded() {
    if (this.token && JWTUtils.isExpired(this.token)) {
      console.log('Token expired, refreshing...');
      await this.signInAnonymously();
    }
  }
}

// Singleton instance
let authInstance = null;

/**
 * Get authentication manager instance
 * @returns {AuthManager} Auth manager instance
 */
export const getAuth = () => {
  if (!authInstance) {
    authInstance = new AuthManager();
  }
  return authInstance;
};

/**
 * Initialize authentication system
 * @returns {Promise<Object|null>} Current user or null
 */
export const initializeAuth = async () => {
  const auth = getAuth();
  await auth.initialize();
  return auth.getCurrentUser();
};

/**
 * High-level authentication functions
 */
export const auth = {
  /**
   * Get current user
   * @returns {Object|null} Current user
   */
  currentUser() {
    return getAuth().getCurrentUser();
  },

  /**
   * Sign in anonymously
   * @returns {Promise<Object>} User object
   */
  async signInAnonymously() {
    return getAuth().signInAnonymously();
  },

  /**
   * Sign in with custom token
   * @param {string} customToken - Custom token
   * @returns {Promise<Object>} User object
   */
  async signInWithCustomToken(customToken) {
    return getAuth().signInWithCustomToken(customToken);
  },

  /**
   * Sign out
   * @returns {Promise<void>}
   */
  async signOut() {
    return getAuth().signOut();
  },

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    return getAuth().onAuthStateChanged(callback);
  },

  /**
   * Get current auth token
   * @returns {string|null} Current token
   */
  getToken() {
    return getAuth().getToken();
  },

  /**
   * Check if authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return getAuth().isAuthenticated();
  },

  /**
   * Refresh token if needed
   * @returns {Promise<void>}
   */
  async refreshTokenIfNeeded() {
    return getAuth().refreshTokenIfNeeded();
  }
};

export default auth;