import React, { useState } from 'react';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';
import './CustomerNavbar.css';

const CustomerNavbar = ({ customerName, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="customer-navbar">
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
            <div className="brand-logo">EON</div>
            <div className="brand-text">
              <span className="brand-name">Support Portal</span>
              <span className="brand-subtitle">Customer Dashboard</span>
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
                  <FaUser />
                </div>
                <span className="user-name">{customerName}</span>
              </button>
              
              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    <div className="user-avatar-large">
                      <FaUser />
                    </div>
                    <div className="user-info">
                      <span className="user-name-large">{customerName}</span>
                      <span className="user-role">Customer</span>
                    </div>
                  </div>
                  <div className="user-menu-divider"></div>
                  <button className="user-menu-item" onClick={onLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {(showUserMenu || showMobileMenu) && (
        <div 
          className="mobile-overlay"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </nav>
  );
};

export default CustomerNavbar;
