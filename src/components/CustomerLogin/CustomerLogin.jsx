import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaLock, FaShieldAlt } from 'react-icons/fa';
import './CustomerLogin.css';
import { fetchWithFallback } from '../../services/apiBase';

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
      // Authenticate with backend (Node or PHP)
      const response = await fetchWithFallback('/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_no, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      if (onLogin) onLogin(data.user || data.customer);
      setcustomer_no('');
      setPassword('');
      // Store customer number in localStorage on successful login
      localStorage.setItem('customer_no', customer_no);
      navigate('/customer-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-login-page-bg">
      <div className="customer-login-page-center">
        <div className="customer-login-modal customer-login-page-form">
          <div className="customer-login-branding">
            <div className="customer-login-logo">
              <img src="/eon_logo_trans.png" alt="Eon Logo" className="customer-login-eon-logo" />
            </div>
            <div className="customer-login-subtitle">Professional Support Portal</div>
          </div>
          
          <h2 className="customer-login-title">Customer Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="customer-login-input-group">
              <FaUserCircle className="customer-login-icon" />
              <input
                type="text"
                value={customer_no}
                onChange={e => setcustomer_no(e.target.value)}
                placeholder="Enter your customer number"
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
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="customer-login-input"
              />
            </div>
            
            {error && <div className="error">{error}</div>}
            
            <button type="submit" disabled={loading} className="customer-login-btn">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="customer-login-security-notice">
            <div className="customer-login-security-text">
              <FaShieldAlt className="customer-login-security-icon" />
              Your connection is secure and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
