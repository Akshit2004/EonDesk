import React, { useState, useEffect, useRef } from 'react';
import { 
  subscribeToTicketMessages, 
  subscribeToTicket, 
  addMessageToTicket, 
  markMessagesAsRead 
} from '../../firebase/tickets';
import TicketHeader from './TicketHeader';
import './TicketThread.css';

// Gmail-style Message Component
const GmailMessage = ({ message, currentUser, isExpanded, onToggle, onReply }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.floor((now - messageTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return messageTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: messageTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getSenderAvatar = (senderType, senderName) => {
    const initial = senderName ? senderName.charAt(0).toUpperCase() : '?';
    return (
      <div className={`sender-avatar ${senderType}`}>
        {initial}
      </div>
    );
  };

  const getSenderName = () => {
    if (message.sender_type === 'system') return 'System';
    if (message.sender_id === currentUser?.email) return 'You';
    return message.sender_name || message.sender_id;
  };

  const getMessagePreview = (content) => {
    return content.length > 80 ? content.substring(0, 80) + '...' : content;
  };

  if (message.sender_type === 'system') {
    return (
      <div className="message-item system-message">
        <div className="message-header-row">
          <div className="message-sender-info">
            {getSenderAvatar('system', 'System')}
            <div className="sender-details">
              <p className="sender-name">System</p>
            </div>
          </div>
          <div className="message-timestamp">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
        <div className="message-expanded">
          <div style={{ 
            padding: '12px 16px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            borderLeft: '4px solid #34a853',
            fontStyle: 'italic'
          }}>
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-item ${isExpanded ? 'message-expanded-state' : 'message-collapsed'}`}>
      <div className="message-header-row" onClick={onToggle}>
        <div className="message-sender-info">
          {getSenderAvatar(message.sender_type, getSenderName())}
          <div className="sender-details">
            <p className="sender-name">{getSenderName()}</p>
            <p className="sender-email">{message.sender_id}</p>
          </div>
        </div>
        <div className="message-status-badges">
          {message.message_type === 'internal' && (
            <span className="status-badge internal">Internal</span>
          )}
          {message.sender_id === currentUser?.email && (
            <span className="status-badge">Sent</span>
          )}
        </div>
        <div className="message-timestamp">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
      
      <div className="message-preview">
        {getMessagePreview(message.content)}
      </div>
      
      <div className="message-expanded">
        <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {message.content}
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="attachment-item">
                <div className="attachment-icon">📎</div>
                <div className="attachment-info">
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="attachment-name"
                  >
                    {attachment.name}
                  </a>
                  <div className="attachment-size">
                    {attachment.size ? `${Math.round(attachment.size / 1024)}KB` : ''}
                  </div>
                </div>
              </div>            ))}
          </div>
        )}
        
        {isExpanded && (
          <div className="message-actions">
            <button 
              className="message-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onReply();
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
              </svg>
              Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TicketThread = ({ ticketId, currentUser, userType = 'customer' }) => {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-expand the last message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setExpandedMessages(prev => new Set([...prev, lastMessage.id]));
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to ticket updates
  useEffect(() => {
    if (!ticketId) return;

    const unsubscribeTicket = subscribeToTicket(ticketId, (ticketData) => {
      setTicket(ticketData);
      setLoading(false);
    });

    const unsubscribeMessages = subscribeToTicketMessages(ticketId, (messagesData) => {
      setMessages(messagesData);
      setLoading(false);
    });

    return () => {
      unsubscribeTicket();
      unsubscribeMessages();
    };
  }, [ticketId]);

  // Mark messages as read when component loads or messages change
  useEffect(() => {
    if (ticketId && currentUser && messages.length > 0) {
      markMessagesAsRead(ticketId, currentUser.email, userType)
        .catch(error => console.error('Error marking messages as read:', error));
    }
  }, [ticketId, currentUser, messages, userType]);
  const handleSendMessage = async (messageData) => {
    if (!currentUser || !ticket) return;

    setSending(true);
    setError(null);

    try {
      const newMessageData = {
        content: messageData.content || replyContent,
        sender_id: currentUser.email,
        sender_type: userType,
        sender_name: currentUser.name || currentUser.email,
        message_type: 'public',
        attachments: messageData.attachments || []
      };

      await addMessageToTicket(ticketId, newMessageData);
      setReplyContent('');
      setShowReplyBox(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleReplyClick = () => {
    setShowReplyBox(true);
    setTimeout(() => {
      const textarea = document.querySelector('.reply-textarea');
      if (textarea) textarea.focus();
    }, 100);
  };

  const handleCancelReply = () => {
    setShowReplyBox(false);
    setReplyContent('');
  };

  const handleSendReply = () => {
    if (replyContent.trim()) {
      handleSendMessage({ content: replyContent.trim() });
    }
  };

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;
    
    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp);
      const dateKey = messageDate.toDateString();
      
      if (!currentGroup || currentGroup.dateKey !== dateKey) {
        currentGroup = {
          dateKey,
          date: messageDate,
          messages: []
        };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="ticket-thread-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversation...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-thread-error">
        <p>Ticket not found or you don't have permission to view it.</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="ticket-thread-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversation...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-thread-error">
        <p>Ticket not found or you don't have permission to view it.</p>
      </div>
    );
  }
  return (
    <div className="ticket-thread">
      <TicketHeader 
        ticket={ticket} 
        currentUser={currentUser} 
        userType={userType} 
      />
      
      <div className="messages-container">
        <div className="messages-list">
          {messageGroups.map((group, groupIndex) => (
            <div key={group.dateKey} className="message-thread-group">
              <div className="thread-header">
                <h3 className="thread-subject">
                  {group.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="thread-meta">
                  <span className="thread-count">
                    {group.messages.length} message{group.messages.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
                {group.messages.map((message) => (
                <GmailMessage
                  key={message.id}
                  message={message}
                  currentUser={currentUser}
                  isExpanded={expandedMessages.has(message.id)}
                  onToggle={() => toggleMessageExpansion(message.id)}
                  onReply={handleReplyClick}
                />
              ))}
            </div>
          ))}
          
          {messages.length === 0 && !loading && (
            <div className="empty-thread">
              <div className="empty-thread-content">
                <h3>No messages yet</h3>
                <p>Start the conversation by sending a message below.</p>
              </div>
            </div>
          )}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Gmail-style Reply Interface */}
      <div className="reply-section">
        {!showReplyBox ? (
          <div className="reply-actions">
            <button 
              className="reply-btn primary"
              onClick={handleReplyClick}
              disabled={ticket.status === 'resolved'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
              </svg>
              Reply
            </button>
            
            {userType === 'agent' && (
              <button 
                className="reply-btn secondary"
                onClick={() => {
                  setShowReplyBox(true);
                  // Could set internal note mode here
                }}
                disabled={ticket.status === 'resolved'}
              >
                Add Internal Note
              </button>
            )}
            
            {ticket.status === 'resolved' && (
              <p className="status-message">
                This ticket has been resolved. Reopen to continue the conversation.
              </p>
            )}
          </div>
        ) : (
          <div className="reply-composer">
            <div className="composer-header">
              <h4>Reply to this conversation</h4>
              <div className="composer-actions">
                <button 
                  className="composer-btn cancel"
                  onClick={handleCancelReply}
                  disabled={sending}
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <div className="composer-body">
              <textarea
                className="reply-textarea"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your reply..."
                rows={6}
                disabled={sending}
              />
            </div>
            
            <div className="composer-footer">
              <div className="composer-footer-left">
                <button className="attachment-btn" disabled={sending}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 12.5C2 9.46 4.46 7 7.5 7H18c2.21 0 4 1.79 4 4s-1.79 4-4 4H9.5C8.12 15 7 13.88 7 12.5S8.12 10 9.5 10H17v2H9.5c-.28 0-.5.22-.5.5s.22.5.5.5H18c1.1 0 2-.9 2-2s-.9-2-2-2H7.5C5.57 9 4 10.57 4 12.5S5.57 16 7.5 16H17v2H7.5C4.46 18 2 15.54 2 12.5z"/>
                  </svg>
                  Attach
                </button>
              </div>
              
              <div className="composer-footer-right">
                <button 
                  className="send-btn"
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || sending}
                >
                  {sending ? (
                    <>
                      <div className="sending-spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketThread;
