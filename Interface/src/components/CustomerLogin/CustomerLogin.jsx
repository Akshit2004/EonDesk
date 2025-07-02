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
    <div className="customer-login-page-bg">
      <div className="customer-login-bg-graphic">
        <div className="customer-login-bg-slide slide-1" />
        <div className="customer-login-bg-slide slide-2" />
        <div className="customer-login-bg-slide slide-3" />
      </div>
      <div className="customer-login-page-center">
        <div className="customer-login-modal customer-login-page-form">
          <h2 className="customer-login-title">Customer Login</h2>
          <form onSubmit={handleSubmit}>
            <label className="customer-login-label">
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
            </label>
            <label className="customer-login-label">
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
            </label>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="customer-login-btn">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
