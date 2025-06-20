import React from 'react';
import { FaTachometerAlt, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import './AgentSidebar.css';

const AgentSidebar = ({ onLogout, activeTab, onTabChange }) => {
  return (
    <aside className="agent-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-avatar">
          {/* You can use a user avatar here if available */}
          <span style={{ fontSize: 48 }} role="img" aria-label="avatar">👤</span>
        </div>
        <div className="sidebar-user">
          <span className="sidebar-user-role">Support Agent</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <button 
          className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <FaTachometerAlt className="sidebar-link-icon" /> Dashboard
        </button>
        <button 
          className={`sidebar-link ${activeTab === 'emails' ? 'active' : ''}`}
          onClick={() => onTabChange('emails')}
        >
          <FaEnvelope className="sidebar-link-icon" /> Emails
        </button>
        <button className="sidebar-link logout-link" onClick={onLogout}>
          <FaSignOutAlt className="sidebar-link-icon" /> Logout
        </button>
      </nav>
    </aside>
  );
};

export default AgentSidebar;
