import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/index.css'
import './i18n/i18n'
import { UserProvider } from './contexts/UserContext.tsx'
import { PlayersProvider } from './contexts/PlayersContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <PlayersProvider>
          <App />
        </PlayersProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
)
