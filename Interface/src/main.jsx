import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { initializeEmailJS } from './services/emailService'
import './index.css'
import App from './App.jsx'

// Initialize EmailJS
initializeEmailJS();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
