import { useEffect, useState, useRef } from 'react';
import { getTicketMessages, addMessageToTicket } from '../../firebase/tickets';
import { ArrowLeft, Reply, Send, User, Headphones, Clock, ChevronDown, ChevronUp, Mail, MessageSquare } from 'lucide-react';
import './ChatThread.css';

export default function ChatThread({ ticket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // Changed from showReply
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const chatEndRef = useRef(null);
  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      setError('');
      
      // Create the initial ticket message
      const initialMessage = {
        id: 'initial',
        content: ticket.description || ticket.message || 'No description provided',
        sender: 'customer',
        timestamp: ticket.createdAt || new Date(),
        message_type: 'public'
      };
      
      const result = await getTicketMessages(ticket.id);      if (result.success) {
        // Combine initial message with subsequent replies
        const allMessages = [initialMessage, ...result.messages];
        setMessages(allMessages);
        // Auto-expand the latest message and initial message
        const latestIndex = allMessages.length - 1;
        setExpandedMessages(new Set([0, latestIndex]));
      } else {
        // If we can't load messages, at least show the initial ticket
        setMessages([initialMessage]);
        setExpandedMessages(new Set([0]));
      }
      setLoading(false);
    }
    fetchMessages();
  }, [ticket.id]);  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);  const handleReply = async (messageId, messageIndex) => {
    if (!replyText.trim()) return;
    setSending(true);
    setError('');
    try {
      await addMessageToTicket(ticket.id, {
        sender_id: ticket.customer_email || 'customer',
        sender_type: 'customer',
        sender_name: ticket.customer_name || 'Customer',
        content: replyText.trim(),
        message_type: 'public',
        reply_to: messageId, // Add reference to the message being replied to
      });
      setReplyText('');
      setReplyingTo(null);
      // Reload messages to include the new reply
      const result = await getTicketMessages(ticket.id);
      if (result.success) {
        const initialMessage = {
          id: 'initial',
          content: ticket.description || ticket.message || 'No description provided',
          sender: 'customer',
          timestamp: ticket.createdAt || new Date(),
          message_type: 'public'
        };        const allMessages = [initialMessage, ...result.messages];
        setMessages(allMessages);
        // Auto-expand the latest message
        const latestIndex = allMessages.length - 1;
        setExpandedMessages(prev => new Set([...prev, latestIndex]));
      }
    } catch (e) {
      setError('Failed to send reply.');
    }
    setSending(false);
  };

  const toggleMessage = (index) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (    <div className="chat-thread-container">
      <div className="email-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft className="back-icon" />
        </button>
        <div className="header-info">
          <div className="ticket-subject">
            <Mail className="mail-icon" />
            <h2>Support Ticket: {ticket.ticketId}</h2>
          </div>
          <div className="ticket-meta">
            <span className="status-badge status-{ticket.status?.toLowerCase() || 'open'}">
              {ticket.status || 'Open'}
            </span>
            <span className="ticket-priority">Priority: {ticket.priority || 'Medium'}</span>
          </div>
        </div>
      </div>
      
      <div className="email-thread">
        {loading ? (
          <div className="thread-loading">
            <MessageSquare className="loading-icon" />
            Loading conversation...
          </div>
        ) : (
          messages.length === 0 ? (
            <div className="thread-empty">
              <Mail className="empty-icon" />
              No messages in this thread.
            </div>
          ) : (
            messages.map((msg, index) => {
              const isExpanded = expandedMessages.has(index);
              const isCustomer = (msg.sender === 'customer' || msg.sender_type === 'customer');
              const isReplying = replyingTo === index;
              
              return (
                <div 
                  key={msg.id} 
                  className={`email-message ${isCustomer ? 'from-customer' : 'from-agent'} ${isExpanded ? 'expanded' : 'collapsed'}`}
                >
                  <div 
                    className="email-message-header"
                    onClick={() => toggleMessage(index)}
                  >
                    <div className="sender-info">
                      <div className="sender-avatar">
                        {isCustomer ? (
                          <User className="avatar-icon customer" />
                        ) : (
                          <Headphones className="avatar-icon agent" />
                        )}
                      </div>
                      <div className="sender-details">
                        <div className="sender-name">
                          {isCustomer ? (ticket.customer_name || 'Customer') : 'Support Agent'}
                        </div>
                        <div className="sender-email">
                          {isCustomer ? (ticket.customer_email || 'customer@email.com') : 'support@company.com'}
                        </div>
                      </div>
                    </div>
                    <div className="message-meta">
                      <div className="message-time">
                        <Clock className="time-icon" />
                        {msg.timestamp?.toLocaleString?.() || new Date().toLocaleString()}
                      </div>
                      <button className="expand-toggle">
                        {isExpanded ? (
                          <ChevronUp className="toggle-icon" />
                        ) : (
                          <ChevronDown className="toggle-icon" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {!isExpanded && (
                    <div className="message-preview">
                      {msg.content.length > 80 ? msg.content.substring(0, 80) + '...' : msg.content}
                    </div>
                  )}
                  
                  {isExpanded && (
                    <>
                      <div className="message-content">
                        <div className="content-text">{msg.content}</div>
                      </div>
                      
                      <div className="message-actions">
                        <button 
                          className="reply-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReplyingTo(isReplying ? null : index);
                            setReplyText('');
                          }}
                        >
                          <Reply className="reply-icon" />
                          {isReplying ? 'Cancel Reply' : 'Reply'}
                        </button>
                      </div>
                      
                      {isReplying && (
                        <div className="reply-composer">
                          <div className="reply-header">
                            <div className="reply-to-info">
                              <Reply className="reply-to-icon" />
                              <span>Replying to {isCustomer ? (ticket.customer_name || 'Customer') : 'Support Agent'}</span>
                            </div>
                          </div>
                          <textarea
                            className="reply-textarea"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            rows={4}
                            disabled={sending}
                            autoFocus
                          />
                          <div className="reply-actions">
                            <button 
                              className="reply-cancel-btn" 
                              onClick={() => { 
                                setReplyingTo(null); 
                                setReplyText(''); 
                              }}
                              disabled={sending}
                            >
                              Cancel
                            </button>
                            <button 
                              className="reply-send-btn" 
                              onClick={() => handleReply(msg.id, index)}
                              disabled={sending || !replyText.trim()}
                            >
                              <Send className="send-icon" />
                              {sending ? 'Sending...' : 'Send Reply'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          ))}
        <div ref={chatEndRef} />
      </div>
      
      {error && (
        <div className="error-notification">
          <span className="error-text">{error}</span>
        </div>
      )}
    </div>
  );
}
