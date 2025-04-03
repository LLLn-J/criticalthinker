import { marked } from 'marked';
import { CONFIG } from '../config';
import { getApiKey, saveApiKey } from './keyManagement';
import { DEEPSEEK_API_KEY } from '../apiKey';
import OpenAI from 'openai';

/**
 * Extract article content from webpage
 */
export const extractArticleContent = (): string => {
  console.log('Starting to extract article content');
  
  // Try to find article main content
  const articleSelectors = [
    'article', 
    '.article',
    '.article-content',
    '.article-body',
    '.story-body',
    '.story-content',
    '[data-testid="storyBodySection"]',
    '.section-content',
    '.pw-post-body-paragraph',
    '.meteredContent'
  ];
  
  let articleContent = '';
  
  // Try various selectors to find article content
  for (const selector of articleSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements && elements.length > 0) {
      // If we find multiple elements with this selector, join their content
      console.log(`Found ${elements.length} elements with selector: ${selector}`);
      const elementsContent = Array.from(elements)
        .map(el => el.textContent || '')
        .join('\n\n');
      
      if (elementsContent.length > 100) {
        articleContent = elementsContent;
        console.log(`Using content from selector: ${selector}, length: ${articleContent.length} chars`);
        break;
      }
    }
  }
  
  // If not found, get the main content of the page
  if (!articleContent || articleContent.length < 100) {
    console.log('Article content not found with selectors, trying fallback methods');
    
    // Try to get content from main tag
    const mainContent = document.querySelector('main');
    if (mainContent) {
      articleContent = mainContent.textContent || '';
      console.log(`Found content in <main> element, length: ${articleContent.length} chars`);
    } else {
      // Last resort: use all paragraph text from the page
      const paragraphs = document.querySelectorAll('p');
      articleContent = Array.from(paragraphs)
        .map(p => p.textContent)
        .filter(Boolean)
        .join('\n\n');
      console.log(`Collected content from ${paragraphs.length} paragraphs, length: ${articleContent.length} chars`);
    }
  }
  
  // Clean and trim text
  const trimmedContent = trimArticleContent(articleContent);
  console.log(`Final extracted content length: ${trimmedContent.length} characters`);
  return trimmedContent;
};

/**
 * Clean and trim article content
 */
const trimArticleContent = (content: string): string => {
  // Remove excess whitespace
  let cleaned = content.replace(/\s+/g, ' ').trim();
  
  // If content exceeds max length, get middle section
  if (cleaned.length > CONFIG.generation.maxInputChars) {
    console.log(`Content length (${cleaned.length}) exceeds maximum, trimming to ${CONFIG.generation.maxInputChars} chars`);
    // To ensure we get meaningful content, take from the middle
    const startIndex = Math.floor((cleaned.length - CONFIG.generation.maxInputChars) / 2);
    cleaned = cleaned.substring(startIndex, startIndex + CONFIG.generation.maxInputChars);
    
    // Ensure we don't truncate words
    const firstSpaceIndex = cleaned.indexOf(' ');
    const lastSpaceIndex = cleaned.lastIndexOf(' ');
    
    if (firstSpaceIndex > 0 && lastSpaceIndex > 0 && lastSpaceIndex !== cleaned.length - 1) {
      cleaned = cleaned.substring(firstSpaceIndex + 1, lastSpaceIndex);
    }
  }
  
  return cleaned;
};

/**
 * Parse Markdown to HTML
 */
