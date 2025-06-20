import React from 'react';
import { FaTachometerAlt, FaTicketAlt, FaSignOutAlt } from 'react-icons/fa';
import './AgentSidebar.css';

const AgentSidebar = ({ onLogout }) => {
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
        <a href="#dashboard" className="sidebar-link active">
          <FaTachometerAlt className="sidebar-link-icon" /> Dashboard
        </a>
        <a href="#tickets" className="sidebar-link">
          <FaTicketAlt className="sidebar-link-icon" /> Tickets
        </a>
        <button className="sidebar-link logout-link" onClick={onLogout}>
          <FaSignOutAlt className="sidebar-link-icon" /> Logout
        </button>
      </nav>
    </aside>
  );
};

export default AgentSidebar;
