import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaCalendar, 
  FaTag, 
  FaPaperPlane, 
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import { getTicketMessages, addMessageToTicket, updateTicketStatus } from '../../../services/postgresAgentApi';
import { uploadAttachments, getAttachmentUrl, isAllowedFileType } from '../../../services/fileUploadHelper';
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
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [ticket.ticket_id]);

  const fetchMessages = async () => {
    try {
      const result = await getTicketMessages(ticket.ticket_id);
      if (result.success) {
        setMessages(result.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = files.filter(isAllowedFileType);
    setAttachments(allowed);
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || sending) return;
    
    if (!currentUser) {
      console.error('No current user found. Cannot send message.');
      return;
    }

    setSending(true);
    let uploadedFiles = [];
    try {
      if (attachments.length > 0) {
        setUploading(true);
        const uploadRes = await uploadAttachments(ticket.ticket_id || ticket.id, attachments);
        uploadedFiles = uploadRes.attachments || [];
        setUploading(false);
      }
      const messageData = {
        content: newMessage,
        sender_id: currentUser.uid || currentUser.email || 'agent',
        sender_type: 'agent',
        sender_name: currentUser.displayName || currentUser.email || 'Support Agent',
        message_type: 'public',
        attachments: uploadedFiles,
        read_by: []
      };

      await addMessageToTicket(ticket.ticket_id || ticket.id, messageData);
      setNewMessage('');
      setAttachments([]);
      await fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onStatusUpdate(ticket.ticket_id || ticket.id, newStatus);
      onClose(); // Close modal after status update
    } catch (error) {
      console.error('Error updating status:', error);
    }
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
      case 'urgent': 
      case 'critical': return 'priority-urgent';
      default: return 'priority-medium';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low': return FaCheckCircle;
      case 'medium': return FaClock;
      case 'high': return FaExclamationCircle;
      case 'urgent':
      case 'critical': return FaExclamationCircle;
      default: return FaClock;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getRelativeTime = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="agent-ticket-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modern Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h2>Ticket Details</h2>
            <span className="ticket-id-badge">
              #{ticket.ticketId || ticket.ticket_id || 'N/A'}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>

        {/* Enhanced Ticket Information */}
        <div className="ticket-info">
          <div className="info-grid compact-info-grid">
            <div className="info-item compact-info-item">
              <FaTag className="info-icon" />
              <span className="info-label">Subject</span>
              <span className="info-value">{ticket.title || ticket.subject || 'No Subject'}</span>
            </div>
            <div className="info-item compact-info-item">
              <FaCalendar className="info-icon" />
              <span className="info-label">Created</span>
              <span className="info-value">{formatDate(ticket.created_at || ticket.createdAt)}</span>
              <span className="info-label" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{getRelativeTime(ticket.created_at || ticket.createdAt)}</span>
            </div>
            <div className="info-item compact_info_item">
              <div className={`status-badge ${getStatusClass(ticket.status)}`}>
                {ticket.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
              </div>
            </div>
            <div className="info-item compact-info-item">
              {React.createElement(getPriorityIcon(ticket.priority), { 
                className: "info-icon",
                style: { background: 'transparent', padding: 0 }
              })}
              <div className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                {ticket.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
              </div>
            </div>
          </div>
          
          {ticket.description && (
            <div className="ticket-description">
              <h4>📝 Description</h4>
              <p>{ticket.description}</p>
            </div>
          )}
        </div>

        {/* Enhanced Messages Section */}
        <div className="messages-section">
          <h3>Conversation History</h3>
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
              <>
                {(showAllMessages ? messages : messages.slice(-5)).map((message, index) => (
                  <div
                    key={`${message.id || index}-${message.timestamp}`}
                    className={`message ${message.sender_type === 'agent' ? 'agent-message' : 'customer-message'}`}
                  >
                    <div className="message-header">
                      <div className="message-sender">
                        <FaUser className="sender-icon" />
                        <span className="sender-name">
                          {message.sender_name || 
                           (message.sender_type === 'agent' ? 'Support Agent' : 'Customer')}
                        </span>
                      </div>
                      <span className="message-timestamp">
                        {getRelativeTime(message.timestamp || message.created_at)}
                      </span>
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
                ))}
                
                {messages.length > 5 && (
                  <button 
                    className="show-all-btn" 
                    onClick={() => setShowAllMessages(!showAllMessages)}
                  >
                    {showAllMessages 
                      ? '📁 Show recent messages only' 
                      : `📂 Show all ${messages.length} messages`
                    }
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Enhanced Reply Form */}
        <form onSubmit={handleSendMessage} className="reply-form">
          <div className="form-header">
            <h4>Reply to Customer</h4>
          </div>
          <div className="form-content">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your professional response here..."
              rows={4}
              disabled={sending}
              className="message-textarea"
            />
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
            <div className="form-actions">
              <button 
                type="submit" 
                disabled={!newMessage.trim() && attachments.length === 0 || sending}
                className="send-btn"
              >
                {sending ? (
                  <>
                    <FaSpinner className="spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Response
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
