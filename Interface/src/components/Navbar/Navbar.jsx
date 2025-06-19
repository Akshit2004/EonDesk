import { Sun, Moon, Home, Headphones, LogOut, User, Menu, X, Settings } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import './Navbar.css'

function Navbar({ currentPage, showThemeToggle = true, showTagline = false }) {
  const navigate = useNavigate()
  const { isDarkTheme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleNavigation = (page) => {
    if (page === 'home') {
      navigate('/')
    } else if (page === 'support') {
      navigate('/support')
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
    setIsUserMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
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
            <span>Home</span>
            <div className="nav-indicator"></div>
          </button>
          <button 
            className={`nav-link ${currentPage === 'support' ? 'active' : ''}`}
            onClick={() => handleNavigation('support')}
          >
            <Headphones className="nav-icon" />
            <span>Support</span>
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
            </button>
          )}
          
          {/* Desktop User Menu */}
          {user && (
            <div className="user-menu-container">
              <button 
                className={`user-toggle ${isUserMenuOpen ? 'active' : ''}`}
                onClick={toggleUserMenu}
              >
                <div className="user-avatar">
                  <User className="user-icon" />
                  <div className="user-status"></div>
                </div>
                <div className="user-info">
                  <span className="user-email">{user.email}</span>
                  <span className="user-status-text">Online</span>
                </div>
              </button>
              
              <div className={`user-dropdown ${isUserMenuOpen ? 'open' : ''}`}>
                <div className="dropdown-header">
                  <div className="user-avatar large">
                    <User className="user-icon" />
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.displayName || user.email}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <Settings className="dropdown-icon" />
                  <span>Settings</span>
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut className="dropdown-icon" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
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
              <span>Home</span>
            </button>
            <button 
              className={`mobile-nav-link ${currentPage === 'support' ? 'active' : ''}`}
              onClick={() => handleNavigation('support')}
            >
              <Headphones className="nav-icon" />
              <span>Support</span>
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
              </button>
            )}
            
            {user && (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <User className="user-icon" />
                  <span>{user.email}</span>
                </div>
                <button className="mobile-logout" onClick={handleLogout}>
                  <LogOut className="logout-icon" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && <div className="mobile-nav-overlay" onClick={toggleMobileMenu}></div>}
      {isUserMenuOpen && <div className="user-menu-overlay" onClick={toggleUserMenu}></div>}
    </nav>
  )
}

export default Navbar