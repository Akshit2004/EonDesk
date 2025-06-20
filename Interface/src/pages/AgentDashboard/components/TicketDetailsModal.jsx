import React, { useState, useEffect } from 'react';
import { getTicketMessages, addMessageToTicket, updateTicketStatus } from '../../../firebase/tickets';
import './TicketDetailsModal.css';

const TicketDetailsModal = ({ 
  ticket, 
  onClose, 
  onStatusUpdate, 
  currentUser 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [ticket.id]);

  const fetchMessages = async () => {
    try {
      const result = await getTicketMessages(ticket.id);
      if (result.success) {
        setMessages(result.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        content: newMessage,
        sender_id: currentUser.uid,
        sender_type: 'agent',
        sender_name: currentUser.displayName || currentUser.email,
        message_type: 'public'
      };

      await addMessageToTicket(ticket.id, messageData);
      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onStatusUpdate(ticket.id, newStatus);
      onClose(); // Close modal after status update
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">          <div className="ticket-info">
            <h2>Ticket #{ticket.ticketId || ticket.ticket_id || 'N/A'}</h2>
            <span
              className="status-badge"
              style={{ backgroundColor: getStatusColor(ticket.status) }}
            >
              {ticket.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="ticket-details">
            <div className="detail-row">
              <span className="label">Customer:</span>
              <span className="value">{ticket.customer_name} ({ticket.customer_email})</span>
            </div>            <div className="detail-row">
              <span className="label">Subject:</span>
              <span className="value">{ticket.title}</span>
            </div>
            <div className="detail-row">
              <span className="label">Priority:</span>
              <span className="value priority" data-priority={ticket.priority}>
                {ticket.priority?.toUpperCase()}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Created:</span>
              <span className="value">{formatDate(ticket.createdAt)}</span>
            </div>
          </div>

          <div className="messages-section">
            <h3>Conversation</h3>
            <div className="messages-container">
              {loading ? (
                <div className="loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="no-messages">No messages yet</div>
              ) : (
                messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message ${message.sender_type === 'agent' ? 'agent-message' : 'customer-message'}`}
                  >
                    <div className="message-header">
                      <span className="sender">{message.sender_name}</span>
                      <span className="timestamp">{formatDate(message.timestamp)}</span>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="message-form">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your response..."
              rows={3}
              disabled={sending}
            />
            <div className="form-actions">
              <button type="submit" disabled={!newMessage.trim() || sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <div className="status-actions">
            <label>Update Status:</label>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="open">Open</option>
              <option value="inProgress">In Progress</option>
              <option value="waiting_for_customer">Waiting for Customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
