import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  
  FaTicketAlt,
  FaClock, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaCalendarAlt,
  FaSort,
  FaPaperclip,
  FaUserCheck,
  FaComments
} from 'react-icons/fa';
import CustomerSidebar from './components/CustomerSidebar';
import CustomerNavbar from './components/CustomerNavbar';
import StatCard from '../AgentDashboard/components/StatCard';
import TicketsList from './components/CustomerTicketsList';
import TicketDetailsModal from './components/CustomerTicketDetailsModal';
import CreateTicketModal from './components/CreateTicketModal';
import { fetchWithFallback } from '../../services/apiBase';
import './CustomerDashboard.css';
import './components/CustomerSidebar.css';
import './components/CustomerNavbar.css';
import './components/CustomerTicketsList.css';
import './components/CustomerTicketDetailsModal.css';
import './components/CreateTicketModal.css';

export default function CustomerDashboard() {
  const [customerNo, setCustomerNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('open'); // Set default to 'open'
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [visibleCount, setVisibleCount] = useState(5);
  
  // Advanced Filter States
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [lastUpdatedFromFilter, setLastUpdatedFromFilter] = useState('');
  const [lastUpdatedToFilter, setLastUpdatedToFilter] = useState('');
  const [agentResponseFilter, setAgentResponseFilter] = useState('all');
  const [attachmentFilter, setAttachmentFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('customer_no');
    if (stored) {
      setCustomerNo(stored);
      fetchTickets(stored);
      setCustomerName(`Customer ${stored}`);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchTickets = async (customerNumber) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchWithFallback(`/tickets/customer/${customerNumber}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_no');
    navigate('/');
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleTicketCreated = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
    setShowCreateModal(false);
  };

  useEffect(() => {
    setVisibleCount(5); // Reset visibleCount when tickets/filter changes
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter, sortBy, dateFromFilter, dateToFilter, lastUpdatedFromFilter, lastUpdatedToFilter, agentResponseFilter, attachmentFilter]);

  // Advanced Filter Function
  const filteredTickets = tickets.filter(ticket => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    
    // Date range filter (created date)
    const matchesDateRange = (() => {
      if (!dateFromFilter && !dateToFilter) return true;
      const ticketDate = new Date(ticket.created_at);
      const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
      const toDate = dateToFilter ? new Date(dateToFilter) : null;
      
      if (fromDate && toDate) {
        return ticketDate >= fromDate && ticketDate <= toDate;
      } else if (fromDate) {
        return ticketDate >= fromDate;
      } else if (toDate) {
        return ticketDate <= toDate;
      }
      return true;
    })();
    
    // Last updated date filter
    const matchesLastUpdated = (() => {
      if (!lastUpdatedFromFilter && !lastUpdatedToFilter) return true;
      const ticketDate = new Date(ticket.updated_at || ticket.created_at);
      const fromDate = lastUpdatedFromFilter ? new Date(lastUpdatedFromFilter) : null;
      const toDate = lastUpdatedToFilter ? new Date(lastUpdatedToFilter) : null;
      
      if (fromDate && toDate) {
        return ticketDate >= fromDate && ticketDate <= toDate;
      } else if (fromDate) {
        return ticketDate >= fromDate;
      } else if (toDate) {
        return ticketDate <= toDate;
      }
      return true;
    })();
    
    // Agent response filter
    const matchesAgentResponse = (() => {
      if (agentResponseFilter === 'all') return true;
      if (agentResponseFilter === 'unanswered') return !ticket.agent_response;
      if (agentResponseFilter === 'awaiting_customer') return ticket.awaiting_customer_reply;
      return true;
    })();
    
    // Attachment filter
    const matchesAttachment = (() => {
      if (attachmentFilter === 'all') return true;
      if (attachmentFilter === 'with_attachments') return ticket.has_attachments;
      if (attachmentFilter === 'without_attachments') return !ticket.has_attachments;
      return true;
    })();
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && 
           matchesDateRange && matchesLastUpdated && 
           matchesAgentResponse && matchesAttachment;
  });

  // Sort tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'priority':
        const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const currentTickets = sortedTickets.slice(0, visibleCount);

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'inProgress' || t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
  };

  if (loading) {
    return (
      <div className="customer-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard-container">
      <CustomerNavbar customerName={customerName} onLogout={handleLogout} />
      
      <div className="customer-dashboard-layout">
        <CustomerSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          customerName={customerName}
        />
        
        <div className="customer-dashboard-main">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="customer-stats-section">
                <h2 className="section-title">Dashboard Overview</h2>
                <div className="customer-stats-grid">
                  <StatCard
                    title="Total Tickets"
                    value={stats.total}
                    icon={<FaTicketAlt />}
                    color="blue"
                    trend={`${stats.total} tickets created`}
                    active={statusFilter === 'all'}
                  />
                  <StatCard
                    title="Open Tickets"
                    value={stats.open}
                    icon={<FaClock />}
                    color="yellow"
                    trend={`${stats.open} awaiting response`}
                    onClick={() => setStatusFilter('open')}
                    clickable
                    active={statusFilter === 'open'}
                  />
                  <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={<FaExclamationTriangle />}
                    color="green"
                    trend={`${stats.inProgress} being worked on`}
                    onClick={() => setStatusFilter('inProgress')}
                    clickable
                    active={statusFilter === 'inProgress'}
                  />
                  <StatCard
                    title="Resolved"
                    value={stats.resolved}
                    icon={<FaCheckCircle />}
                    color="purple"
                    trend={`${stats.resolved} completed`}
                    onClick={() => setStatusFilter('resolved')}
                    clickable
                    active={statusFilter === 'resolved'}
                  />
                </div>
              </div>

              {/* Tickets Section */}
              <div className="customer-tickets-section">
                <div className="tickets-header">
                  <h2 className="section-title">My Support Tickets</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      className="create-ticket-btn"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <FaPlus /> Create New Ticket
                    </button>
                    <button
                      className="create-ticket-btn"
                      onClick={() => fetchTickets(customerNo)}
                      title="Refresh ticket list"
                    >
                      <FaSyncAlt /> Refresh
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="tickets-filters">
                  {/* Basic Filters Row */}
                  <div className="basic-filters-row">
                    <div className="search-box">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search tickets, descriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    <div className="filter-box">
                      <FaFilter className="filter-icon" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="inProgress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div className="filter-box">
                      <FaSort className="filter-icon" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="priority">Priority</option>
                        <option value="status">Status</option>
                      </select>
                    </div>
                    <button
                      className="toggle-advanced-btn"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      {showAdvancedFilters ? 'Hide' : 'More'} Filters
                    </button>
                  </div>

                  {/* Advanced Filters Panel */}
                  {showAdvancedFilters && (
                    <div className="advanced-filters-panel">
                      {/* Priority and Category Row */}
                      <div className="filters-row">
                        <div className="filter-box">
                          <label className="filter-label">Priority</label>
                          <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="filter-select"
                          >
                            <option value="all">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div className="filter-box">
                          <label className="filter-label">Category</label>
                          <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="filter-select"
                          >
                            <option value="all">All Categories</option>
                            <option value="technical">Technical Issue</option>
                            <option value="billing">Billing</option>
                            <option value="general">General Inquiry</option>
                            <option value="feature">Feature Request</option>
                            <option value="bug">Bug Report</option>
                          </select>
                        </div>
                      </div>

                      {/* Date Range Row */}
                      <div className="filters-row">
                        <div className="filter-box">
                          <label className="filter-label">
                            <FaCalendarAlt /> Created From
                          </label>
                          <input
                            type="date"
                            value={dateFromFilter}
                            onChange={(e) => setDateFromFilter(e.target.value)}
                            className="filter-input"
                          />
                        </div>
                        <div className="filter-box">
                          <label className="filter-label">
                            <FaCalendarAlt /> Created To
                          </label>
                          <input
                            type="date"
                            value={dateToFilter}
                            onChange={(e) => setDateToFilter(e.target.value)}
                            className="filter-input"
                          />
                        </div>
                      </div>

                      {/* Last Updated Date Row */}
                      <div className="filters-row">
                        <div className="filter-box">
                          <label className="filter-label">
                            <FaCalendarAlt /> Updated From
                          </label>
                          <input
                            type="date"
                            value={lastUpdatedFromFilter}
                            onChange={(e) => setLastUpdatedFromFilter(e.target.value)}
                            className="filter-input"
                          />
                        </div>
                        <div className="filter-box">
                          <label className="filter-label">
                            <FaCalendarAlt /> Updated To
                          </label>
                          <input
                            type="date"
                            value={lastUpdatedToFilter}
                            onChange={(e) => setLastUpdatedToFilter(e.target.value)}
                            className="filter-input"
                          />
                        </div>
                      </div>

                      {/* Response and Attachment Filters */}
                      <div className="filters-row">
                        <div className="filter-box">
                          <label className="filter-label">
                            <FaComments /> Agent Response
                          </label>
                          <select
                            value={agentResponseFilter}
                            onChange={(e) => setAgentResponseFilter(e.target.value)}
                            className="filter-select"
                          >
                            <option value="all">All Tickets</option>
                            <option value="unanswered">Unanswered</option>
                            <option value="awaiting_customer">Awaiting Customer</option>
                          </select>
                        </div>
                        <div className="filter-box">
                          <label className="filter-label">
                            <FaPaperclip /> Attachments
                          </label>
                          <select
                            value={attachmentFilter}
                            onChange={(e) => setAttachmentFilter(e.target.value)}
                            className="filter-select"
                          >
                            <option value="all">All Tickets</option>
                            <option value="with_attachments">With Attachments</option>
                            <option value="without_attachments">Without Attachments</option>
                          </select>
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      <div className="filters-row">
                        <button
                          className="clear-filters-btn"
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setPriorityFilter('all');
                            setCategoryFilter('all');
                            setSortBy('newest');
                            setDateFromFilter('');
                            setDateToFilter('');
                            setLastUpdatedFromFilter('');
                            setLastUpdatedToFilter('');
                            setAgentResponseFilter('all');
                            setAttachmentFilter('all');
                          }}
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tickets List */}
                {error ? (
                  <div className="error-message">
                    <p>Error loading tickets: {error}</p>
                    <button onClick={() => fetchTickets(customerNo)}>Retry</button>
                  </div>
                ) : (
                  <>
                    <TicketsList
                      tickets={currentTickets}
                      onTicketClick={handleTicketClick}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      loading={loading}
                      searchTerm={searchTerm} // pass searchTerm for highlighting
                    />
                    {visibleCount < sortedTickets.length && (
                      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                        <button className="load-more-btn" onClick={() => setVisibleCount(v => Math.min(v + 20, sortedTickets.length))}>
                          Load More
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => {
            setShowModal(false);
            setSelectedTicket(null);
          }}
          customerNo={customerNo}
        />
      )}

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onTicketCreated={handleTicketCreated}
          customerNo={customerNo}
          customerName={customerName}
        />
      )}
    </div>
  );
}
