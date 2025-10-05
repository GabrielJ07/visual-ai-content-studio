/**
 * Storage System Test Utility
 * 
 * Simple tests to verify localStorage and IndexedDB functionality
 * Run this to validate the storage migration
 */

import * as localStorage from './localStorage.js';
import * as indexedDB from './indexedDB.js';
import * as dataStorage from './dataStorage.js';

/**
 * Run all storage tests
 * @returns {Promise<object>} Test results
 */
export const runStorageTests = async () => {
  console.log('🧪 Running storage system tests...');
  
  const results = {
    localStorage: { available: false, tests: {} },
    indexedDB: { available: false, tests: {} },
    dataStorage: { tests: {} },
    overall: { passed: 0, failed: 0, skipped: 0 }
  };

  // Test localStorage
  console.log('Testing localStorage...');
  results.localStorage.available = localStorage.isLocalStorageAvailable();
  
  if (results.localStorage.available) {
    try {
      // Test brand kit storage
      const testBrandKit = {
        colors: ['#FF0000', '#00FF00', '#0000FF'],
        typography: 'Modern Sans',
        styleKeywords: ['vibrant', 'modern']
      };
      
      const brandKitSaved = localStorage.brandKit.set(testBrandKit);
      const brandKitLoaded = localStorage.brandKit.get();
      
      results.localStorage.tests.brandKit = {
        passed: brandKitSaved && 
                JSON.stringify(brandKitLoaded.colors) === JSON.stringify(testBrandKit.colors),
        details: { saved: brandKitSaved, loaded: brandKitLoaded }
      };
      
      // Test user info storage
      const testUserInfo = {
        companyName: 'Test Company',
        primaryPlatform: 'instagram',
        socialHandle: '@testuser',
        missionBio: 'Testing storage'
      };
      
      const userInfoSaved = localStorage.userInfo.set(testUserInfo);
      const userInfoLoaded = localStorage.userInfo.get();
      
      results.localStorage.tests.userInfo = {
        passed: userInfoSaved && userInfoLoaded.companyName === testUserInfo.companyName,
        details: { saved: userInfoSaved, loaded: userInfoLoaded }
      };
      
      // Test storage info
      const storageInfo = localStorage.getStorageInfo();
      results.localStorage.tests.storageInfo = {
        passed: storageInfo.available,
        details: storageInfo
      };
      
    } catch (error) {
      results.localStorage.tests.error = { passed: false, error: error.message };
    }
  } else {
    results.localStorage.tests.unavailable = { passed: false, reason: 'localStorage not available' };
    results.overall.skipped++;
  }

  // Test IndexedDB
  console.log('Testing IndexedDB...');
  results.indexedDB.available = indexedDB.isIndexedDBAvailable();
  
  if (results.indexedDB.available) {
    try {
      // Initialize database
      const initialized = await indexedDB.initialize();
      results.indexedDB.tests.initialization = {
        passed: initialized,
        details: { initialized }
      };
      
      if (initialized) {
        // Test image storage
        const testImage = {
          id: 'test-image-1',
          url: 'data:image/png;base64,test',
          prompt: 'Test image generation',
          platform: 'instagram',
          metadata: { test: true }
        };
        
        const imageId = await indexedDB.images.save(testImage);
        const savedImage = await indexedDB.images.get(imageId);
        
        results.indexedDB.tests.imageStorage = {
          passed: savedImage && savedImage.prompt === testImage.prompt,
          details: { imageId, savedImage }
        };
        
        // Test recent images
        const recentImages = await indexedDB.images.getRecent(5);
        results.indexedDB.tests.recentImages = {
          passed: Array.isArray(recentImages),
          details: { count: recentImages.length }
        };
        
        // Test database info
        const dbInfo = await indexedDB.getDatabaseInfo();
        results.indexedDB.tests.databaseInfo = {
          passed: dbInfo && dbInfo.name === 'VisualAIContentStudio',
          details: dbInfo
        };
        
        // Cleanup test data
        await indexedDB.images.delete(imageId);
      }
      
    } catch (error) {
      results.indexedDB.tests.error = { passed: false, error: error.message };
    }
  } else {
    results.indexedDB.tests.unavailable = { passed: false, reason: 'IndexedDB not available' };
    results.overall.skipped++;
  }

  // Test unified data storage
  console.log('Testing unified data storage...');
  try {
    const storageInitialized = await dataStorage.initializeStorage();
    results.dataStorage.tests.initialization = {
      passed: storageInitialized,
      details: { initialized: storageInitialized }
    };
    
    if (storageInitialized) {
      // Test settings storage
      const testBrandKit = {
        colors: ['#AABBCC', '#DDEEFF'],
        typography: 'Test Font',
        styleKeywords: ['test']
      };
      
      const brandKitSaved = await dataStorage.saveBrandKit(testBrandKit);
      const brandKitLoaded = await dataStorage.loadBrandKit();
      
      results.dataStorage.tests.brandKitStorage = {
        passed: brandKitSaved && brandKitLoaded.typography === testBrandKit.typography,
        details: { saved: brandKitSaved, loaded: brandKitLoaded }
      };
      
      // Test storage status
      const storageStatus = await dataStorage.getStorageStatus();
      results.dataStorage.tests.storageStatus = {
        passed: storageStatus && storageStatus.initialized,
        details: storageStatus
      };
    }
    
  } catch (error) {
    results.dataStorage.tests.error = { passed: false, error: error.message };
  }

  // Calculate overall results
  const countResults = (tests) => {
    let passed = 0, failed = 0;
    Object.values(tests).forEach(test => {
      if (typeof test === 'object' && 'passed' in test) {
        if (test.passed) passed++;
        else failed++;
      }
    });
    return { passed, failed };
  };
  
  const localStorageResults = countResults(results.localStorage.tests);
  const indexedDBResults = countResults(results.indexedDB.tests);
  const dataStorageResults = countResults(results.dataStorage.tests);
  
  results.overall.passed = localStorageResults.passed + indexedDBResults.passed + dataStorageResults.passed;
  results.overall.failed = localStorageResults.failed + indexedDBResults.failed + dataStorageResults.failed;
  
  // Log summary
  console.log('🧪 Storage Tests Complete:', {
    passed: results.overall.passed,
    failed: results.overall.failed,
    skipped: results.overall.skipped
  });
  
  if (results.overall.failed > 0) {
    console.warn('⚠️ Some storage tests failed. Check browser compatibility.');
  } else {
    console.log('✅ All storage tests passed successfully!');
  }
  
  return results;
};

/**
 * Quick storage compatibility check
 * @returns {Promise<boolean>} True if storage is fully compatible
 */
export const checkStorageCompatibility = async () => {
  try {
    const results = await runStorageTests();
    return results.overall.failed === 0;
  } catch (error) {
    console.error('Storage compatibility check failed:', error);
    return false;
  }
};