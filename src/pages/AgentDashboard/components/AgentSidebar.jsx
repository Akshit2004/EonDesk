import React from 'react';
import { FaTachometerAlt, FaEnvelope, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import './AgentSidebar.css';

const AgentSidebar = ({ onLogout, activeTab, onTabChange }) => {
  return (
    <aside className="agent-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-avatar">
          <FaShieldAlt />
        </div>
        <div className="sidebar-user">
          <span className="sidebar-user-name">Agent Portal</span>
          <span className="sidebar-user-role">Support Dashboard</span>
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
          <FaEnvelope className="sidebar-link-icon" /> Email Management
        </button>
        <button className="sidebar-link logout-link" onClick={onLogout}>
          <FaSignOutAlt className="sidebar-link-icon" /> Sign Out
        </button>
      </nav>
    </aside>
  );
};

export default AgentSidebar;
