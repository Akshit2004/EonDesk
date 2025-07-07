import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from './contexts/ThemeContext'
import { PostgresAuthProvider } from './contexts/PostgresAuthContext'
import { initializeEmailJS } from './services/emailService'
import AgentDashboard from './pages/AgentDashboard'
import { CustomerLoginPage } from './pages'
import { AgentLoginPage } from './pages'
import { CustomerDashboard } from './pages'
import './App.css'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  useEffect(() => {
    // Initialize EmailJS service when app loads
    initializeEmailJS()
  }, [])
  return (
    <PostgresAuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">            
            <Routes>
            <Route path="/" element={<CustomerLoginPage />} />
            <Route path="/customer" element={<CustomerLoginPage />} />
            <Route path="/agent" element={<AgentLoginPage />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          </Routes>

            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </ThemeProvider>
    </PostgresAuthProvider>
  )
}

export default App
