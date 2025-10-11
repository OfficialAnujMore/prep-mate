import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initFirebaseAnalytics } from './services/firebaseAnalytics';
import { ErrorBoundary } from './components/ErrorBoundary';

initFirebaseAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
