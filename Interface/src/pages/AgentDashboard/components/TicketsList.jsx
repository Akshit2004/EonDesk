import React from 'react';
import './TicketsList.css';

const TicketsList = ({ 
  tickets, 
  onTicketClick, 
  onStatusUpdate, 
  currentUser,
  totalTickets,
  loading
}) => {
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
          <div className="header-cell">Actions</div>
        </div>
        <div className="table-body">
          {tickets.map((ticket) => (
            <div 
              key={ticket.ticket_id || ticket.id} 
              className="table-row"
              onClick={() => onTicketClick(ticket)}
            >
              <div className="table-cell">
                <span className="ticket-id">{ticket.ticketId || ticket.ticket_id || 'N/A'}</span>
              </div>
              <div className="table-cell">
                <div className="customer-info">
                  <span className="customer-name">{ticket.customer_name}</span>
                  <span className="customer-email">{ticket.customer_email}</span>
                </div>
              </div>
              <div className="table-cell">
                <span className="ticket-title">{ticket.title}</span>
              </div>
              <div className="table-cell">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(ticket.status) }}
                >
                  {ticket.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="table-cell">
                <span 
                  className="priority-badge"
                  style={{ color: getPriorityColor(ticket.priority) }}
                >
                  {ticket.priority?.toUpperCase()}
                </span>
              </div>
              <div className="table-cell actions-cell" onClick={(e) => e.stopPropagation()}>
                <div className="action-buttons">
                  {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                    <select
                      className="status-select"
                      value={ticket.status}
                      onChange={(e) => onStatusUpdate(ticket.ticket_id || ticket.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="open">Open</option>
                      <option value="inProgress">In Progress</option>
                      <option value="waiting_for_customer">Waiting for Customer</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketsList;
