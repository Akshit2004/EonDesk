import { useState, useEffect } from 'react'
import { 
  BarChart3, Users, MessageSquare, Clock, CheckCircle, AlertTriangle,
  Search, Filter, RefreshCw, UserCheck, Settings, LogOut, Bell, ArrowLeft
} from 'lucide-react'
import { getAllTicketsForAgent } from '../../firebase/tickets'
import { signOut } from '../../firebase/auth'
import TicketThread from '../../components/TicketDashboard/TicketThread'
import './AgentDashboard.css'

function AgentDashboard({ currentUser, userRole, onLogout }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    unanswered: 0,
    inProgress: 0,
    overdue: 0
  })

  useEffect(() => {
    loadTickets()
    // Set up real-time updates
    const interval = setInterval(loadTickets, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    calculateStats()
  }, [tickets])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const result = await getAllTicketsForAgent()
      if (result.success) {
        setTickets(result.tickets)
      } else {
        console.error('Failed to load tickets:', result.error)
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const total = tickets.length
    const open = tickets.filter(t => t.status === 'open').length
    const closed = tickets.filter(t => t.status === 'closed').length
    const inProgress = tickets.filter(t => t.status === 'in_progress').length
    const unanswered = tickets.filter(t => 
      t.status === 'open' && (!t.messages || t.messages.length <= 1)
    ).length
    
    // Calculate overdue (tickets older than 24 hours without response)
    const overdue = tickets.filter(t => {
      if (t.status === 'closed') return false
      const lastUpdate = new Date(t.updated_at?.seconds * 1000 || t.created_at?.seconds * 1000)
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
      return hoursSinceUpdate > 24
    }).length

    setStats({ total, open, closed, unanswered, inProgress, overdue })
  }

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket)
  }

  const handleBackToList = () => {
    setSelectedTicket(null)
    loadTickets() // Refresh data when returning to list
  }

  const handleLogout = async () => {
    try {
      await signOut()
      onLogout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchTerm || 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'priority-medium'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'status-open'
      case 'in_progress': return 'status-progress'
      case 'closed': return 'status-closed'
      default: return 'status-open'
    }
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp.seconds * 1000)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }
  if (selectedTicket) {
    return (
      <div className="agent-dashboard">
        <div className="ticket-view-container">
          <div className="ticket-view-header">
            <button className="back-to-list-btn" onClick={handleBackToList}>
              <ArrowLeft className="back-icon" />
              Back to Dashboard
            </button>
            <h2>Ticket #{selectedTicket.id}</h2>
          </div>
          <TicketThread
            ticketId={selectedTicket.id}
            currentUser={currentUser}
            userType="agent"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="agent-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">
            <BarChart3 className="title-icon" />
            Agent Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Welcome back, {currentUser?.email} 
            {userRole === 'admin' && <span className="role-badge">Admin</span>}
          </p>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={loadTickets} disabled={loading}>
            <RefreshCw className={`icon ${loading ? 'spinning' : ''}`} />
            Refresh
          </button>
          {userRole === 'admin' && (
            <button className="action-btn">
              <Settings className="icon" />
              Settings
            </button>
          )}
          <button className="action-btn logout-btn" onClick={handleLogout}>
            <LogOut className="icon" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <MessageSquare />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
        </div>
        
        <div className="stat-card open">
          <div className="stat-icon">
            <AlertTriangle />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.open}</span>
            <span className="stat-label">Open Tickets</span>
          </div>
        </div>

        <div className="stat-card unanswered">
          <div className="stat-icon">
            <Bell />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.unanswered}</span>
            <span className="stat-label">Unanswered</span>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon">
            <Clock />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>

        <div className="stat-card closed">
          <div className="stat-icon">
            <CheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.closed}</span>
            <span className="stat-label">Closed</span>
          </div>
        </div>

        <div className="stat-card overdue">
          <div className="stat-icon">
            <AlertTriangle />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.overdue}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="tickets-section">
        <div className="section-header">
          <h2>All Tickets ({filteredTickets.length})</h2>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="loading-icon spinning" />
            <p>Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <MessageSquare className="empty-icon" />
            <p>No tickets found</p>
          </div>
        ) : (
          <div className="tickets-table">
            <div className="table-header">
              <div className="col-ticket-id">Ticket ID</div>
              <div className="col-customer">Customer</div>
              <div className="col-subject">Subject</div>
              <div className="col-priority">Priority</div>
              <div className="col-status">Status</div>
              <div className="col-updated">Last Updated</div>
            </div>
            
            <div className="table-body">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="table-row"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <div className="col-ticket-id">
                    <span className="ticket-id">{ticket.id}</span>
                  </div>
                  <div className="col-customer">
                    <div className="customer-info">
                      <UserCheck className="customer-icon" />
                      <div>
                        <div className="customer-name">{ticket.customer_name}</div>
                        <div className="customer-email">{ticket.customer_email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-subject">
                    <span className="subject-text">{ticket.subject || ticket.description}</span>
                  </div>
                  <div className="col-priority">
                    <span className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority || 'Medium'}
                    </span>
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                      {ticket.status?.replace('_', ' ') || 'Open'}
                    </span>
                  </div>
                  <div className="col-updated">
                    <span className="time-ago">
                      {formatTimeAgo(ticket.updated_at || ticket.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentDashboard
