import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// 🚀 PHASE 4: INITIALIZE PRODUCTION RESILIENCE
import { initializeResilience } from './utils/resilienceInit';

// Initialize resilience systems before app starts
initializeResilience();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
