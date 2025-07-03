import React, { useState } from 'react';
import { FaTimes, FaUser, FaCalendar, FaTag, FaPaperPlane } from 'react-icons/fa';
import { uploadAttachments, getAttachmentUrl, isAllowedFileType } from '../../../services/fileUploadHelper';
import './CustomerTicketDetailsModal.css';

const CustomerTicketDetailsModal = ({ ticket, onClose, customerNo }) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (ticket?.ticket_id) {
      fetchMessages();
    }
  }, [ticket]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3001/tickets/${ticket.ticket_id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    // Filter allowed types
    const allowed = files.filter(isAllowedFileType);
    setAttachments(allowed);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;
    setSending(true);
    let uploadedFiles = [];
    try {
      if (attachments.length > 0) {
        setUploading(true);
        const uploadRes = await uploadAttachments(ticket.ticket_id, attachments);
        uploadedFiles = uploadRes.attachments || [];
        setUploading(false);
      }
      const response = await fetch(`http://localhost:3001/tickets/${ticket.ticket_id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          sender_type: 'customer',
          sender_name: `Customer ${customerNo}`,
          customer_no: customerNo,
          attachments: uploadedFiles
        })
      });
      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        setAttachments([]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'status-open';
      case 'inprogress':
      case 'in_progress': return 'status-progress';
      case 'resolved':
      case 'closed': return 'status-resolved';
      default: return 'status-open';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'urgent': return 'priority-urgent';
      default: return 'priority-medium';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="customer-ticket-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h2>Ticket Details</h2>
            <span className="ticket-id-badge">{ticket.ticket_id}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Ticket Info */}
        <div className="ticket-info">
          <div className="info-grid">
            <div className="info-item">
              <FaTag className="info-icon" />
              <div>
                <span className="info-label">Subject</span>
                <span className="info-value">{ticket.title || ticket.subject || 'No Subject'}</span>
              </div>
            </div>
            
            <div className="info-item">
              <FaCalendar className="info-icon" />
              <div>
                <span className="info-label">Created</span>
                <span className="info-value">{formatDate(ticket.created_at)}</span>
              </div>
            </div>
            
            <div className="info-item">
              <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                {ticket.status || 'Open'}
              </span>
            </div>
            
            <div className="info-item">
              <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                {ticket.priority || 'Medium'} Priority
              </span>
            </div>
          </div>
          
          {ticket.description && (
            <div className="ticket-description">
              <h4>Description</h4>
              <p>{ticket.description}</p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="messages-section">
          <h3>Conversation</h3>
          <div className="messages-container">
            {loading ? (
              <div className="loading-messages">
                <div className="loading-spinner"></div>
                <p>Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              (showAllMessages ? messages : messages.slice(-5)).map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.sender_type === 'customer' ? 'customer-message' : 'agent-message'}`}
                >
                  <div className="message-header">
                    <div className="message-sender">
                      <FaUser className="sender-icon" />
                      <span className="sender-name">
                        {message.sender_name || (message.sender_type === 'customer' ? 'You' : 'Support Agent')}
                      </span>
                    </div>
                    <span className="message-timestamp">{formatDate(message.timestamp)}</span>
                  </div>
                  <div className="message-content">{message.content}</div>
                  {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
                    <div className="message-attachments">
                      {message.attachments.map((file, idx) => (
                        <a
                          key={idx}
                          href={getAttachmentUrl(file.filename || file.path?.split('/').pop())}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-link"
                        >
                          {file.originalname || file.filename || 'Attachment'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            {messages.length > 5 && !showAllMessages && !loading && (
              <button className="show-all-btn" onClick={() => setShowAllMessages(true)}>
                Show all messages ({messages.length})
              </button>
            )}
            {messages.length > 5 && showAllMessages && !loading && (
              <button className="show-all-btn" onClick={() => setShowAllMessages(false)}>
                Show only recent 5
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSendMessage} className="reply-form">
          <div className="form-header">
            <h4>Reply to Ticket</h4>
          </div>
          <div className="form-content">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              disabled={sending}
              className="message-textarea"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <input
                type="file"
                onChange={handleAttachmentChange}
                disabled={sending || uploading}
                style={{ fontSize: '0.95rem' }}
                multiple
              />
              {attachments.length > 0 && (
                <span style={{ fontSize: '0.95rem', color: '#2563eb' }}>
                  {attachments.map(f => f.name).join(', ')}
                </span>
              )}
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                disabled={(!newMessage.trim() && attachments.length === 0) || sending}
                className="send-btn"
              >
                <FaPaperPlane />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerTicketDetailsModal;
