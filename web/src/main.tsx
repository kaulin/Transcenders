import { ApiClient } from '@transcenders/api-client';
import * as Contracts from '@transcenders/contracts';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContextProvider';
import { PlayersProvider } from './contexts/PlayersContextProvider';
import { UserProvider } from './contexts/UserContextProvider';
import './i18n/i18n';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <UserProvider>
        <PlayersProvider>
          <App />
        </PlayersProvider>
      </UserProvider>
    </AuthProvider>
  </BrowserRouter>,
);
