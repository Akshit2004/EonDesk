import React, { useState, useEffect } from 'react';
import { getAllTicketsForAgent, getTicketStats, updateTicketStatus } from '../../services/postgresAgentApi';
import { usePostgresAuth } from '../../contexts/PostgresAuthContext';
import { 
  FaTachometerAlt, 
  FaTicketAlt, 
  FaSignOutAlt, 
  FaUser, 
  FaClock, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye
} from 'react-icons/fa';
import StatCard from './components/StatCard';
import TicketsList from './components/TicketsList';
import TicketDetailsModal from './components/TicketDetailsModal';
import CreateTicketForm from '../../components/TicketDashboard/CreateTicketForm';
import AgentSidebar from './components/AgentSidebar';
import AgentNavbar from './components/AgentNavbar';
import EmailsDashboard from './components/EmailsDashboard';
import './AgentDashboard.css';
import './components/AgentSidebar.css';
import './components/AgentNavbar.css';

const AgentDashboard = () => {
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
  const { user, logout } = usePostgresAuth();

  // Debug: Show user from context
  console.log('AgentDashboard user from PostgresAuth:', user);

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const ticketsResult = await getAllTicketsForAgent();
      if (ticketsResult.success) {
        setTickets(ticketsResult.tickets);
      } else {
        setError('Failed to load tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      fetchTickets(); // Refresh tickets
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      alert('Logout failed. Please try again.');
    }
  };

  // Calculate stats from tickets
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'inProgress' || t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
  };

  const handleTicketCreated = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
    setShowCreateModal(false);
  };

  // Filter tickets based on search and status
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticket_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, startIndex + ticketsPerPage);

  // Get agent name
  const agentName = user?.displayName || user?.email || 'Agent';

  if (loading) {
    return (
      <div className="agent-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-dashboard-container">
      <AgentNavbar agentName={agentName} onLogout={handleLogout} />
      
      <div className="agent-dashboard-layout">
        <AgentSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
        
        <div className="agent-dashboard-main">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="agent-stats-section">
                <h2 className="section-title">Dashboard Overview</h2>
                <div className="agent-stats-grid">
                  <StatCard
                    title="Total Tickets"
                    value={stats.total}
                    icon={<FaTicketAlt />}
                    color="blue"
                    trend={`${stats.total} tickets in system`}
                    onClick={() => setStatusFilter('all')}
                    clickable
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
              <div className="agent-tickets-section">
                <div className="tickets-header">
                  <h2 className="section-title">Support Tickets</h2>
                  <button 
                    className="create-ticket-btn"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <FaPlus /> Create New Ticket
                  </button>
                </div>

                {/* Filters */}
                <div className="tickets-filters">
                  <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
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
                  <button 
                    onClick={fetchTickets}
                    className="refresh-btn"
                  >
                    🔄 Refresh
                  </button>
                </div>

                {/* Tickets List */}
                {error ? (
                  <div className="error-message">
                    <p>Error loading tickets: {error}</p>
                    <button onClick={() => fetchTickets()}>Retry</button>
                  </div>
                ) : (
                  <TicketsList 
                    tickets={currentTickets}
                    onTicketClick={handleTicketClick}
                    onStatusUpdate={handleStatusUpdate}
                    currentUser={user}
                    totalTickets={filteredTickets.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    ticketsPerPage={ticketsPerPage}
                    loading={loading}
                  />
                )}
              </div>
            </>
          )}

          {activeTab === 'emails' && <EmailsDashboard />}
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
          onStatusUpdate={handleStatusUpdate}
          currentUser={user}
        />
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
              <h2>Create New Ticket</h2>
              <p className="modal-subtitle">Submit a new support request</p>
            </div>
            <CreateTicketForm 
              onTicketCreated={handleTicketCreated} 
              currentUser={{
                email: user?.email,
                name: user?.displayName || user?.email
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
