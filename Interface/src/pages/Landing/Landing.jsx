import { useState } from 'react'
import { Users, Headphones, Sparkles, ArrowRight, Shield, Zap, Sun, Moon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import AgentLogin from '../../components/AgentLogin/AgentLogin'
import CustomerLogin from '../../components/CustomerLogin/CustomerLogin'
import Navbar from '../../components/Navbar/Navbar'
import './Landing.css'

function Landing({ onAgentLogin }) {
  const navigate = useNavigate()
  const { isDarkTheme } = useTheme()
  const [selectedRole, setSelectedRole] = useState('customer') // Default to customer
  const [isToggling, setIsToggling] = useState(false)
  const [showAgentLogin, setShowAgentLogin] = useState(false)
  const [showCustomerLogin, setShowCustomerLogin] = useState(false)
  
  const handleToggle = () => {
    setIsToggling(true)
    setSelectedRole(selectedRole === 'customer' ? 'agent' : 'customer')
    setTimeout(() => setIsToggling(false), 300)
  }
  
  const handleRoleSelect = (role) => {
    // If agent role is selected, show login modal
    if (role === 'agent') {
      setShowAgentLogin(true)
    } else {
      setShowCustomerLogin(true)
    }
  }
  
  const handleAgentLoginSuccess = (user) => {
    // Handle successful agent login
    console.log('Agent logged in:', user)
    setShowAgentLogin(false)
    
    // Call the parent App component's handler to update its state
    if (onAgentLogin) {
      onAgentLogin(user)
    }
      // Navigate to agent dashboard after state is updated
    setTimeout(() => {
      navigate('/agent-dashboard')
    }, 100) // Small delay to ensure state update completes
  }

  const handleCustomerLogin = async ({ customerNo, password }) => {
    try {
      const response = await fetch('http://localhost:3001/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerNo, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      // Optionally store customer info in state/localStorage here
      setShowCustomerLogin(false);
      navigate('/support');
    } catch (err) {
      alert(err.message);
    }
  }

  const handleCloseAgentLogin = () => {
    setShowAgentLogin(false)
  }

  const handleCloseCustomerLogin = () => {
    setShowCustomerLogin(false)
  }
  
  return (
    <div className={`landing-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <Navbar currentPage="home" showThemeToggle={true} showTagline={true} hideUserInfo={true} />
      
      {/* Main content */}
      <div className="main-content">
        <main className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to the
              <span className="gradient-text"> Future of Support</span>
            </h1>            
            <p className="hero-subtitle">
              Choose your role and experience support like never before
            </p>

            {/* Role Toggle Switch */}
            <div className="role-toggle-container">
              <span className={`toggle-label ${selectedRole === 'customer' ? 'active' : ''}`}>
                Customer
              </span>
              <div className="toggle-switch" onClick={handleToggle}>
                <div className={`toggle-slider ${selectedRole === 'agent' ? 'agent-mode' : 'customer-mode'}`}>
                  <div className="toggle-icon">
                    {selectedRole === 'customer' ? <Users size={16} /> : <Headphones size={16} />}
                  </div>
                </div>
              </div>
              <span className={`toggle-label ${selectedRole === 'agent' ? 'active' : ''}`}>
                Support Agent
              </span>
            </div>

            {/* Dynamic Role Display */}
            <div className={`role-display ${isToggling ? 'transitioning' : ''}`}>
              {selectedRole === 'customer' ? (
                <div className="role-card active-role" onClick={() => handleRoleSelect('customer')}>
                  <div className="role-icon-container">
                    <Users className="role-icon" />
                    <div className="icon-glow" />
                  </div>
                  <h3 className="role-title">Customer Portal</h3>                  <p className="role-description">
                    Get instant help, track tickets, and access our knowledge base
                  </p>
                  {/* <div className="role-features">
                    <span className="feature-tag">24/7 Support</span>
                    <span className="feature-tag">Live Chat</span>
                    <span className="feature-tag">AI Assistant</span>
                  </div> */}
                  <div className="role-action">
                    <span>Get Support</span>
                    <ArrowRight className="arrow-icon" />
                  </div>
                </div>
              ) : (
                <div className="role-card active-role" onClick={() => handleRoleSelect('agent')}>
                  <div className="role-icon-container">
                    <Headphones className="role-icon" />
                    <div className="icon-glow" />
                  </div>
                  <h3 className="role-title">Agent Portal</h3>
                  <p className="role-description">
                    Access your dashboard, manage tickets, and help customers
                  </p>
                  <div className="role-features">
                    <span className="feature-tag">Admin Panel</span>
                    <span className="feature-tag">Analytics</span>
                    <span className="feature-tag">Team Tools</span>
                  </div>
                  <div className="role-action">
                    <span>Agent Portal</span>
                    <ArrowRight className="arrow-icon" />
                  </div>
                </div>
              )}            
              </div>          
          </div>
        </main>
      </div>

      {/* Agent Login Modal */}
      <AgentLogin 
        isOpen={showAgentLogin}        
        onClose={handleCloseAgentLogin}        
        onLoginSuccess={handleAgentLoginSuccess}
      />
      {/* Customer Login Modal */}
      <CustomerLogin
        isOpen={showCustomerLogin}
        onClose={handleCloseCustomerLogin}
        onLogin={handleCustomerLogin}
        theme={isDarkTheme ? 'dark' : 'light'}
      />
    </div>
  )
}

export default Landing
