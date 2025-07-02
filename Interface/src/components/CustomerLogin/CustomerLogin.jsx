import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaLock } from 'react-icons/fa';
import './CustomerLogin.css';

const CustomerLogin = ({ onLogin }) => {
  const [customer_no, setcustomer_no] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer_no || !password) {
      setError('Please enter both Customer No. and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_no, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      if (onLogin) onLogin(data.user);
      setcustomer_no('');
      setPassword('');
      // Store customer number in localStorage on successful login
      localStorage.setItem('customer_no', customer_no);
      navigate('/support');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-login-bg-animated">
      <div className="customer-login-glass-card">
        <div className="customer-login-card-header">
          <img src="/eon_logo_trans.png" alt="Eon Logo" className="customer-login-logo" />
          <h2 className="customer-login-title">Welcome Back</h2>
          <p className="customer-login-subtitle">Sign in to your customer account</p>
        </div>
        <form onSubmit={handleSubmit} className="customer-login-form">
          <div className="customer-login-input-group">
            <FaUserCircle className="customer-login-icon" />
            <input
              type="text"
              value={customer_no}
              onChange={e => setcustomer_no(e.target.value)}
              placeholder="Customer Number"
              autoComplete="username"
              disabled={loading}
              className="customer-login-input"
            />
          </div>
          <div className="customer-login-input-group">
            <FaLock className="customer-login-icon" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              disabled={loading}
              className="customer-login-input"
            />
          </div>
          {error && <div className="customer-login-error">{error}</div>}
          <button type="submit" disabled={loading} className="customer-login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerLogin;
