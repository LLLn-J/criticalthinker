import React, { useState, useEffect } from 'react';
import FloatingButton from './components/FloatingButton';
import { Sidebar } from './components/Sidebar';
import { CONFIG } from './config';

// Debug mode flag for development
const IS_DEBUG_MODE = process.env.NODE_ENV === 'development';

export const App: React.FC = () => {
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
    if (!isMediumArticle && !IS_DEBUG_MODE) {
      console.log('Not a Medium article, UI will not be shown');
      return;
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
    
    return isMediumDomain && hasArticleElements;
  };

  return (
    <div className="critical-thinker-extension" style={{ zIndex: 9999 }}>
      <FloatingButton onClick={toggleSidebar} isActive={isSidebarOpen} />
      {isSidebarOpen && <Sidebar />}
      {/* Invisible debug element to confirm rendering */}
      <div style={{ display: 'none' }}>Critical Thinker Extension Loaded</div>
    </div>
  );
}; 