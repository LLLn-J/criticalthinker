/**
 * Critical Thinker Extension Configuration
 * 
 * This file contains configuration settings for the extension.
 */

// Load API key from environment variable or chrome storage
const getApiKey = (): string => {
  // The actual key is not exposed in source code for security
  // It will be loaded from Chrome storage after installation
  return '';
};

export const CONFIG = {
  // API settings
  api: {
    deepseek: {
      // Don't store actual API key in source code
      apiKey: getApiKey(),
      // API endpoint for DeepSeek (compatible with OpenAI format)
      endpoint: 'https://api.deepseek.com/v1',
      // The DeepSeek model to use (V3 version)
      model: 'deepseek-chat',
    }
  },
  
  // Generation settings
  generation: {
    // Maximum tokens in the response (affects API cost)
    maxTokens: 1024,
    // Higher values (0-1) make output more creative but less predictable
    temperature: 1.3,
    // Higher temperature for regenerations to ensure more variety
    regenerationTemperature: 1.5,
    // Maximum characters to extract from article (affects API cost)
    maxInputChars: 4000,
    // Maximum number of regenerations allowed
    maxRegenerations: 3
  }
}; 