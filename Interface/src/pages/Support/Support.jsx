import { useState } from 'react'
import { 
  ArrowLeft, Ticket, Search, Plus, FileText, Clock, User, Mail, Phone, ArrowRight, 
  CheckCircle, ChevronLeft, ChevronRight, Headphones, MessageSquare, Settings, 
  AlertCircle, Shield,  HelpCircle,
  BookOpen, Target, Layers
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import { createTicket, getTicketByIdAndEmail } from '../../firebase/tickets'
import { TicketThread, CreateTicketForm } from '../../components/TicketDashboard'
import './Support.css'

function Support() {
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedTicketId, setSelectedTicketId] = useState(null)

  const handleGoBack = () => {
    navigate('/')
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
  }

  const handleTicketFound = (ticketData, userInfo) => {
    setCurrentUser(userInfo)
    setSelectedTicketId(ticketData.id)
  }

  const handleTicketCreated = (result) => {
    console.log('Ticket created successfully:', result.ticketId)
    // Optionally switch to track mode or show success message
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
        selectedTicketId ? (
          <TicketThreadWrapper 
            ticketId={selectedTicketId}
            currentUser={currentUser}
            onBack={() => {
              setSelectedTicketId(null)
              setSelectedOption(null)
            }}
          />
        ) : (
          <TicketFinder 
            onBack={() => setSelectedOption(null)}
            onTicketFound={handleTicketFound}
          />
        )
      ) : selectedOption === 'create' ? (
        <EnhancedCreateTicket 
          onTicketCreated={handleTicketCreated}
          onBack={() => setSelectedOption(null)}
        />
      ) : null}
      </div>
    </div>
  )
}

function TicketFinder({ onBack, onTicketFound }) {
  const [ticketId, setTicketId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await getTicketByIdAndEmail(ticketId.trim(), email.trim())
      
      if (result.success) {
        const userInfo = {
          email: email.trim(),
          name: result.ticket.customer_name || email.trim()
        }
        onTicketFound(result.ticket, userInfo)
      } else {
        setError(result.error || 'Ticket not found. Please check your ticket ID and email.')
      }
    } catch (error) {
      setError('An error occurred while searching for the ticket. Please try again.')
      console.error('Search ticket error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ticket-form-container">
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
            <h2 className="form-title">Find Your Ticket</h2>
            <p className="form-subtitle">Enter your ticket ID and email to access your support conversation</p>
          </div>
        </div>
      </div>

      <form className="ticket-form" onSubmit={handleSearch}>
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
            placeholder="Enter your ticket ID (e.g., TKT-12345-ABCDE)"
            className="form-input"
            required
          />
          <div className="input-helper">
            <HelpCircle className="helper-icon" />
            <span className="helper-text">
              You can find your ticket ID in the confirmation email sent when you created the ticket
            </span>
          </div>
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
            placeholder="Enter the email address used to create the ticket"
            className="form-input"
            required
          />
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="submit-btn track-btn" disabled={loading}>
          <Search className="btn-icon" />
          {loading ? 'Searching...' : 'Find My Ticket'}
        </button>

        <div className="form-note">
          <div className="note-content">
            <div className="note-icon">
              <HelpCircle />
            </div>
            <div className="note-text">
              <h4>Need help finding your ticket?</h4>
              <ul>
                <li>Check your email for the ticket confirmation</li>
                <li>Ticket IDs start with "TKT-" followed by numbers and letters</li>
                <li>Make sure to use the same email address you used when creating the ticket</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function CreateTicket({ onBack }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdTicketId, setCreatedTicketId] = useState('')
  const [error, setError] = useState('')
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
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await createTicket(formData)
      
      if (result.success) {
        setSuccess(true)
        setCreatedTicketId(result.ticketId)
      } else {
        setError(result.error || 'Failed to create ticket')
      }
    } catch (error) {
      setError('An error occurred while creating the ticket')
      console.error('Create ticket error:', error)
    } finally {
      setLoading(false)
    }
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
    }  }

  return (
    <div className="ticket-form-container">
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
      </div>

      {success ? (
        <div className="success-container">
          <div className="success-icon-wrapper">
            <CheckCircle className="success-icon" />
          </div>
          <h3 className="success-title">Ticket Created Successfully!</h3>
          <p className="success-message">
            Your support ticket has been created. Here are your ticket details:
          </p>
          <div className="success-details">
            <div className="success-detail">
              <strong>Ticket ID:</strong> {createdTicketId}
            </div>
            <div className="success-detail">
              <strong>Email:</strong> {formData.email}
            </div>
            <div className="success-detail">
              <strong>Subject:</strong> {formData.subject}
            </div>
          </div>
          <p className="success-note">
            Please save your ticket ID for future reference. You can track your ticket status using the ticket ID and your email address.
          </p>
          <div className="success-actions">
            <button 
              className="success-btn track-btn"
              onClick={() => {
                // Reset and go back to track with the new ticket ID
                onBack()
              }}
            >
              <Search className="btn-icon" />
              Track This Ticket
            </button>
            <button 
              className="success-btn new-btn"
              onClick={() => {
                setSuccess(false)
                setCreatedTicketId('')
                setCurrentStep(1)
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  subject: '',
                  priority: '',
                  category: '',
                  description: ''
                })
              }}
            >
              <Plus className="btn-icon" />
              Create Another Ticket
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          <div className="progress-bar">
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
            </button>          ) : (
            <button 
              type="submit" 
              className={`submit-btn create-btn ${!isStepValid(currentStep) || loading ? 'disabled' : ''}`}
              disabled={!isStepValid(currentStep) || loading}
            >
              <Plus className="btn-icon" />
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          )}
        </div>
      </form>
        </>
      )}
    </div>
  )
}

