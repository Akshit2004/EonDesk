import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color, description }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          <p className="stat-description">{description}</p>
        </div>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
};

export default StatCard;
