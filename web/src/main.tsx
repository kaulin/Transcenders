import { ApiClient } from '@transcenders/api-client';
import * as Contracts from '@transcenders/contracts';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContextProvider';
import { PlayersProvider } from './contexts/PlayersContextProvider';
import { UserProvider } from './contexts/UserContextProvider';
import './i18n/i18n';
import './styles/index.css';

//#TODO DEV only, remove for prod or change later
window.api = ApiClient;
window.utils = Contracts;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <PlayersProvider>
            <App />
          </PlayersProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
