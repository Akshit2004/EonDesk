import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      navigate('/support');
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
                disabled={loading}
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
                disabled={loading}
              />
            </label>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
