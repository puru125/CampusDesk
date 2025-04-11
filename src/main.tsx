
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Add comprehensive error handling for better debugging
const renderApp = () => {
  try {
    console.log('Starting to render the application...');
    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      throw new Error("Root element not found. Cannot mount React application.");
    }
    
    const root = createRoot(rootElement);
    
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    
    console.log('Application rendered successfully');
  } catch (error) {
    console.error('Failed to render application:', error);
    
    // Display a fallback UI when React can't render at all
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 2rem auto; padding: 2rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; background: white;">
          <h2 style="color: #e11d48; margin-top: 0;">Application Error</h2>
          <p>The application failed to start properly. This might be due to:</p>
          <ul style="margin-bottom: 1.5rem;">
            <li>Missing dependencies</li>
            <li>JavaScript errors</li>
            <li>Network issues</li>
          </ul>
          <p style="margin-bottom: 1.5rem;">Please check the browser console for details.</p>
          <button 
            onclick="window.location.reload()" 
            style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;"
          >
            Refresh Page
          </button>
        </div>
      `;
    }
  }
};

renderApp();
