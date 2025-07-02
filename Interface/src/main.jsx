import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PostgresAuthProvider } from './contexts/PostgresAuthContext'
import { initializeEmailJS } from './services/emailService'
import './index.css'
import App from './App.jsx'

// Initialize EmailJS
initializeEmailJS();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostgresAuthProvider>
      <App />
    </PostgresAuthProvider>
  </StrictMode>,
)
