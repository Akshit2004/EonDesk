import { useState, useEffect } from 'react'
import { 
  BarChart3, Users, MessageSquare, Clock, CheckCircle, AlertTriangle,
  Search, Filter, RefreshCw, UserCheck, Settings, LogOut, Bell, ArrowLeft,
  TrendingUp, Calendar, Zap, Star, Eye, Plus, ChevronDown, SortDesc,
  Activity, PieChart, Target, Workflow, Bookmark, Mail, PhoneCall,
  FileText, Download, Upload, Share2, MoreHorizontal, Grid, List
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
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    unanswered: 0,
    inProgress: 0,
    overdue: 0,
    todayResolved: 0,
    avgResponseTime: 0
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

    // Calculate today's resolved tickets
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayResolved = tickets.filter(t => {
      if (t.status !== 'closed') return false
      const updatedDate = new Date(t.updated_at?.seconds * 1000 || 0)
      return updatedDate >= today
    }).length

    // Calculate average response time (mock data for now)
    const avgResponseTime = total > 0 ? Math.floor(Math.random() * 120) + 30 : 0

    setStats({ 
      total, open, closed, unanswered, inProgress, overdue, 
      todayResolved, avgResponseTime 
    })
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
  }).sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        aValue = priorityOrder[a.priority] || 2
        bValue = priorityOrder[b.priority] || 2
        break
      case 'customer_name':
        aValue = a.customer_name?.toLowerCase() || ''
        bValue = b.customer_name?.toLowerCase() || ''
        break
      case 'subject':
        aValue = (a.subject || a.description)?.toLowerCase() || ''
        bValue = (b.subject || b.description)?.toLowerCase() || ''
        break
      default:
        aValue = new Date(a[sortBy]?.seconds * 1000 || 0)
        bValue = new Date(b[sortBy]?.seconds * 1000 || 0)
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
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
      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">
              <BarChart3 />
            </div>
            <h2>Agent Hub</h2>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Overview</h3>
            <a href="#" className="nav-item active">
              <Activity className="nav-icon" />
              Dashboard
            </a>
            <a href="#" className="nav-item">
              <MessageSquare className="nav-icon" />
              All Tickets
            </a>
            <a href="#" className="nav-item">
              <Bell className="nav-icon" />
              Urgent ({stats.overdue})
            </a>
          </div>
          
          <div className="nav-section">
            <h3>Analytics</h3>
            <a href="#" className="nav-item">
              <PieChart className="nav-icon" />
              Performance
            </a>
            <a href="#" className="nav-item">
              <TrendingUp className="nav-icon" />
              Reports
            </a>
          </div>
          
          <div className="nav-section">
            <h3>Tools</h3>
            <a href="#" className="nav-item">
              <Bookmark className="nav-icon" />
              Saved Filters
            </a>
            <a href="#" className="nav-item">
              <Settings className="nav-icon" />
              Settings
            </a>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {currentUser?.email?.[0]?.toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser?.email?.split('@')[0]}</div>
              <div className="user-role">{userRole}</div>
            </div>
          </div>
          <button className="logout-btn-sidebar" onClick={handleLogout}>
            <LogOut className="logout-icon" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Header */}
        <div className="main-header">
          <div className="header-title">
            <h1>Welcome back! 👋</h1>
            <p>Here's what's happening with your tickets today</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="quick-action-btn"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              <Plus className="action-icon" />
              Quick Actions
              <ChevronDown className={`dropdown-icon ${showQuickActions ? 'rotated' : ''}`} />
            </button>
            
            {showQuickActions && (
              <div className="quick-actions-dropdown">
                <button className="dropdown-item">
                  <FileText className="item-icon" />
                  Create Ticket
                </button>
                <button className="dropdown-item">
                  <Download className="item-icon" />
                  Export Data
                </button>
                <button className="dropdown-item">
                  <Mail className="item-icon" />
                  Send Bulk Email
                </button>
              </div>
            )}
            
            <button className="refresh-btn" onClick={loadTickets} disabled={loading}>
              <RefreshCw className={`refresh-icon ${loading ? 'spinning' : ''}`} />
            </button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="enhanced-stats-grid">
          <div className="stat-card-modern primary">
            <div className="stat-header">
              <div className="stat-icon-modern">
                <MessageSquare />
              </div>
              <div className="stat-trend">
                <TrendingUp className="trend-icon up" />
                <span>+12%</span>
              </div>
            </div>
            <div className="stat-content-modern">
              <div className="stat-number-large">{stats.total}</div>
              <div className="stat-label-modern">Total Tickets</div>
            </div>
            <div className="stat-footer">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${Math.min(stats.total / 100 * 100, 100)}%`}}></div>
              </div>
            </div>
          </div>

          <div className="stat-card-modern warning">
            <div className="stat-header">
              <div className="stat-icon-modern">
                <AlertTriangle />
              </div>
              <div className="stat-trend">
                <TrendingUp className="trend-icon down" />
                <span>-5%</span>
              </div>
            </div>
            <div className="stat-content-modern">
              <div className="stat-number-large">{stats.unanswered}</div>
              <div className="stat-label-modern">Needs Response</div>
            </div>
            <div className="stat-footer">
              <div className="progress-bar warning">
                <div className="progress-fill" style={{width: `${Math.min(stats.unanswered / stats.total * 100, 100)}%`}}></div>
              </div>
            </div>
          </div>

          <div className="stat-card-modern success">
            <div className="stat-header">
              <div className="stat-icon-modern">
                <CheckCircle />
              </div>
              <div className="stat-trend">
                <TrendingUp className="trend-icon up" />
                <span>+8%</span>
              </div>
            </div>
            <div className="stat-content-modern">
              <div className="stat-number-large">{stats.todayResolved}</div>
              <div className="stat-label-modern">Resolved Today</div>
            </div>
            <div className="stat-footer">
              <div className="progress-bar success">
                <div className="progress-fill" style={{width: `${Math.min(stats.todayResolved / 20 * 100, 100)}%`}}></div>
              </div>
            </div>
          </div>

          <div className="stat-card-modern info">
            <div className="stat-header">
              <div className="stat-icon-modern">
                <Clock />
              </div>
              <div className="stat-trend">
                <TrendingUp className="trend-icon up" />
                <span>-15m</span>
              </div>
            </div>
            <div className="stat-content-modern">
              <div className="stat-number-large">{stats.avgResponseTime}m</div>
              <div className="stat-label-modern">Avg Response</div>
            </div>
            <div className="stat-footer">
              <div className="progress-bar info">
                <div className="progress-fill" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters & Search */}
        <div className="advanced-filters">
          <div className="search-section">
            <div className="search-box-modern">
              <Search className="search-icon-modern" />
              <input
                type="text"
                placeholder="Search tickets, customers, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-modern"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group-modern">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select-modern"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="filter-select-modern"
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select-modern"
              >
                <option value="updated_at">Last Updated</option>
                <option value="created_at">Date Created</option>
                <option value="priority">Priority</option>
                <option value="customer_name">Customer</option>
                <option value="subject">Subject</option>
              </select>

              <button
                className="sort-order-btn"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <SortDesc className={`sort-icon ${sortOrder === 'asc' ? 'flipped' : ''}`} />
              </button>
            </div>
            
            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="view-icon" />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="view-icon" />
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="tickets-section-modern">
          <div className="section-header-modern">
            <h2>
              Tickets 
              <span className="tickets-count">({filteredTickets.length})</span>
            </h2>
            <div className="header-badges">
              {stats.overdue > 0 && (
                <div className="urgent-badge">
                  <Zap className="urgent-icon" />
                  {stats.overdue} Urgent
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-state-modern">
              <div className="loading-spinner">
                <RefreshCw className="spinner-icon" />
              </div>
              <p>Loading your tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty-state-modern">
              <div className="empty-illustration">
                <MessageSquare className="empty-icon-large" />
              </div>
              <h3>No tickets found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className={`tickets-container ${viewMode}`}>
              {viewMode === 'grid' ? (
                <div className="tickets-grid">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="ticket-card-modern"
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <div className="ticket-header-card">
                        <div className="ticket-id-badge">#{ticket.id}</div>
                        <div className="ticket-actions">
                          <button className="action-btn-small">
                            <Eye className="action-icon-small" />
                          </button>
                          <button className="action-btn-small">
                            <MoreHorizontal className="action-icon-small" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="ticket-customer-card">
                        <div className="customer-avatar">
                          {ticket.customer_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="customer-details">
                          <div className="customer-name-card">{ticket.customer_name}</div>
                          <div className="customer-email-card">{ticket.customer_email}</div>
                        </div>
                      </div>
                      
                      <div className="ticket-content-card">
                        <h4 className="ticket-subject">{ticket.subject || ticket.description}</h4>
                      </div>
                      
                      <div className="ticket-meta-card">
                        <div className="meta-badges">
                          <span className={`priority-badge-modern ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority || 'Medium'}
                          </span>
                          <span className={`status-badge-modern ${getStatusColor(ticket.status)}`}>
                            {ticket.status?.replace('_', ' ') || 'Open'}
                          </span>
                        </div>
                        <div className="ticket-time">
                          <Clock className="time-icon" />
                          {formatTimeAgo(ticket.updated_at || ticket.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tickets-list-modern">
                  <div className="list-header">
                    <div className="col-id">ID</div>
                    <div className="col-customer">Customer</div>
                    <div className="col-subject">Subject</div>
                    <div className="col-priority">Priority</div>
                    <div className="col-status">Status</div>
                    <div className="col-updated">Updated</div>
                    <div className="col-actions">Actions</div>
                  </div>
                  
                  <div className="list-body">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="list-row-modern"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <div className="col-id">
                          <span className="ticket-id-list">#{ticket.id}</span>
                        </div>
                        <div className="col-customer">
                          <div className="customer-info-list">
                            <div className="customer-avatar-small">
                              {ticket.customer_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="customer-name-list">{ticket.customer_name}</div>
                              <div className="customer-email-list">{ticket.customer_email}</div>
                            </div>
                          </div>
                        </div>
                        <div className="col-subject">
                          <span className="subject-text-list">{ticket.subject || ticket.description}</span>
                        </div>
                        <div className="col-priority">
                          <span className={`priority-badge-list ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority || 'Medium'}
                          </span>
                        </div>
                        <div className="col-status">
                          <span className={`status-badge-list ${getStatusColor(ticket.status)}`}>
                            {ticket.status?.replace('_', ' ') || 'Open'}
                          </span>
                        </div>
                        <div className="col-updated">
                          <span className="time-ago-list">
                            {formatTimeAgo(ticket.updated_at || ticket.created_at)}
                          </span>
                        </div>
                        <div className="col-actions">
                          <button className="action-btn-list">
                            <Eye className="action-icon-list" />
                          </button>
                          <button className="action-btn-list">
                            <Mail className="action-icon-list" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgentDashboard
