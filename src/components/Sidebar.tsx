import React, { useState, useEffect } from 'react';
import { fetchCriticalThinkingQuestions } from '../services/apiService';
import { CONFIG } from '../config';

export const Sidebar: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [regenerationCount, setRegenerationCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  useEffect(() => {
    // Only generate questions once on component mount
    if (!isInitialized) {
      generateQuestions();
      setIsInitialized(true);
    }
  }, [isInitialized]);
  
  // Log state changes for debugging
  useEffect(() => {
    console.log('Sidebar state updated - regenerationCount:', regenerationCount, 'isInitialized:', isInitialized);
  }, [regenerationCount, isInitialized]);
  
  const generateQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Generating questions, current count:', regenerationCount);
      
      // Fetch questions from the API service, passing current questions if regenerating
      const newQuestions = await fetchCriticalThinkingQuestions(
        isInitialized ? questions : undefined
      );
      
      console.log('Questions generated successfully:', newQuestions.length);
      setQuestions(newQuestions);
      
      // Only increment if this is NOT the first load
      if (isInitialized) {
        setRegenerationCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerate = () => {
    console.log('Regenerate button clicked, current count:', regenerationCount, 'max:', CONFIG.generation.maxRegenerations);
    if (regenerationCount < CONFIG.generation.maxRegenerations) {
      console.log('Regeneration allowed, generating new questions');
      generateQuestions();
    } else {
      console.log('Regeneration limit reached, not generating new questions');
    }
  };
  
  // Check if regeneration limit has been reached
  const hasReachedLimit = regenerationCount >= CONFIG.generation.maxRegenerations;
  console.log('Regeneration status check - count:', regenerationCount, 'max:', CONFIG.generation.maxRegenerations, 'hasReachedLimit:', hasReachedLimit);
  
  // Calculate remaining regenerations
  const remainingRegenerations = Math.max(0, CONFIG.generation.maxRegenerations - regenerationCount);
  
  return (
    <div className="critical-thinker-popup fixed bottom-[80px] right-[24px] w-[360px] bg-white shadow-xl rounded-lg overflow-hidden z-50 border border-gray-200 transition-all duration-300 ease-in-out">
      <div className="px-4 py-3 bg-white flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Critical Thinking Questions</h2>
      </div>
      
      <div className="p-4 pt-2 max-h-[300px] overflow-y-auto questions-container">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700"></div>
            <p className="mt-3 text-gray-600">Generating questions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-3 rounded-md mb-4">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={generateQuestions}
              className="mt-2 text-sm px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            <ul className="space-y-4">
              {questions.map((question, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-600 mr-2 mt-0.5">•</span>
                  <span className="text-gray-800 text-base font-normal leading-relaxed" dangerouslySetInnerHTML={{ __html: question }} />
                </li>
              ))}
            </ul>
            
            <div className="mt-5">
              <button
                onClick={handleRegenerate}
                disabled={hasReachedLimit}
                className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                  hasReachedLimit 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#6E8B5B] hover:bg-[#5A7349] text-white'
                }`}
              >
                Regenerate Questions
              </button>
              
              {/* Remaining regenerations message */}
              <p className="mt-2 text-xs text-gray-500 text-center">
                {remainingRegenerations > 0 
                  ? `You have ${remainingRegenerations} regeneration${remainingRegenerations !== 1 ? 's' : ''} remaining.`
                  : 'You have reached the maximum number of regenerations.'
                }
              </p>
              
              {error && regenerationCount > 0 && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-600 text-center">
                  API error occurred. Using fallback questions.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-2 bg-white border-t border-gray-200 text-xs text-gray-500 text-center">
        Critical Thinker for Medium
      </div>
    </div>
  );
}; 