export const parseMarkdown = (markdownText: string): string => {
  // Remove possible ```markdown and ``` tags
  const cleanMarkdown = markdownText.replace(/^```markdown\n|^```\n|```$/g, '');
  
  // For bullet points that are already properly formatted, don't parse them
  if (cleanMarkdown.split('\n').every(line => line.trim() === '' || line.trim().startsWith('-') || line.trim().startsWith('*'))) {
    console.log('Response is already in bullet point format, using as is');
    return cleanMarkdown;
  }
  
  // Convert marked.parse result to string
  try {
    return String(marked.parse(cleanMarkdown));
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return cleanMarkdown; // Fallback to the raw text if parsing fails
  }
};

/**
 * Fetch critical thinking questions
 */
export const fetchCriticalThinkingQuestions = async (previousQuestions?: string[]): Promise<string[]> => {
  try {
    console.log('Starting to fetch critical thinking questions');
    const articleContent = extractArticleContent();
    
    if (!articleContent || articleContent.length < 50) {
      console.error('Insufficient article content extracted, length:', articleContent?.length || 0);
      throw new Error('Could not extract sufficient article content');
    }
    
    // Securely retrieve the API key with fallback
    console.log('Retrieving API key');
    const apiKey = await getApiKey();
    if (!apiKey || apiKey === 'replace-with-your-api-key') {
      console.error('Invalid API key:', apiKey);
      throw new Error('API key not configured or is using placeholder value');
    }
    console.log('Using API key:', apiKey.substring(0, 5) + '...');
    
    console.log('Creating OpenAI client with DeepSeek API endpoint');
    const openai = new OpenAI({
      baseURL: CONFIG.api.deepseek.endpoint,
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for browser environment
    });
    
    // Check if we have previous questions to avoid repeating
    let promptContent = `Here is part of a Medium article:\n\n${articleContent}\n\nGenerate exactly 3 brief thought-provoking questions about this content in simple bullet-point format. Keep each question under 15 words. Don't use any markdown formatting - just plain text with bullet points.`;
    
    // If regenerating, include previous questions to ensure variety
    if (previousQuestions && previousQuestions.length > 0) {
      promptContent = `Here is part of a Medium article:\n\n${articleContent}\n\nPreviously, I generated these questions:\n${previousQuestions.map(q => `- ${q}`).join('\n')}\n\nGenerate 3 NEW thought-provoking questions about this content that are DIFFERENT from the previous ones. Focus on different aspects, angles, or themes to reduce repetition. Keep each question under 15 words. Use simple bullet points with '-' or '*' only.`;
    }
    
    console.log('Making API request to DeepSeek using OpenAI client', {
      baseURL: CONFIG.api.deepseek.endpoint,
      model: CONFIG.api.deepseek.model,
      temperature: previousQuestions ? CONFIG.generation.regenerationTemperature : CONFIG.generation.temperature,
      maxTokens: CONFIG.generation.maxTokens
    });
    
    const completion = await openai.chat.completions.create({
      model: CONFIG.api.deepseek.model,
      messages: [
        {
          role: "system",
          content: "Generate exactly 3 concise bullet-point critical thinking questions based on the article. Each question should be 10-15 words maximum. Use only plain text with no markdown formatting (no bold, italic, etc). Use simple bullet points with '-' or '*' only."
        },
        {
          role: "user",
          content: promptContent
        }
      ],
      max_tokens: CONFIG.generation.maxTokens,
      temperature: previousQuestions ? CONFIG.generation.regenerationTemperature : CONFIG.generation.temperature,
    });
    
    console.log('Received API response:', completion);
    
    const markdownResponse = completion.choices[0]?.message?.content || '';
    
    if (!markdownResponse) {
      console.error('Empty response from API');
      throw new Error('API returned empty response');
    }
    
    console.log('Raw response:', markdownResponse);
    
    // If the response is already in bullet point format
    const bulletPointLines = markdownResponse.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('*'))
      .map(line => line.substring(1).trim());
    
    if (bulletPointLines.length >= 3) {
      console.log(`Found ${bulletPointLines.length} bullet points directly in the response`);
      return bulletPointLines;
    }
    
    // Parse Markdown if needed
    const parsedHtml = parseMarkdown(markdownResponse);
    
    // Create temporary DOM element to extract questions
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = parsedHtml;
    
    // Extract list items
    const listItems = tempDiv.querySelectorAll('li');
    if (listItems.length > 0) {
      console.log(`Found ${listItems.length} list items in the parsed HTML`);
      return Array.from(listItems).map(li => li.innerHTML);
    }
    
    // Last resort: split by paragraphs
    const paragraphs = markdownResponse.split('\n\n')
      .map((para: string) => para.trim())
      .filter(Boolean)
      .slice(0, 3);
    
    console.log(`Extracted ${paragraphs.length} paragraphs from the response`);
    return paragraphs;
    
  } catch (error) {
    console.error('Error in fetchCriticalThinkingQuestions:', error);
    return [
      "What is the author's core argument and how might it be challenged?",
      "Which assumptions in the article might warrant deeper examination?",
      "How might the conclusions change if different methodology or data were used?"
    ];
  }
};

/**
 * Test API connectivity with a simple request
 * This can be called from the console for debugging
 */
export const testApiConnection = async (): Promise<{success: boolean, message: string, data?: any}> => {
  try {
    console.log('Testing API connection');
    
    // Get API key but also have a direct fallback for immediate testing
    const apiKey = await getApiKey();
    if (!apiKey) {
      const errorMsg = 'No valid API key available for testing';
      console.error(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }
    
    console.log('Using API key:', apiKey.substring(0, 5) + '...');
    
    console.log('Creating OpenAI client with DeepSeek API endpoint for test');
    const openai = new OpenAI({
      baseURL: CONFIG.api.deepseek.endpoint,
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for browser environment
    });
    
    console.log('Making test API request to DeepSeek:', {
      baseURL: CONFIG.api.deepseek.endpoint,
      model: CONFIG.api.deepseek.model
    });
    
    // Create a minimal test request
    const completion = await openai.chat.completions.create({
      model: CONFIG.api.deepseek.model,
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant who responds very briefly." 
        },
        { 
          role: "user", 
          content: "Respond with a simple 'Hello, API connection successful!' (under 10 words)" 
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });
    
    console.log('Test API response success:', {
      status: 'success',
      content: completion.choices[0]?.message?.content
    });
    
    return {
      success: true,
      message: 'API connection successful',
      data: completion
    };
    
  } catch (error) {
    console.error('Test API connection failed:', error);
    
    // Provide detailed error information
    let errorDetails = 'Unknown error';
    if (error instanceof Error) {
      errorDetails = error.message;
      console.error('Error stack:', error.stack);
    } else {
      errorDetails = JSON.stringify(error);
    }
    
    return {
      success: false,
      message: `API connection failed: ${errorDetails}`,
      data: error
    };
  }
};

// Expose the test function to the window for console debugging
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection;
  
  // Create a debug object for troubleshooting
  (window as any).criticalThinker = {
    testApiConnection,
    fixApiKey: async () => {
      try {
        console.log('Attempting to fix API key configuration...');
        // Try to manually save the key to storage
        await saveApiKey(DEEPSEEK_API_KEY);
        console.log('Saved direct API key to storage');
        
        // Test connection with new key
        const testResult = await testApiConnection();
        console.log('Test result after fixing:', testResult);
        
        return {
          success: testResult.success,
          message: testResult.success ? 'API key configuration fixed!' : 'Failed to fix API key',
          testResult
        };
      } catch (error) {
        console.error('Error fixing API key:', error);
        return {
          success: false,
          message: `Failed to fix API key: ${error instanceof Error ? error.message : String(error)}`,
          error
        };
      }
    },
    CONFIG
  };
} 