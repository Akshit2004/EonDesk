import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { initializeEmailJS } from './services/emailService'
import Landing from './pages/Landing/Landing'
import Support from './pages/Support/Support'
import './App.css'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  useEffect(() => {
    // Initialize EmailJS service when app loads
    initializeEmailJS();
  }, []);
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/support" element={<Support />} />
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
    </AuthProvider>
  )
}

export default App
