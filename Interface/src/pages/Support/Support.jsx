import { useState } from 'react'
import { 
  ArrowLeft, Ticket, Plus, FileText, Clock, User, Mail, Phone, ArrowRight, 
  CheckCircle, ChevronLeft, ChevronRight, Headphones, MessageSquare, Settings, 
  AlertCircle, Shield,  HelpCircle,
  BookOpen, Target, Layers, Search
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import { CreateTicketForm } from '../../components/TicketDashboard'
import { getTicketById } from '../../services/ticketApi'
import { createTicketPG } from '../../services/postgresTicketApi'
import ChatThread from './ChatThread'
import { toast } from 'react-toastify'
import { sendTicketConfirmationEmail } from '../../services/emailService';
import './Support.css'

function Support() {
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState(null)
  const [trackedTicket, setTrackedTicket] = useState(null)
  const [loadingChatThread, setLoadingChatThread] = useState(false);

  const handleGoBack = () => {
    navigate('/')
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
  }

  const handleTicketCreated = (result) => {
    // Print ticket_id or ticketId for compatibility
    const ticketNo = result.ticket_id || result.ticketId;
    console.log('Ticket created successfully. Ticket ID:', ticketNo);
    toast.success(`Ticket created! Your Ticket No: ${ticketNo}`);
    // Optionally switch to track mode or show success message
  }

  const handleTrackTicket = (ticket) => {
    setLoadingChatThread(true);
    setTimeout(() => {
      setTrackedTicket(ticket);
      setSelectedOption('chat');
      setLoadingChatThread(false);
    }, 700); // 700ms delay for animation
  }

  return (
    <div className="support-container">
      <Navbar currentPage="support" showThemeToggle={true} showTagline={false} />
      <div className="support-content">
        <div className="support-header">
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
              className="support-card create-ticket"
              onClick={() => handleOptionSelect('create')}
            >
              <div className="card-icon">
                <Plus className="icon" />
                <div className="card-glow" />
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
            {/* New Track Ticket Card */}
            <div 
              className="support-card track-ticket"
              onClick={() => handleOptionSelect('track')}
            >
              <div className="card-icon">
                <Search className="icon" />
                <div className="card-glow" />
              </div>
              <h3 className="card-title">Track Ticket</h3>
              <p className="card-description">
                Check the status of your existing support ticket
              </p>
              <div className="card-features">
                <span className="feature">Live Status</span>
                <span className="feature">Email Updates</span>
              </div>
              <div className="card-action">
                <span>Track Now</span>
                <ArrowRight className="arrow-icon" />
              </div>            </div>
          </div>
        </div>) : selectedOption === 'create' ? (
          <EnhancedCreateTicket 
            onTicketCreated={handleTicketCreated}
            onBack={() => setSelectedOption(null)}
          />
        ) : selectedOption === 'track' ? (
          <TrackTicketCard onBack={() => setSelectedOption(null)} onTicketFound={handleTrackTicket} />
        ) : selectedOption === 'chat' && trackedTicket ? (
          <ChatThread ticket={trackedTicket} onBack={() => { setSelectedOption(null); setTrackedTicket(null); }} />
        ) : null}
        {loadingChatThread && (
          <div className="modal-loading-overlay">
            <div className="modal-spinner"></div>
          </div>
        )}
      </div>
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

  // Add REST API function for ticket creation
  async function createTicketAPI(ticketData) {
    const response = await fetch('http://localhost:3001/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    return await response.json();
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
        customer_email: formData.email.trim(),
        customer_name: formData.name.trim(),
        status: 'open',
        created_by: formData.email.trim(),
        assigned_agent: null,
        assigned_agent_name: null,
        ticket_id: `TKT-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
      }

      const result = await createTicketPG(ticketData)
      if (result && !result.error) {
        // Send confirmation email
        try {
          const emailResult = await sendTicketConfirmationEmail(result);
          if (!emailResult.success) {
            setError('Ticket created, but failed to send confirmation email: ' + emailResult.error);
          }
        } catch (emailError) {
          setError('Ticket created, but email service failed.');
        }
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

// Add this component at the bottom before export default
function TrackTicketCard({ onBack, onTicketFound }) {
  const [ticketId, setTicketId] = useState('')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrack = async () => {
    setLoading(true)
    setError('')
    setStatus(null)
    try {
      if (!ticketId) {
        setError('Please enter your Ticket Number.')
        setLoading(false)
        return
      }
      const result = await getTicketById(ticketId.trim())
      if (result.success) {
        setStatus({
          id: result.ticket.ticket_id,
          state: result.ticket.status || 'In Progress',
          lastUpdate: result.ticket.updated_at ? new Date(result.ticket.updated_at).toLocaleString() : 'N/A',
        })
        if (onTicketFound) onTicketFound(result.ticket)
      } else {
        setError('Ticket not found. Please check your Ticket Number.')
      }
    } catch (err) {
      setError('Error fetching ticket. Please try again.')
    }
    setLoading(false)
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
            <h2 className="form-title">Track Your Ticket</h2>
            <p className="form-subtitle">Enter your Ticket Number</p>
          </div>
        </div>
      </div>
      <div className="track-form-fields">
        <div className="form-group">
          <label className="form-label">Ticket Number</label>
          <input
            type="text"
            value={ticketId}
            onChange={e => setTicketId(e.target.value)}
            placeholder="e.g. TKT-12345-ABCDE"
            className="form-input"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button className="nav-btn next-btn" onClick={handleTrack} disabled={loading}>
          {loading ? 'Tracking...' : 'Track Ticket'}
          <Search className="nav-icon" />
        </button>
        {loading && (
          <div className="ticket-searching-animation">
            <Search className="ticket-searching-icon" />
            <div className="ticket-searching-dots">
              <div className="ticket-searching-dot"></div>
              <div className="ticket-searching-dot"></div>
              <div className="ticket-searching-dot"></div>
            </div>
            <div style={{marginTop:8, color:'#357abd', fontWeight:500}}>Searching for your ticket...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Support
