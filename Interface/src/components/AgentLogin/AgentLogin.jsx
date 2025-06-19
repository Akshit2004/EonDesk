import { useState } from 'react'
import { Eye, EyeOff, Lock, Loader2, Shield, User } from 'lucide-react'
import { signInWithEmail, getAuthErrorMessage } from '../../firebase/auth'
import './AgentLogin.css'

function AgentLogin({ isOpen, onClose, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      // Sign in with Firebase
      const user = await signInWithEmail(formData.email, formData.password)
      
      // Call success callback with user data
      onLoginSuccess(user)
      onClose()
      setFormData({ email: '', password: '' })
    } catch (err) {
      // Use Firebase-specific error messages
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ email: '', password: '' })
    setError('')
    setShowPassword(false)
    onClose()
  }

  if (!isOpen) return null
  return (
    <div className="login-overlay" onClick={handleClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>        <div className="login-header">
          <div className="header-content">
            <div className="header-icon">
              <Shield size={32} />
            </div>
            <div className="header-text">
              <h2 className="login-title">Agent Portal</h2>
              <p className="login-subtitle">Secure Access for Support Agents</p>
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
            )}            <div className="form-group">
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
            </div>            <div className="form-group">
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
                  <Shield size={18} />
                  <span>Access Agent Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <div className="footer-links">
              <button className="link-button">Contact Admin</button>
            </div>
            <p className="footer-text">
              Secure authentication powered by Firebase
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentLogin
