/**
 * DeepSeek API Key Template (RENAME TO apiKey.ts)
 * 
 * This is a template file for configuring your API key.
 * To use it:
 * 1. Rename this file to 'apiKey.ts'
 * 2. Replace the placeholder with your actual DeepSeek API key
 * 3. The file will be ignored by Git (.gitignore) to keep your key secure
 */

// Replace with your actual DeepSeek API key (should start with 'sk-')
// For example: 'sk-abc123def456ghi789jkl'
export const DEEPSEEK_API_KEY = 'sk-your-deepseek-api-key-here';

// Base64 encoded version of your API key
// To generate this value: 
// 1. Go to https://www.base64encode.org/ and paste your API key, then copy the result
// 2. Or in browser console, type: btoa('sk-your-deepseek-api-key-here')
// Then paste the result below:
export const ENCRYPTED_API_KEY = 'c2steW91ci1kZWVwc2Vlay1hcGkta2V5LWhlcmU='; 