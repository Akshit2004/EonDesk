import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Landing from './pages/Landing/Landing'
import Support from './pages/Support/Support'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
