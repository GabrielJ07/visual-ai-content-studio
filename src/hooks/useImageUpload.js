/**
 * React Hook for Image Upload and Preview Management
 * 
 * Provides safe image handling with automatic blob URL cleanup to prevent memory leaks.
 * Use this hook instead of manually managing blob URLs in components.
 */

import { useState, useEffect, useCallback } from 'react';
import { useBlobUrlManager } from '../utils/blobManager.js';
import { useError } from '../utils/errorContext.js';

/**
 * Hook for managing image uploads with preview and automatic cleanup
 * @param {Object} options - Configuration options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 5MB)
 * @param {string[]} options.acceptedTypes - Accepted MIME types (default: common image types)
 * @param {Function} options.onUpload - Callback when image is successfully processed
 * @param {Function} options.onError - Custom error handler
 * @returns {Object} Image upload utilities and state
 */
export const useImageUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    onUpload,
    onError
  } = options;

  const [images, setImages] = useState([]); // Array of {file, url, id, name, size}
  const [isUploading, setIsUploading] = useState(false);
  const { showError, showSuccess } = useError();
  const { createBlobUrl, revokeBlobUrl, cleanup } = useBlobUrlManager();

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const validateFile = useCallback((file) => {
    if (!file || typeof file !== 'object') {
      return 'Invalid file';
    }

    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please use: ${acceptedTypes.join(', ')}`;
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    return null;
  }, [acceptedTypes, maxSize]);

  const processFile = useCallback(async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      const url = createBlobUrl(file);
      const imageData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };

      return imageData;
    } catch (error) {
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }, [createBlobUrl, validateFile]);

  const addImages = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const fileArray = Array.from(files);
      const processedImages = [];

      for (const file of fileArray) {
        try {
          const imageData = await processFile(file);
          processedImages.push(imageData);
        } catch (error) {
          const errorMessage = `Failed to upload ${file.name}: ${error.message}`;
          if (onError) {
            onError(error, file);
          } else {
            showError(errorMessage);
          }
        }
      }

      if (processedImages.length > 0) {
        setImages(prev => [...prev, ...processedImages]);
        showSuccess(`Successfully uploaded ${processedImages.length} image${processedImages.length > 1 ? 's' : ''}`);
        
        if (onUpload) {
          onUpload(processedImages);
        }
      }
    } catch (error) {
      const errorMessage = 'Failed to process images';
      if (onError) {
        onError(error);
      } else {
        showError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  }, [processFile, onUpload, onError, showError, showSuccess]);

  const removeImage = useCallback((imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        // Revoke the blob URL to prevent memory leak
        revokeBlobUrl(imageToRemove.url);
      }
      return prev.filter(img => img.id !== imageId);
    });
  }, [revokeBlobUrl]);

  const clearImages = useCallback(() => {
    // Revoke all blob URLs before clearing
    images.forEach(image => revokeBlobUrl(image.url));
    setImages([]);
  }, [images, revokeBlobUrl]);

  const getImageById = useCallback((id) => {
    return images.find(img => img.id === id);
  }, [images]);

  const handleFileInput = useCallback((event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addImages(files);
    }
    // Clear the input so the same file can be selected again
    event.target.value = '';
  }, [addImages]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      addImages(files);
    }
  }, [addImages]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  return {
    // State
    images,
    isUploading,
    imageCount: images.length,

    // Actions
    addImages,
    removeImage,
    clearImages,
    getImageById,

    // Event handlers for UI
    handleFileInput,
    handleDrop,
    handleDragOver,

    // Utilities
    validateFile,
    
    // Configuration
    maxSize,
    acceptedTypes
  };
};

/**
 * Hook for single image upload (simplified version)
 * @param {Object} options - Configuration options (same as useImageUpload)
 * @returns {Object} Single image utilities and state
 */
export const useSingleImageUpload = (options = {}) => {
  const imageUpload = useImageUpload({ ...options, maxImages: 1 });
  
  const setImage = useCallback(async (file) => {
    imageUpload.clearImages();
    if (file) {
      await imageUpload.addImages([file]);
    }
  }, [imageUpload]);

  return {
    image: imageUpload.images[0] || null,
    isUploading: imageUpload.isUploading,
    setImage,
    clearImage: imageUpload.clearImages,
    handleFileInput: imageUpload.handleFileInput,
    handleDrop: imageUpload.handleDrop,
    handleDragOver: imageUpload.handleDragOver,
    validateFile: imageUpload.validateFile
  };
};

export default useImageUpload;