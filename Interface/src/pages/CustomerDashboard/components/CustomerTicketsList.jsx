import React from 'react';
import { FaEye, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './CustomerTicketsList.css';

const CustomerTicketsList = ({ 
  tickets, 
  onTicketClick, 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading 
}) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <FaClock className="status-icon status-open" />;
      case 'inprogress':
      case 'in_progress':
        return <FaExclamationTriangle className="status-icon status-progress" />;
      case 'resolved':
      case 'closed':
        return <FaCheckCircle className="status-icon status-resolved" />;
      default:
        return <FaClock className="status-icon status-open" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'status-badge status-open';
      case 'inprogress':
      case 'in_progress':
        return 'status-badge status-progress';
      case 'resolved':
      case 'closed':
        return 'status-badge status-resolved';
      default:
        return 'status-badge status-open';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="tickets-loading">
        <div className="loading-spinner"></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="no-tickets">
        <div className="no-tickets-icon">🎫</div>
        <h3>No tickets found</h3>
        <p>You haven't created any support tickets yet.</p>
      </div>
    );
  }

  return (
    <div className="customer-tickets-list">
      <div className="tickets-table">
        <div className="table-header">
          <div className="header-cell">Ticket ID</div>
          <div className="header-cell">Subject</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Priority</div>
          <div className="header-cell">Created</div>
          <div className="header-cell">Actions</div>
        </div>
        
        <div className="table-body">
          {tickets.map((ticket) => (
            <div key={ticket.ticket_id} className="table-row">
              <div className="table-cell ticket-id">
                <span className="ticket-id-badge">
                  {ticket.ticket_id}
                </span>
              </div>
              
              <div className="table-cell ticket-subject">
                <div className="subject-content">
                  <h4 className="subject-title">
                    {ticket.title || ticket.subject || 'No Subject'}
                  </h4>
                  <p className="subject-description">
                    {ticket.description?.substring(0, 80)}
                    {ticket.description?.length > 80 ? '...' : ''}
                  </p>
                </div>
              </div>
              
              <div className="table-cell ticket-status">
                <span className={getStatusClass(ticket.status)}>
                  {getStatusIcon(ticket.status)}
                  {ticket.status || 'Open'}
                </span>
              </div>
              
              <div className="table-cell ticket-priority">
                <span className={`priority-badge priority-${ticket.priority?.toLowerCase() || 'medium'}`}>
                  {ticket.priority || 'Medium'}
                </span>
              </div>
              
              <div className="table-cell ticket-date">
                {formatDate(ticket.created_at)}
              </div>
              
              <div className="table-cell ticket-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() => onTicketClick(ticket)}
                  title="View Details"
                >
                  <FaEye />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerTicketsList;
