import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color, description, trend, onClick, clickable, active }) => {
  return (
    <div
      className={`stat-card stat-card-${color} ${clickable ? 'stat-card-clickable' : ''} ${active ? 'stat-card-active' : ''}`}
      onClick={clickable ? onClick : undefined}
      style={clickable ? { cursor: 'pointer' } : {}}
    >
      <div className="stat-card-header">
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          {trend && <div className="stat-trend">{trend}</div>}
          {description && <p className="stat-description">{description}</p>}
        </div>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
};

export default StatCard;
