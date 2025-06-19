import { Sun, Moon, Home, Headphones, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import './Navbar.css'

function Navbar({ currentPage, showThemeToggle = true, showTagline = false }) {
  const navigate = useNavigate()
  const { isDarkTheme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  const handleNavigation = (page) => {
    if (page === 'home') {
      navigate('/')
    } else if (page === 'support') {
      navigate('/support')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <div className="navbar-brand">
          <div className="logo">
            <Headphones className="logo-icon" />
            <span className="brand-name">EON Support</span>
          </div>
          {showTagline && (
            <span className="tagline">Your AI-Powered Support Experience</span>
          )}
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          <button 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigation('home')}
          >
            <Home className="nav-icon" />
            <span>Home</span>
          </button>
          <button 
            className={`nav-link ${currentPage === 'support' ? 'active' : ''}`}
            onClick={() => handleNavigation('support')}
          >
            <Headphones className="nav-icon" />
            <span>Support</span>
          </button>
        </div>        {/* Theme Toggle and User Actions */}
        <div className="navbar-actions">
          {showThemeToggle && (
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkTheme ? (
                <Sun className="theme-icon" />
              ) : (
                <Moon className="theme-icon" />
              )}
            </button>
          )}
          
          {/* User Menu */}
          {user && (
            <div className="user-menu">
              <div className="user-info">
                <User className="user-icon" />
                <span className="user-email">{user.email}</span>
              </div>
              <button 
                className="logout-button" 
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut className="logout-icon" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
