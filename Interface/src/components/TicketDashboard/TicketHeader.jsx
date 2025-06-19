import React from 'react';
import { updateTicketStatus, updateTicketPriority, closeTicket, reopenTicket } from '../../firebase/tickets';
import './TicketHeader.css';

const TicketHeader = ({ ticket, currentUser, userType }) => {
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

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTicketStatus(ticket.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await updateTicketPriority(ticket.id, newPriority);
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleCloseTicket = async () => {
    const resolution = prompt('Please provide a resolution summary:');
    if (resolution) {
      try {
        await closeTicket(ticket.id, resolution);
      } catch (error) {
        console.error('Error closing ticket:', error);
      }
    }
  };

  const handleReopenTicket = async () => {
    const reason = prompt('Please provide a reason for reopening:');
    if (reason) {
      try {
        await reopenTicket(ticket.id, reason);
      } catch (error) {
        console.error('Error reopening ticket:', error);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="ticket-header">
      <div className="ticket-title-row">
        <h2 className="ticket-title">{ticket.title}</h2>
        <span className="ticket-id">#{ticket.ticketId}</span>
      </div>
      
      <div className="ticket-meta">
        <div className="meta-group">
          <span className="meta-label">Status:</span>
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(ticket.status) }}
          >
            {ticket.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        <div className="meta-group">
          <span className="meta-label">Priority:</span>
          <span 
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
          >
            {ticket.priority.toUpperCase()}
          </span>
        </div>
        
        <div className="meta-group">
          <span className="meta-label">Created:</span>
          <span className="meta-value">{formatDate(ticket.createdAt)}</span>
        </div>
        
        {ticket.assigned_agent && (
          <div className="meta-group">
            <span className="meta-label">Assigned to:</span>
            <span className="meta-value">{ticket.assigned_agent_name || ticket.assigned_agent}</span>
          </div>
        )}
      </div>

      {/* Action buttons for agents */}
      {userType === 'agent' && (
        <div className="ticket-actions">
          {ticket.status !== 'resolved' && (
            <>
              <select 
                value={ticket.status} 
                onChange={(e) => handleStatusChange(e.target.value)}
                className="action-select"
              >
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="waiting_for_customer">Waiting for Customer</option>
                <option value="waiting_for_agent">Waiting for Agent</option>
              </select>
              
              <select 
                value={ticket.priority} 
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="action-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              
              <button 
                onClick={handleCloseTicket}
                className="action-button resolve-button"
              >
                Resolve
              </button>
            </>
          )}
          
          {ticket.status === 'resolved' && (
            <button 
              onClick={handleReopenTicket}
              className="action-button reopen-button"
            >
              Reopen
            </button>
          )}
        </div>
      )}

      {/* Unread indicators */}
      {ticket.unread_count_customer > 0 && userType === 'customer' && (
        <div className="unread-indicator">
          {ticket.unread_count_customer} new message{ticket.unread_count_customer > 1 ? 's' : ''}
        </div>
      )}
      
      {ticket.unread_count_agent > 0 && userType === 'agent' && (
        <div className="unread-indicator">
          {ticket.unread_count_agent} new message{ticket.unread_count_agent > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default TicketHeader;
