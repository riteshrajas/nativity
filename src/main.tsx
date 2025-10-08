import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './tailwind.css';
import { ThemeProvider } from './theme/ThemeProvider';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
