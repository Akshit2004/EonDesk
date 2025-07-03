import React, { useState, useEffect, useRef } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaCalendar, 
  FaTag, 
  FaPaperPlane, 
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaPaperclip
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
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [ticket.ticket_id]);

  useEffect(() => {
    if (!loading && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [loading, messages]);

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

        {/* Enhanced Messages Section */}
        <div className="messages-section">
          <div className="messages-container" ref={messagesContainerRef}>
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
              messages.map((message, index) => (
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
              ))
            )}
          </div>
        </div>

        {/* Enhanced Reply Form */}
        {!currentUser && (
          <div className="not-logged-in-warning" style={{
            color: '#e53e3e',
            background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
            border: '1px solid #fc8181',
            borderRadius: 10,
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            fontWeight: 500,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
          }}>
            <FaExclamationCircle style={{ marginRight: 8 }} />
            You are not logged in, try to login again.
          </div>
        )}
        <form onSubmit={handleSendMessage} className="reply-form">
          <div className="form-header">
            <h4>Reply to Customer</h4>
          </div>
          <div className="form-content">
            <div className="reply-input-wrapper">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your professional response here..."
                rows={4}
                disabled={sending || !currentUser}
                className="message-textarea"
              />
              <div className="reply-actions-inside">
                <label className="attachment-btn" title="Attach file">
                  <FaPaperclip />
                  <input
                    type="file"
                    onChange={handleAttachmentChange}
                    disabled={sending || uploading || !currentUser}
                    multiple
                    style={{ display: 'none' }}
                  />
                </label>
                <button 
                  type="submit" 
                  disabled={(!newMessage.trim() && attachments.length === 0) || sending || !currentUser}
                  className="send-btn"
                  title="Send"
                >
                  {sending ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                </button>
              </div>
            </div>
            {attachments.length > 0 && (
              <div className="attached-files-list">
                {attachments.map(f => f.name).join(', ')}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
