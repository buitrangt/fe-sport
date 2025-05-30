// Image utilities for tournament images
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Get full URL for tournament image
 * @param {string} imageUrl - The image filename from backend
 * @returns {string} Full URL to the image
 */
export const getTournamentImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  return `${API_BASE_URL}/api/files/tournaments/${imageUrl}`;
};

/**
 * Default tournament image placeholder
 */
export const DEFAULT_TOURNAMENT_IMAGE = '/images/tournament-placeholder.png';

/**
 * Image validation utilities
 */
export const IMAGE_VALIDATION = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif']
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file type
  if (!IMAGE_VALIDATION.ALLOWED_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Invalid file type. Allowed types: ${IMAGE_VALIDATION.ALLOWED_TYPES.join(', ')}` 
    };
  }

  // Check file size
  if (file.size > IMAGE_VALIDATION.MAX_SIZE) {
    return { 
      isValid: false, 
      error: `File size too large. Maximum size: ${IMAGE_VALIDATION.MAX_SIZE / 1024 / 1024}MB` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
