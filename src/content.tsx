import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';

// Create a container for our React app
const injectApp = () => {
  console.log('Critical Thinker Extension: Script running on', window.location.href);
  
  // Only inject on article pages
  if (!window.location.href.includes('medium.com')) {
    console.log('Critical Thinker Extension: Not a Medium page, skipping injection');
    return;
  }

  // For debugging purposes, always inject on all Medium pages
  console.log('Critical Thinker Extension: Injecting app container');
  
  // Create a div to inject our app
  const appContainer = document.createElement('div');
  appContainer.id = 'critical-thinker-extension';
  document.body.appendChild(appContainer);

  try {
    console.log('Critical Thinker Extension: Rendering React app');
    const root = ReactDOM.createRoot(appContainer);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Critical Thinker Extension: Error rendering App component', error);
  }
};

// Run the injection
if (document.readyState === 'loading') {
  console.log('Critical Thinker Extension: Document loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', injectApp);
} else {
  console.log('Critical Thinker Extension: Document already loaded, injecting now');
  injectApp();
} 