// Enhanced CreateTicketForm wrapper that handles user setup with progressive form
function EnhancedCreateTicket({ onBack, onTicketCreated }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // User info
    name: '',
    email: '',
    // Ticket details
    category: 'general',
    priority: 'medium',
    title: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const steps = [
    {
      number: 1,
      title: 'Contact Information',
      description: 'Tell us who you are',
      icon: User,
      fields: ['name', 'email']
    },
    {
      number: 2,
      title: 'Issue Details',
      description: 'Describe your problem',
      icon: FileText,
      fields: ['category', 'priority', 'title']
    },
    {
      number: 3,
      title: 'Additional Information',
      description: 'Provide more details',
      icon: MessageSquare,
      fields: ['description']
    },
    {
      number: 4,
      title: 'Review & Submit',
      description: 'Confirm your ticket details',
      icon: CheckCircle,
      fields: []
    }
  ]

  const categories = [
    { value: 'general', label: 'General Support' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' }
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const validateStep = (step) => {
    const stepFields = steps[step - 1].fields
    for (const field of stepFields) {
      if (!formData[field] || formData[field].trim() === '') {
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    } else {
      setError('Please fill in all required fields before continuing.')
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const ticketData = {
        title: formData.title.trim(),
        category: formData.category,
        priority: formData.priority,
        description: formData.description.trim(),
        email: formData.email.trim(),
        name: formData.name.trim()
      }

      const result = await createTicket(ticketData)
      
      if (result.success) {
        if (onTicketCreated) {
          onTicketCreated(result)
        }
      } else {
        setError(result.error || 'Failed to create ticket')
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      setError('Failed to create ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100
  }

  const getCurrentStepData = () => steps[currentStep - 1]

  return (
    <div className="ticket-form-container">
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
            <h2 className="form-title">Create Support Ticket</h2>
            <p className="form-subtitle">Step {currentStep} of {steps.length}</p>
          </div>
        </div>
      </div>

      <div className="progressive-form">
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-steps">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              
              return (
                <div 
                  key={step.number}
                  className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="step-circle">
                    {isCompleted ? (
                      <CheckCircle className="step-icon" />
                    ) : (
                      <span className="step-number">{step.number}</span>
                    )}
                  </div>
                  <div className="step-info">
                    <span className="step-label">{step.title}</span>
                    {(isActive || isCompleted) && (
                      <span className="step-description">{step.description}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="progress-line">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="step-content">
          <div className="step-header">
            <h3 className="step-title">{getCurrentStepData().title}</h3>
            <p className="step-description">{getCurrentStepData().description}</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              {error}
            </div>
          )}

          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="form-fields">
              <div className="form-group">
                <label className="form-label">
                  <User className="label-icon" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Mail className="label-icon" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Step 2: Issue Details */}
          {currentStep === 2 && (
            <div className="form-fields">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Layers className="label-icon" />
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="form-select"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <AlertCircle className="label-icon" />
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="form-select"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <FileText className="label-icon" />
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of your issue"
                  className="form-input"
                  maxLength={100}
                />
              </div>
            </div>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <div className="form-fields">
              <div className="form-group">
                <label className="form-label">
                  <MessageSquare className="label-icon" />
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Please provide detailed information about your issue..."
                  className="form-textarea"
                  rows={8}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="form-summary">
              <h4 className="summary-title">Review Your Ticket</h4>
              <div className="summary-item">
                <span className="summary-label">Name:</span>
                <span className="summary-value">{formData.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Email:</span>
                <span className="summary-value">{formData.email}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Category:</span>
                <span className="summary-value">
                  {categories.find(c => c.value === formData.category)?.label}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Priority:</span>
                <span className="summary-value">
                  {priorities.find(p => p.value === formData.priority)?.label}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Subject:</span>
                <span className="summary-value">{formData.title}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Description:</span>
                <span className="summary-value">{formData.description}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button 
              type="button"
              onClick={handlePrevious}
              className="nav-btn prev-btn"
              disabled={loading}
            >
              <ChevronLeft className="nav-icon" />
              Previous
            </button>
          )}
          
          {currentStep < steps.length ? (
            <button 
              type="button"
              onClick={handleNext}
              className={`nav-btn next-btn ${!validateStep(currentStep) ? 'disabled' : ''}`}
              disabled={!validateStep(currentStep)}
            >
              Next
              <ChevronRight className="nav-icon" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit}
              className="nav-btn next-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Ticket'}
              <Ticket className="nav-icon" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Wrapper for TicketDashboard with back button
// Wrapper for TicketThread with back button and header
function TicketThreadWrapper({ ticketId, currentUser, onBack }) {
  return (
    <div className="ticket-form-container">
      <div className="form-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft className="back-icon" />
        </button>
        <div className="form-header-content">
          <div className="form-header-icon">
            <MessageSquare className="header-form-icon" />
            <div className="header-form-glow" />
          </div>
          <div>
            <h2 className="form-title">Support Conversation</h2>
            <p className="form-subtitle">Chat with our support team about your issue</p>
          </div>
        </div>
      </div>
      
      <div className="thread-wrapper">
        <TicketThread
          ticketId={ticketId}
          currentUser={currentUser}
          userType="customer"
        />
      </div>
    </div>
  )
}

export default Support
