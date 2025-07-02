import { Sun, Moon, Home, Headphones, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import './Navbar.css'

function Navbar({ currentPage, showThemeToggle = true, showTagline = false, hideUserInfo = false }) {  const navigate = useNavigate()
  const { isDarkTheme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavigation = (page) => {
    if (page === 'home') {
      navigate('/')
    } else if (page === 'support') {
      navigate('/support')
    }
    setIsMobileMenuOpen(false)
  }
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <div className="navbar-brand">
          <div className="logo">
            <div className="logo-wrapper">
              <Headphones className="logo-icon" />
              <div className="logo-glow"></div>
            </div>
            <div className="brand-content">
              <span className="brand-name">EON Support</span>
              {showTagline && (
                <span className="tagline">Your AI-Powered Support Experience</span>
              )}
            </div>
          </div>
        </div>        {/* Navigation Links */}
        <div className="desktop-nav">
          <button 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigation('home')}
          >
            <Home className="nav-icon" />
            <span className="nav-label">Home</span>
            <div className="nav-indicator"></div>
          </button>
          <button 
            className={`nav-link ${currentPage === 'support' ? 'active' : ''}`}
            onClick={() => handleNavigation('support')}
          >
            <Headphones className="nav-icon" />
            <span className="nav-label">Support</span>
            <div className="nav-indicator"></div>
          </button>
        </div>

        {/* Actions */}
        <div className="desktop-actions">
          {showThemeToggle && (
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="theme-icon-wrapper">
                {isDarkTheme ? (
                  <Sun className="theme-icon" />
                ) : (
                  <Moon className="theme-icon" />
                )}
                <div className="theme-glow"></div>
              </div>
            </button>          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-container">
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="menu-icon" />
            ) : (
              <Menu className="menu-icon" />
            )}
          </button>
        </div>
      </div>      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
          {/* Close button inside mobile menu */}
          <div className="mobile-nav-header">
            <h3 className="mobile-nav-title">Menu</h3>
            <button 
              className="mobile-close-btn"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <X className="close-icon" />
            </button>
          </div>
          
          <div className="mobile-nav-links">
            <button 
              className={`mobile-nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => handleNavigation('home')}
            >
              <Home className="nav-icon" />
              <span className="nav-label">Home</span>
            </button>
            <button 
              className={`mobile-nav-link ${currentPage === 'support' ? 'active' : ''}`}
              onClick={() => handleNavigation('support')}
            >
              <Headphones className="nav-icon" />
              <span className="nav-label">Support</span>
            </button>
          </div>

          <div className="mobile-nav-actions">
            {showThemeToggle && (
              <button 
                className="mobile-theme-toggle" 
                onClick={toggleTheme}
              >
                {isDarkTheme ? (
                  <Sun className="theme-icon" />
                ) : (
                  <Moon className="theme-icon" />
                )}
                <span>{isDarkTheme ? 'Light Mode' : 'Dark Mode'}</span>
              </button>            )}
          </div>
        </div>
      </div>      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && <div className="mobile-nav-overlay" onClick={toggleMobileMenu}></div>}
    </nav>
  )
}

export default Navbar