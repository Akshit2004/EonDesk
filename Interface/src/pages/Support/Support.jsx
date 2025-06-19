import { useState } from 'react'
import { 
  ArrowLeft, Ticket, Search, Plus, FileText, Clock, User, Mail, Phone, ArrowRight, 
  CheckCircle, ChevronLeft, ChevronRight, Headphones, MessageSquare, Settings, 
  CreditCard, Bug, Lightbulb, AlertCircle, Star, Shield, Zap, HelpCircle,
  BookOpen, Target, Layers, Globe, Award, TrendingUp
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import './Support.css'

function Support() {
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState(null)

  const handleGoBack = () => {
    navigate('/')
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
  }
  return (
    <div className="support-container">
      <Navbar currentPage="support" showThemeToggle={true} showTagline={false} />
      
      <div className="support-content">        <div className="support-header">
          <button className="back-button" onClick={handleGoBack}>
            <ArrowLeft className="back-icon" />
            <span>Back to Home</span>
          </button>
          <div className="header-content">
            <div className="header-icon-wrapper">
              <Headphones className="header-main-icon" />
              <div className="header-icon-glow" />
            </div>
            <h1 className="support-title">Customer Support</h1>
            <p className="support-subtitle">How can we help you today?</p>
          </div>
        </div>

      {!selectedOption ? (
        <div className="support-options">
          <div className="options-grid">
            <div 
              className="support-card track-ticket"
              onClick={() => handleOptionSelect('track')}
            >
              <div className="card-icon">
                <Search className="icon" />
                <div className="icon-glow" />
              </div>
              <h3 className="card-title">Track a Ticket</h3>
              <p className="card-description">
                Check the status of your existing support request
              </p>
              <div className="card-features">
                <span className="feature">Real-time Updates</span>
                <span className="feature">Message History</span>
                <span className="feature">Status Tracking</span>
              </div>
              <div className="card-action">
                <span>Track Now</span>
                <ArrowRight className="arrow-icon" />
              </div>
            </div>

            <div 
              className="support-card create-ticket"
              onClick={() => handleOptionSelect('create')}
            >
              <div className="card-icon">
                <Plus className="icon" />
                <div className="icon-glow" />
              </div>
              <h3 className="card-title">Create a Ticket</h3>
              <p className="card-description">
                Submit a new support request and get help from our team
              </p>
              <div className="card-features">
                <span className="feature">Priority Support</span>
                <span className="feature">File Attachments</span>
                <span className="feature">Expert Assistance</span>
              </div>
              <div className="card-action">
                <span>Create Now</span>
                <ArrowRight className="arrow-icon" />
              </div>
            </div>
          </div>

          <div className="quick-stats">            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Clock className="stat-icon" />
                <div className="stat-icon-bg" />
              </div>
              <div className="stat-content">
                <span className="stat-number">2min</span>
                <span className="stat-label">Avg Response Time</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Target className="stat-icon" />
                <div className="stat-icon-bg" />
              </div>
              <div className="stat-content">
                <span className="stat-number">98%</span>
                <span className="stat-label">Resolution Rate</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Shield className="stat-icon" />
                <div className="stat-icon-bg" />
              </div>
              <div className="stat-content">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support Available</span>
              </div>
            </div>
          </div>
        </div>      ) : selectedOption === 'track' ? (
        <TrackTicket onBack={() => setSelectedOption(null)} />
      ) : (
        <CreateTicket onBack={() => setSelectedOption(null)} />
      )}
      </div>
    </div>
  )
}

function TrackTicket({ onBack }) {
  const [ticketId, setTicketId] = useState('')
  const [email, setEmail] = useState('')

  const handleTrack = (e) => {
    e.preventDefault()
    // Handle ticket tracking logic here
    alert(`Tracking ticket ${ticketId} for ${email}`)
  }

  return (    <div className="ticket-form-container">
      <div className="form-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft className="back-icon" />
        </button>
        <div className="form-header-content">
          <div className="form-header-icon">
            <Search className="header-form-icon" />
            <div className="header-form-glow" />
          </div>
          <div>
            <h2 className="form-title">Track Your Ticket</h2>
            <p className="form-subtitle">Enter your ticket details to check status</p>
          </div>
        </div>
      </div>

      <form className="ticket-form" onSubmit={handleTrack}>
        <div className="form-group">
          <label htmlFor="ticketId" className="form-label">
            <Ticket className="label-icon" />
            Ticket ID
          </label>
          <input
            type="text"
            id="ticketId"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="Enter your ticket ID (e.g., TKT-12345)"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            <Mail className="label-icon" />
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="form-input"
            required
          />
        </div>

        <button type="submit" className="submit-btn track-btn">
          <Search className="btn-icon" />
          Track Ticket
        </button>
      </form>
    </div>
  )
}

function CreateTicket({ onBack }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    priority: '',
    category: '',
    description: ''
  })

  const totalSteps = 3

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle ticket creation logic here
    alert(`Ticket created successfully for ${formData.name}`)
  }
  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.email
      case 2:
        return formData.category && formData.priority && formData.subject
      case 3:
        return formData.description
      default:
        return false
    }
  }

  const isFieldIncomplete = (fieldName) => {
    return !formData[fieldName]
  }

  const getFieldClassName = (fieldName, baseClassName = 'form-input') => {
    return `${baseClassName} ${isFieldIncomplete(fieldName) ? 'field-incomplete' : ''}`
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3 className="step-title">Personal Information</h3>
              <p className="step-description">Let's start with your basic contact details</p>
            </div>
              <div className="form-group">
              <label htmlFor="name" className="form-label">
                <User className="label-icon" />
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={getFieldClassName('name')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail className="label-icon" />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={getFieldClassName('email')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                <Phone className="label-icon" />
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="form-input"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3 className="step-title">Issue Details</h3>
              <p className="step-description">Help us categorize and prioritize your request</p>
            </div>            <div className="form-group">
              <label htmlFor="category" className="form-label">
                <Layers className="label-icon" />
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={getFieldClassName('category', 'form-select')}
              >
                <option value="">Select a category</option>
                <option value="general">
                  🛠️ General Support
                </option>
                <option value="technical">
                  ⚙️ Technical Issue
                </option>
                <option value="billing">
                  💳 Billing & Payment
                </option>
                <option value="account">
                  👤 Account Management
                </option>
                <option value="feature">
                  💡 Feature Request
                </option>
                <option value="bug">
                  🐛 Bug Report
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                <AlertCircle className="label-icon" />
                Priority Level *
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={getFieldClassName('priority', 'form-select')}
              >
                <option value="">Select priority</option>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subject" className="form-label">
                <FileText className="label-icon" />
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Brief description of your issue"
                className={getFieldClassName('subject')}
                required
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3 className="step-title">Describe Your Issue</h3>
              <p className="step-description">Provide detailed information to help us resolve your issue faster</p>
            </div>            <div className="form-group">
              <label htmlFor="description" className="form-label">
                <MessageSquare className="label-icon" />
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide detailed information about your issue..."
                className={getFieldClassName('description', 'form-textarea')}
                rows="8"
                required
              />
              <div className="textarea-helper">
                <HelpCircle className="helper-icon" />
                <span className="helper-text">
                  Include steps to reproduce, error messages, or any other relevant details
                </span>
              </div>
            </div><div className="form-summary">
              <div className="summary-header">
                <BookOpen className="summary-icon" />
                <h4 className="summary-title">Summary</h4>
              </div>
              <div className="summary-content">
                <div className="summary-item">
                  <User className="summary-item-icon" />
                  <span className="summary-label">Name:</span>
                  <span className="summary-value">{formData.name}</span>
                </div>
                <div className="summary-item">
                  <Mail className="summary-item-icon" />
                  <span className="summary-label">Email:</span>
                  <span className="summary-value">{formData.email}</span>
                </div>
                <div className="summary-item">
                  <Layers className="summary-item-icon" />
                  <span className="summary-label">Category:</span>
                  <span className="summary-value">{formData.category}</span>
                </div>
                <div className="summary-item">
                  <AlertCircle className="summary-item-icon" />
                  <span className="summary-label">Priority:</span>
                  <span className="summary-value">{formData.priority}</span>
                </div>
                <div className="summary-item">
                  <FileText className="summary-item-icon" />
                  <span className="summary-label">Subject:</span>
                  <span className="summary-value">{formData.subject}</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (    <div className="ticket-form-container">
      <div className="form-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft className="back-icon" />
        </button>
        <div className="form-header-content">
          <div className="form-header-icon">
            <Plus className="header-form-icon" />
            <div className="header-form-glow" />
          </div>
          <div>
            <h2 className="form-title">Create New Ticket</h2>
            <p className="form-subtitle">Tell us about your issue and we'll help you resolve it</p>
          </div>
        </div>
      </div>      <div className="progress-bar">
        <div className="progress-steps">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > step ? (
                  <CheckCircle className="step-icon" />
                ) : (
                  <span className="step-number">{step}</span>
                )}
              </div>
              <div className="step-info">
                <span className="step-label">
                  {step === 1 ? 'Personal Info' : step === 2 ? 'Issue Details' : 'Description'}
                </span>
                {currentStep === step && (
                  <span className="step-description">
                    {step === 1 ? 'Your contact details' : step === 2 ? 'Category & priority' : 'Detailed description'}
                  </span>
                )}
              </div>
              {step === 1 && <User className="step-type-icon" />}
              {step === 2 && <Settings className="step-type-icon" />}
              {step === 3 && <MessageSquare className="step-type-icon" />}
            </div>
          ))}
        </div>
        <div className="progress-line">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      <form className="ticket-form progressive-form" onSubmit={handleSubmit}>
        {renderStepContent()}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button 
              type="button" 
              onClick={handlePrevious}
              className="nav-btn prev-btn"
            >
              <ChevronLeft className="btn-icon" />
              Previous
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button 
              type="button" 
              onClick={handleNext}
              className={`nav-btn next-btn ${!isStepValid(currentStep) ? 'disabled' : ''}`}
              disabled={!isStepValid(currentStep)}
            >
              Next
              <ChevronRight className="btn-icon" />
            </button>
          ) : (
            <button 
              type="submit" 
              className={`submit-btn create-btn ${!isStepValid(currentStep) ? 'disabled' : ''}`}
              disabled={!isStepValid(currentStep)}
            >
              <Plus className="btn-icon" />
              Create Ticket
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default Support
