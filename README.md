# Critical Thinker for Medium

A Chrome extension that adds a floating window to Medium.com articles, displaying AI-generated critical thinking questions about the article content.

<img width="456" alt="Image" src="https://github.com/user-attachments/assets/34c69e09-cc4e-43c1-b637-d864d8533da5" />


## Features

- Floating brain icon (🧠) button in the bottom right corner of Medium articles
- Clicking the button opens a floating window with critical thinking questions
- Questions are generated by DeepSeek AI in a bullet-point format
- Designed to match Medium's UI style
- Limited to one regeneration per session to control API usage
- Secure API key management - keys are never exposed in the code

## Security

This extension uses secure practices for API key management:

- API keys are stored securely in Chrome's local storage
- Keys are never visible in the source code
- The extension uses basic obfuscation to protect against casual inspection
- For even better security, consider using a backend proxy service

## Installation

### API Key Setup

This extension requires a DeepSeek API key to function. For security reasons, API keys are not included in the source code.

1. Get a DeepSeek API key from [DeepSeek's website](https://platform.deepseek.com/)
2. Rename the `src/apiKey.template.ts` file to `src/apiKey.ts`
3. Replace the placeholder value with your actual API key
4. The `src/apiKey.ts` file is included in `.gitignore` to prevent accidentally exposing your key

Example for `apiKey.ts`:
```typescript
// Replace with your actual DeepSeek API key
export const DEEPSEEK_API_KEY = 'your-deepseek-api-key-here';

// Base64 encoded version of your API key (automatically encoded)
export const ENCRYPTED_API_KEY = btoa(DEEPSEEK_API_KEY);
```

### Development Mode

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the extension:
   ```
   npm run build
   ```
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `dist` folder from this project

### Usage

1. Navigate to any Medium.com article
2. Click the brain icon (🧠) in the bottom right corner
3. View the critical thinking questions in the floating window
4. Click "Regenerate" to get new questions (limited to once per session)
5. Click the X to close the window

## Configuration Options

You can customize the extension by editing the `src/config.ts` file:

- `maxTokens`: Controls the maximum length of AI-generated responses (affects API cost)
- `temperature`: Controls randomness of AI output (0-1, higher = more creative)
- `maxInputChars`: Controls how much of the article is sent to the API (affects API cost)
- `maxRegenerations`: Controls how many times questions can be regenerated

## Technology Stack

- React
- TypeScript
- TailwindCSS
- DeepSeek API
- Chrome Extension API 

## Development and Debugging

The extension includes several debugging features to help with development:

### Debug Mode

In development mode (`process.env.NODE_ENV === 'development'`), the extension provides:

- Detailed console logs showing API requests and responses
- Extension is visible on all websites, not just Medium
- Decryption steps and key handling are logged for transparency
- Information about article content extraction

### Debugging API Issues

If you experience issues with the API:

1. Open Chrome DevTools console when using the extension
2. Look for logs starting with:
   - "Retrieving API key..."
   - "Making API request to DeepSeek"
   - "Received API response"
3. Check for any error messages in red

### CSS Debugging

The extension includes utility classes for debugging UI issues:
```css
.debug-info {
  position: fixed;
  bottom: 5px;
  left: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  /* Other styling */
}
```

You can add debug info to your components using:
```tsx
{IS_DEBUG_MODE && (
  <div className="debug-info">
    Debug information here
  </div>
)}
``` 
