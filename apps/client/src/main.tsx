import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import { Toaster } from '@/components/ui/toaster';

/**
 * APPLICATION ENTRY POINT
 * * Wrappers:
 * 1. Provider (Redux): Makes the global store available to all components.
 * 2. BrowserRouter: Enables client-side routing.
 * 3. React.StrictMode: Highlights potential problems in development.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);