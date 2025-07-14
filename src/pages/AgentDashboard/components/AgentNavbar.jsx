import React, { useState } from 'react';
import { FaBars, FaTimes, FaShieldAlt } from 'react-icons/fa';
import './AgentNavbar.css';

const AgentNavbar = ({ agentName, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="agent-navbar">
      <div className="navbar-container">
        {/* Left side - Logo and brand */}
        <div className="navbar-left">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <FaTimes /> : <FaBars />}
          </button>
          <div className="navbar-brand">
            <div className="brand-logo">
              {/* Simple vector icon instead of logo image */}
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="#4f46e5" strokeWidth="3" fill="#f3f4f6" />
                <path d="M12 28C14 24 26 24 28 28" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="16" cy="17" r="2.5" fill="#4f46e5" />
                <circle cx="24" cy="17" r="2.5" fill="#4f46e5" />
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">ServiceBridge</span>
              <span className="brand-subtitle">Agent Dashboard</span>
            </div>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="navbar-right">
          <div className="navbar-actions">
            <div className="user-menu-container">
              <button 
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  <FaShieldAlt />
                </div>
                <span className="user-name">{agentName}</span>
              </button>
              
              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    <div className="user-avatar-large">
                      <FaShieldAlt />
                    </div>
                    <div className="user-info">
                      <span className="user-name-large">{agentName}</span>
                      <span className="user-role">Support Agent</span>
                    </div>
                  </div>
                  <div className="user-menu-actions">
                    <button className="user-menu-item" onClick={onLogout}>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Menu</span>
              <button 
                className="mobile-menu-close"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="mobile-menu-content">
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  <FaShieldAlt />
                </div>
                <span className="mobile-user-name">{agentName}</span>
              </div>
              <button className="mobile-menu-item" onClick={onLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AgentNavbar;
