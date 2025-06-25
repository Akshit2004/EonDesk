import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { initializeEmailJS } from './services/emailService'
import { onAuthStateChanged } from './firebase/auth'
import Support from './pages/Support/Support'
import AgentDashboard from './pages/AgentDashboard'
import AgentLogin from './components/AgentLogin/AgentLogin'
import { CustomerLoginPage } from './pages'
import { AgentLoginPage } from './pages'
import './App.css'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [showAgentLogin, setShowAgentLogin] = useState(false)

  useEffect(() => {
    // Initialize EmailJS service when app loads
    initializeEmailJS()

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged((user) => {
      setCurrentUser(user)
      if (user) {
        // Determine user role (you can implement role checking logic here)
        // For now, we'll assume agents have specific email domains or use custom claims
        const isAdmin = user.email?.includes('admin') || user.email?.includes('support@')
        setUserRole(isAdmin ? 'admin' : 'agent')
      } else {
        setUserRole(null)
      }
    })

    return () => unsubscribe()
  }, [])
  const handleAgentLogin = (user) => {
    setCurrentUser(user)
    const isAdmin = user.email?.includes('admin') || user.email?.includes('support@')
    setUserRole(isAdmin ? 'admin' : 'agent')
    setShowAgentLogin(false)
  }

  const handleAgentLogout = () => {
    setCurrentUser(null)
    setUserRole(null)
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">            <Routes>
            {/* <Route path="/" element={<Landing onAgentLogin={handleLandingAgentLogin} />} /> */}
            <Route path="/customer" element={<CustomerLoginPage />} />
            <Route path="/agent" element={<AgentLoginPage />} />
            <Route path="/support" element={<Support />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
          </Routes>

            {/* Agent Login Modal */}
            {showAgentLogin && (
              <AgentLogin
                isOpen={showAgentLogin}
                onClose={() => setShowAgentLogin(false)}
                onLoginSuccess={handleAgentLogin}
              />
            )}

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
    </AuthProvider>
  )
}

export default App
