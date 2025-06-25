import React, { useState } from 'react';
import './CustomerLogin.css';

const CustomerLogin = ({ isOpen, onClose, onLogin, theme }) => {
  const [customer_no, setcustomer_no] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer_no || !password) {
      setError('Please enter both Customer No. and password.');
      return;
    }
    setError('');
    onLogin({ customer_no, password });
  };

  if (!isOpen) return null;

  // Determine theme class
  const themeClass = theme === 'dark' ? 'dark' : 'light';

  return (
    <div className="customer-login-modal-overlay">
      <div className={`customer-login-modal ${themeClass}`}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Customer Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Customer No.
            <input
              type="text"
              value={customer_no}
              onChange={e => setcustomer_no(e.target.value)}
              placeholder="Enter your customer number"
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default CustomerLogin;
