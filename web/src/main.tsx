import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/index.css'
import './i18n/i18n'
import { UserProvider } from './contexts/UserContext.tsx'
import { OneVOneProvider } from './contexts/OneVOneContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <OneVOneProvider>
          <App />
        </OneVOneProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
)
