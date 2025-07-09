import React, { useState } from 'react';
import './TicketsList.css';
import TicketStatusPriorityModal from './TicketStatusPriorityModal';

const TicketsList = ({ 
  tickets, 
  onTicketClick, 
  currentUser,
  totalTickets,
  loading,
  onStatusPriorityUpdate, // optional prop for updating status/priority
  searchTerm // new prop for search term
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTicket, setModalTicket] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      'open': '#f97316',
      'inProgress': '#eab308',
      'waiting_for_customer': '#3b82f6',
      'waiting_for_agent': '#ef4444',
      'resolved': '#22c55e',
      'closed': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#22c55e',
      'medium': '#eab308',
      'high': '#f97316',
      'critical': '#ef4444'
    };
    return colors[priority] || '#6b7280';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const highlightText = (text, term) => {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <span key={i} style={{ background: 'yellow', color: 'black' }}>{part}</span> : part
    );
  };

  const handleOpenModal = (ticket) => {
    setModalTicket(ticket);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalTicket(null);
  };

  const handleSaveModal = (changes) => {
    if (onStatusPriorityUpdate && modalTicket) {
      onStatusPriorityUpdate(modalTicket, changes);
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="tickets-empty">
        <div className="empty-icon">📋</div>
        <h3>No tickets found</h3>
        <p>No tickets match your current filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="tickets-list">
      <div className="tickets-info">
        <span className="tickets-count">
          Showing {tickets.length} of {totalTickets} tickets
        </span>
      </div>
      <div className="tickets-table"><div className="table-header">
          <div className="header-cell">Ticket ID</div>
          <div className="header-cell">Customer</div>
          <div className="header-cell">Subject</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Priority</div>
        </div>
        <div className="table-body">
          {tickets.map((ticket) => (
            <div 
              key={ticket.ticket_id || ticket.id} 
              className="table-row"
              onClick={() => onTicketClick(ticket)}
            >
              <div className="table-cell">
                <span className="ticket-id">{highlightText(ticket.ticketId || ticket.ticket_id || 'N/A', searchTerm)}</span>
              </div>
              <div className="table-cell">
                <div className="customer-info">
                  <span className="customer-name">{highlightText(ticket.customer_name, searchTerm)}</span>
                  <span className="customer-email">{highlightText(ticket.customer_email, searchTerm)}</span>
                </div>
              </div>
              <div className="table-cell">
                <span className="ticket-title">{highlightText(ticket.title, searchTerm)}</span>
              </div>
              <div className="table-cell">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(ticket.status) }}
                  onClick={e => { e.stopPropagation(); handleOpenModal(ticket); }}
                  title="Click to edit status and priority"
                >
                  {ticket.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="table-cell">
                <span 
                  className="priority-badge"
                  style={{ color: getPriorityColor(ticket.priority), cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); handleOpenModal(ticket); }}
                  title="Click to edit status and priority"
                >
                  {ticket.priority?.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TicketStatusPriorityModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        ticket={modalTicket || {}}
        onSave={handleSaveModal}
      />
    </div>
  );
};

export default TicketsList;
