import React from 'react';
import './TicketList.css';

const TicketList = ({ tickets, onTicketSelect, userType, currentUser }) => {
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': '#ff9800',
      'assigned': '#2196f3',
      'waiting_for_customer': '#9c27b0',
      'waiting_for_agent': '#f44336',
      'resolved': '#4caf50',
      'closed': '#757575'
    };
    return colors[status] || '#757575';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#4caf50',
      'medium': '#ff9800',
      'high': '#f44336',
      'urgent': '#d32f2f'
    };
    return colors[priority] || '#757575';
  };

  const getUnreadCount = (ticket) => {
    if (userType === 'customer') {
      return ticket.unread_count_customer || 0;
    } else {
      return ticket.unread_count_agent || 0;
    }
  };

  const shouldHighlight = (ticket) => {
    return getUnreadCount(ticket) > 0;
  };

  if (tickets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎫</div>
        <h3>No tickets found</h3>
        <p>
          {userType === 'customer' 
            ? "You haven't created any support tickets yet." 
            : "No tickets available at the moment."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="ticket-list">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className={`ticket-card ${shouldHighlight(ticket) ? 'has-unread' : ''}`}
          onClick={() => onTicketSelect(ticket)}
        >
          <div className="ticket-card-header">
            <div className="ticket-title-section">
              <h3 className="ticket-title">{ticket.title}</h3>
              <span className="ticket-id">#{ticket.ticketId}</span>
            </div>
            
            <div className="ticket-badges">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(ticket.status) }}
              >
                {ticket.status.replace('_', ' ').toUpperCase()}
              </span>
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(ticket.priority) }}
              >
                {ticket.priority.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="ticket-card-content">
            <div className="ticket-meta">
              <div className="meta-item">
                <span className="meta-label">Created:</span>
                <span className="meta-value">{formatDate(ticket.createdAt)}</span>
              </div>
              
              {ticket.assigned_agent && (
                <div className="meta-item">
                  <span className="meta-label">Assigned to:</span>
                  <span className="meta-value">
                    {ticket.assigned_agent_name || ticket.assigned_agent}
                  </span>
                </div>
              )}
              
              {userType === 'agent' && (
                <div className="meta-item">
                  <span className="meta-label">Customer:</span>
                  <span className="meta-value">{ticket.customer_name}</span>
                </div>
              )}
            </div>

            {ticket.last_message && (
              <div className="last-message">
                <div className="last-message-header">
                  <span className="last-message-sender">
                    {ticket.last_message.sender_type === 'customer' ? 'Customer' : 'Agent'}:
                  </span>
                  <span className="last-message-time">
                    {formatDate(ticket.last_message.timestamp?.toDate?.() || ticket.updatedAt)}
                  </span>
                </div>
                <div className="last-message-content">
                  {ticket.last_message.content.length > 100
                    ? `${ticket.last_message.content.substring(0, 100)}...`
                    : ticket.last_message.content
                  }
                </div>
              </div>
            )}
          </div>

          <div className="ticket-card-footer">
            <div className="message-count">
              {ticket.message_count || 0} message{(ticket.message_count || 0) !== 1 ? 's' : ''}
            </div>
            
            {getUnreadCount(ticket) > 0 && (
              <div className="unread-badge">
                {getUnreadCount(ticket)} new
              </div>
            )}
            
            <div className="view-indicator">
              →
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketList;
