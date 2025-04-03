import React, { useState, useEffect } from 'react';
import FloatingButton from './FloatingButton';
import { Sidebar } from './Sidebar';
import { CONFIG } from '../config';

// Debug mode flag for development
const IS_DEBUG_MODE = process.env.NODE_ENV === 'development';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    if (IS_DEBUG_MODE) {
      console.log('Critical Thinker Extension initialized in DEBUG mode');
      console.log('Configuration:', CONFIG);
    }
    
    // Check if we're on a Medium article
    const isMediumArticle = checkIfMediumArticle();
    if (IS_DEBUG_MODE) {
      console.log('Is Medium article:', isMediumArticle);
    }
    
    // Only show the UI if we're on a Medium article
    if (!isMediumArticle) {
      if (IS_DEBUG_MODE) {
        console.log('Not a Medium article, but showing UI in debug mode');
      } else {
        return;
      }
    }
  }, []);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (IS_DEBUG_MODE) {
      console.log('Toggling sidebar, new state:', !isSidebarOpen);
    }
  };
  
  /**
   * Check if the current page is a Medium article
   */
  const checkIfMediumArticle = (): boolean => {
    // Check if URL contains medium.com
    const isMediumDomain = window.location.hostname.includes('medium.com');
    
    // Check if page has article elements (more reliable)
    const hasArticleElements = Boolean(
      document.querySelector('article') || 
      document.querySelector('[data-testid="storyBodySection"]')
    );
    
    // For debug mode, return true even on non-medium sites
    if (IS_DEBUG_MODE) {
      return true;
    }
    
    return isMediumDomain && hasArticleElements;
  };
  
  return (
    <div className="critical-thinker-extension">
      {/* Floating action button to toggle sidebar */}
      <FloatingButton onClick={toggleSidebar} isActive={isSidebarOpen} />
      
      {/* Render sidebar if it's open */}
      {isSidebarOpen && <Sidebar />}
    </div>
  );
};

export default App; 