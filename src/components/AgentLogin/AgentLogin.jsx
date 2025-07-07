import { useState } from 'react'
import { Eye, EyeOff, Lock, Loader2, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePostgresAuth } from '../../contexts/PostgresAuthContext'
import './AgentLogin.css'

function AgentLogin({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = usePostgresAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate input
      if (!formData.email.trim() || !formData.password.trim()) {
        throw new Error('Please fill in all fields')
      }

      // Authenticate with backend
      const response = await fetch('https://eondesk.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store user in PostgresAuthContext
      login(data.user)

      // Call success callback with user data
      if (onLoginSuccess) {
        onLoginSuccess(data.user)
      }

      // Clear form
      setFormData({ email: '', password: '' })
      setError('')
      setShowPassword(false)
      // Redirect to agent dashboard
      navigate('/agent-dashboard')
    } catch (err) {
      setError(err.message)
      console.error('Agent login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-bg">
      <div className="login-page-center">
        <div className="login-modal login-page-form">
          <div className="login-header">
            <div className="header-content">
              <div className="header-icon">
                <img src="/eon_logo_trans.png" alt="Eon Logo" style={{ height: 48, width: 48, objectFit: 'contain' }} />
              </div>
              <div className="header-text">
                <p className="login-subtitle">Professional Agent Portal</p>
              </div>
            </div>
          </div>

          <div className="login-body">
            <form className="login-form" onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  <div className="error-icon">⚠</div>
                  <span>{error}</span>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <User size={16} />
                  Email Address
                </label>
                <div className="input-wrapper">
                  <div className="input-container">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="agent@company.com"
                      required
                      disabled={loading}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <Lock size={16} />
                  Password
                </label>
                <div className="input-wrapper">
                  <div className="input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your secure password"
                      required
                      disabled={loading}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner" size={18} />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <div className="footer-links">
                <a
                  href="mailto:admin@company.com"
                  className="link-button"
                  style={{ textDecoration: 'none' }}
                >
                  Contact Admin
                </a>
              </div>
              <p className="footer-text">
                Secure authentication powered by PostgreSQL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentLogin
