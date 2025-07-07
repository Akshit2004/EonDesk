import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PostgresAuthProvider } from './contexts/PostgresAuthContext.jsx'
import { initializeEmailJS } from './services/emailService.js'
import './index.css'
import App from './App.jsx'

initializeEmailJS();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostgresAuthProvider>
      <App />
    </PostgresAuthProvider>
  </StrictMode>,
)
