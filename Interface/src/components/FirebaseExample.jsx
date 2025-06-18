import React, { useState } from 'react';
import { signIn, signUp, logout } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const FirebaseExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { user, error } = await signUp(email, password);
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { user, error } = await signIn(email, password);
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await logout();
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  if (user) {
    return (
      <div className="firebase-example">
        <h2>Welcome, {user.email}!</h2>
        <p>You are successfully logged in.</p>
        <button onClick={handleLogout} disabled={loading}>
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    );
  }

  return (
    <div className="firebase-example">
      <h2>Firebase Authentication Example</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div>
          <button 
            type="button" 
            onClick={handleSignIn} 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <button 
            type="button" 
            onClick={handleSignUp} 
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FirebaseExample;
