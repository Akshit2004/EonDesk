import { Shield, Sparkles, Sun, Moon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import './Navbar.css'

function Navbar({ currentPage = 'home', showThemeToggle = true, showTagline = true }) {
  const navigate = useNavigate()
  const { isDarkTheme, toggleTheme } = useTheme()

  const handleLogoClick = () => {
    navigate('/')
  }

  return (
    <header className={`navbar ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <div className="logo-container" onClick={handleLogoClick}>
        <Shield className="logo-icon" />
        <span className="logo-text">Eondesk</span>
      </div>
      
      <div className="navbar-right">
        {showTagline && (
          <div className="tagline">
            <Sparkles className="sparkle-icon" />
            <span>Where Support Meets Excellence</span>
          </div>
        )}
        
        {showThemeToggle && (
          <div className="theme-toggle" onClick={toggleTheme}>
            <div className={`theme-slider ${isDarkTheme ? 'dark-mode' : 'light-mode'}`}>
              <div className="theme-icon">
                {isDarkTheme ? <Moon size={16} /> : <Sun size={16} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
