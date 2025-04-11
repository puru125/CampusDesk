
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add error handling for better debugging
const renderApp = () => {
  try {
    console.log('Starting to render the application...');
    createRoot(document.getElementById("root")!).render(<App />);
    console.log('Application rendered successfully');
  } catch (error) {
    console.error('Failed to render application:', error);
  }
};

renderApp();
