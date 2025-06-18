import { useState } from 'react'
import { ArrowLeft, Ticket, Search, Plus, FileText, Clock, User, Mail, Phone, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
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
      
      <div className="support-content">
        <div className="support-header">
          <button className="back-button" onClick={handleGoBack}>
            <ArrowLeft className="back-icon" />
            <span>Back to Home</span>
          </button>
          <div className="header-content">
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

          <div className="quick-stats">
            <div className="stat-card">
              <Clock className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">2min</span>
                <span className="stat-label">Avg Response Time</span>
              </div>
            </div>
            <div className="stat-card">
              <Ticket className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">98%</span>
                <span className="stat-label">Resolution Rate</span>
              </div>
            </div>
            <div className="stat-card">
              <User className="stat-icon" />
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

  return (
    <div className="ticket-form-container">
      <div className="form-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft className="back-icon" />
        </button>
        <div>
          <h2 className="form-title">Track Your Ticket</h2>
          <p className="form-subtitle">Enter your ticket details to check status</p>
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    priority: 'medium',
    category: 'general',
    description: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle ticket creation logic here
    alert(`Ticket created successfully for ${formData.name}`)
  }

  return (
    <div className="ticket-form-container">
      <div className="form-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft className="back-icon" />
        </button>
        <div>
          <h2 className="form-title">Create New Ticket</h2>
          <p className="form-subtitle">Tell us about your issue and we'll help you resolve it</p>
        </div>
      </div>

      <form className="ticket-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User className="label-icon" />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
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
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-row">
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

          <div className="form-group">
            <label htmlFor="priority" className="form-label">
              Priority Level
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="general">General Support</option>
            <option value="technical">Technical Issue</option>
            <option value="billing">Billing & Payment</option>
            <option value="account">Account Management</option>
            <option value="feature">Feature Request</option>
            <option value="bug">Bug Report</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            <FileText className="label-icon" />
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Brief description of your issue"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Please provide detailed information about your issue..."
            className="form-textarea"
            rows="5"
            required
          />
        </div>

        <button type="submit" className="submit-btn create-btn">
          <Plus className="btn-icon" />
          Create Ticket
        </button>
      </form>
    </div>
  )
}

export default Support
