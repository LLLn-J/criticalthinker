/**
 * API Key Management Service
 * Handles secure storage and retrieval of API keys using Chrome Storage API
 */

import { ENCRYPTED_API_KEY, DEEPSEEK_API_KEY } from '../apiKey';

// Storage key for the API key
const STORAGE_KEY = 'deepseek_api_key';

/**
 * Get the API key from Chrome storage or fallback to decoded default
 */
export const getApiKey = async (): Promise<string | null> => {
  console.log('Retrieving API key from storage or default');
  
  try {
    // Try to get the key from Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      console.log('Chrome storage API available, attempting to retrieve key');
      return new Promise((resolve) => {
        chrome.storage.sync.get([STORAGE_KEY], (result) => {
          const storedKey = result[STORAGE_KEY];
          if (storedKey) {
            console.log('API key found in Chrome storage');
            resolve(storedKey);
          } else {
            console.log('No API key in storage, using fallback');
            // Fallback to the default encrypted key
            try {
              console.log('Encrypted API key:', ENCRYPTED_API_KEY);
              const decodedKey = atob(ENCRYPTED_API_KEY);
              console.log('Successfully decoded default API key, length:', decodedKey.length);
              // Log the first few characters of the key to verify format
              console.log('API key format check - first 10 chars:', decodedKey.substring(0, 10));
              resolve(decodedKey);
            } catch (error) {
              console.error('Error decoding API key:', error);
              // Use plain key as fallback if decoding fails
              console.log('Falling back to plain API key');
              resolve(DEEPSEEK_API_KEY || null);
            }
          }
        });
      });
    } else {
      console.log('Chrome storage unavailable, using fallback key');
      // If Chrome storage is not available (e.g., during development)
      try {
        console.log('Encrypted API key:', ENCRYPTED_API_KEY);
        const decodedKey = atob(ENCRYPTED_API_KEY);
        console.log('Successfully decoded default API key, length:', decodedKey.length);
        console.log('API key format check - first 10 chars:', decodedKey.substring(0, 10));
        return decodedKey;
      } catch (error) {
        console.error('Error decoding API key:', error);
        // Use plain key as fallback if decoding fails
        console.log('Falling back to plain API key');
        return DEEPSEEK_API_KEY || null;
      }
    }
  } catch (error) {
    console.error('Unexpected error in getApiKey:', error);
    // Last resort fallback
    console.log('Using direct API key as last resort');
    return DEEPSEEK_API_KEY || null;
  }
};

/**
 * Save the API key to Chrome storage
 */
export const saveApiKey = (apiKey: string): Promise<void> => {
  if (!apiKey) {
    console.error('Attempted to save empty API key');
    return Promise.reject(new Error('API key cannot be empty'));
  }

  console.log('Attempting to save API key to storage');
  
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: apiKey }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving API key:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('API key successfully saved to storage');
          resolve();
        }
      });
    });
  } else {
    console.warn('Chrome storage API not available, key not saved');
    // For development environments without Chrome API
    return Promise.resolve();
  }
};

/**
 * Clear the stored API key
 */
export const clearApiKey = (): Promise<void> => {
  console.log('Attempting to clear API key from storage');
  
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.remove(STORAGE_KEY, () => {
        if (chrome.runtime.lastError) {
          console.error('Error clearing API key:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('API key successfully cleared from storage');
          resolve();
        }
      });
    });
  } else {
    console.warn('Chrome storage API not available');
    return Promise.resolve();
  }
};

/**
 * Check if an API key is already stored
 */
export const hasApiKey = (): Promise<boolean> => {
  console.log('Checking if API key is stored');
  
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEY], (result) => {
        const exists = !!result[STORAGE_KEY];
        console.log('API key exists in storage:', exists);
        resolve(exists);
      });
    });
  } else {
    console.warn('Chrome storage API not available, assuming key exists');
    return Promise.resolve(true); // Assume key exists in development
  }
}; 