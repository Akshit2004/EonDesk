import React from 'react';
import { FaTachometerAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import './CustomerSidebar.css';

const CustomerSidebar = ({ activeTab, onTabChange, onLogout, customerName }) => {
  return (
    <aside className="customer-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-avatar">
          <FaUser />
        </div>
        <div className="sidebar-user">
          <span className="sidebar-user-name">{customerName}</span>
          <span className="sidebar-user-role">Customer Portal</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <FaTachometerAlt className="sidebar-link-icon" /> Dashboard
        </button>
        <button className="sidebar-link logout-link" onClick={onLogout}>
          <FaSignOutAlt className="sidebar-link-icon" /> Sign Out
        </button>
      </nav>
    </aside>
  );
};

export default CustomerSidebar;
