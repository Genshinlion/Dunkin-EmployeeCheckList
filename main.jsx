import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AppProvider } from './store/AppContext';
import App from './views/App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
