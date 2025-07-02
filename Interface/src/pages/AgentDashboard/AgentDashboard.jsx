import React, { useState, useEffect } from 'react';
import { getAllTicketsForAgent, getTicketStats, updateTicketStatus } from '../../services/postgresAgentApi';
import { usePostgresAuth } from '../../contexts/PostgresAuthContext';
import StatCard from './components/StatCard';
import TicketsList from './components/TicketsList';
import TicketDetailsModal from './components/TicketDetailsModal';
import CreateTicketForm from '../../components/TicketDashboard/CreateTicketForm';
import AgentSidebar from './components/AgentSidebar';
import EmailsDashboard from './components/EmailsDashboard';
import './AgentDashboard.css';
import './components/AgentSidebar.css';

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = usePostgresAuth();
  // Debug: Show user from context
  console.log('AgentDashboard user from PostgresAuth:', user);

  // Fetch tickets and stats on component mount
  useEffect(() => {
    fetchTicketsAndStats();
  }, []);

  const fetchTicketsAndStats = async () => {
    setLoading(true);
    try {
      // Fetch tickets
      const ticketsResult = await getAllTicketsForAgent();
      if (ticketsResult.success) {
        setTickets(ticketsResult.tickets);
      }

      // Fetch stats
      const statsResult = await getTicketStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      // Refresh data
      fetchTicketsAndStats();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleTicketCreated = () => {
    setShowCreateModal(false);
    fetchTicketsAndStats();
  };
  const handleLogout = async () => {
    try {
      await logout();
      // Optionally redirect to login page
      window.location.href = '/';
    } catch (error) {
      alert('Logout failed. Please try again.');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.total,
      icon: '📊',
      color: 'blue',
      description: 'All tickets in system'
    },
    {
      title: 'Open Tickets',
      value: stats.open,
      icon: '🎫',
      color: 'orange',
      description: 'New tickets awaiting response'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: '⚡',
      color: 'yellow',
      description: 'Tickets being worked on'
    },
    {
      title: 'Resolved Today',
      value: stats.resolved,
      icon: '✅',
      color: 'green',
      description: 'Completed tickets'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }
  return (
    <div className="agent-dashboard">
      <AgentSidebar 
        onLogout={handleLogout} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="dashboard-main-content" style={{ flex: 1, marginLeft: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'dashboard' && (
          <>
            <div className="dashboard-header">
              <h1>Support Agent Dashboard</h1>
            </div>

            {/* Stats Cards Section */}
            <div className="stats-section">
              <div className="stats-grid">
                {statCards.map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </div>
            </div>

            {/* Tickets Section */}
            <div className="tickets-section">
              <div className="tickets-header">
                <h2>Support Tickets</h2>
                <div className="filters">
                  <select 
                    value={filter} 
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Tickets</option>
                    <option value="open">Open</option>
                    <option value="inProgress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button 
                    onClick={fetchTicketsAndStats}
                    className="refresh-btn"
                  >
                    🔄 Refresh
                  </button>
                  <button className="create-ticket-btn" onClick={() => setShowCreateModal(true)}>
                    + Create Ticket
                  </button>
                </div>
              </div>

              <TicketsList 
                tickets={currentTickets}
                onTicketClick={handleTicketClick}
                onStatusUpdate={handleStatusUpdate}
                currentUser={user}
                totalTickets={filteredTickets.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                ticketsPerPage={ticketsPerPage}
              />
            </div>
          </>
        )}

        {activeTab === 'emails' && <EmailsDashboard />}

        {/* Ticket Details Modal */}
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

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
                <h2>Create New Ticket</h2>
                <p className="modal-subtitle">Submit a new support request</p>
              </div>
              <CreateTicketForm onTicketCreated={handleTicketCreated} currentUser={{
                email: user?.email,
                name: user?.displayName || user?.email
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
