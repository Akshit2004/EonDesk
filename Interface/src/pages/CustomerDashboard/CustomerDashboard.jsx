import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaSyncAlt
} from 'react-icons/fa';
import CustomerSidebar from './components/CustomerSidebar';
import CustomerNavbar from './components/CustomerNavbar';
import StatCard from '../AgentDashboard/components/StatCard';
import TicketsList from './components/CustomerTicketsList';
import TicketDetailsModal from './components/CustomerTicketDetailsModal';
import CreateTicketModal from './components/CreateTicketModal';
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
      const response = await fetch(`http://localhost:3001/tickets/customer/${customerNumber}`);
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
                </div>

                {/* Tickets List */}
                {error ? (
                  <div className="error-message">
                    <p>Error loading tickets: {error}</p>
                    <button onClick={() => fetchTickets(customerNo)}>Retry</button>
                  </div>
                ) : (
                  <TicketsList
                    tickets={currentTickets}
                    onTicketClick={handleTicketClick}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    loading={loading}
                  />
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
