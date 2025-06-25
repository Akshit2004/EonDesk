import { useEffect, useState, useRef } from 'react';
import { getTicketMessages, addMessageToTicket } from '../../services/ticketApi';
import { ArrowLeft, Reply, Send, User, Headphones, Clock, ChevronDown, ChevronUp, Mail, MessageSquare, CornerDownRight, Quote, Hash } from 'lucide-react';
import './ChatThread.css';

function formatForumDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export default function ChatThread({ ticket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [collapsedThreads, setCollapsedThreads] = useState(new Set());
  const [hoveredThread, setHoveredThread] = useState(null);
  const [showCount, setShowCount] = useState(20); // For pagination
  const chatEndRef = useRef(null);

  // Build thread structure from flat messages
  const buildThreadStructure = (flatMessages) => {
    const messageMap = new Map();
    const threads = [];
    
    // First pass: create message map
    flatMessages.forEach(msg => {
      messageMap.set(msg.id, { ...msg, children: [] });
    });
    
    // Second pass: build hierarchy
    flatMessages.forEach(msg => {
      if (msg.reply_to && messageMap.has(msg.reply_to)) {
        messageMap.get(msg.reply_to).children.push(messageMap.get(msg.id));
      } else {
        threads.push(messageMap.get(msg.id));
      }
    });
    
    return threads;
  };

  // Get thread depth for a message
  const getThreadDepth = (messageId, threadStructure, depth = 0) => {
    for (const thread of threadStructure) {
      if (thread.id === messageId) return depth;
      const childDepth = getThreadDepthInChildren(messageId, thread.children, depth + 1);
      if (childDepth !== -1) return childDepth;
    }
    return 0;
  };

  const getThreadDepthInChildren = (messageId, children, depth) => {
    for (const child of children) {
      if (child.id === messageId) return depth;
      const childDepth = getThreadDepthInChildren(messageId, child.children, depth + 1);
      if (childDepth !== -1) return childDepth;
    }
    return -1;
  };

  // Get all message IDs in a thread
  const getThreadMessageIds = (message) => {
    const ids = [message.id];
    (message.children || []).forEach(child => {
      ids.push(...getThreadMessageIds(child));
    });
    return ids;
  };  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      setError('');
        // Create the initial ticket message
      const initialMessage = {
        id: 'initial',
        content: ticket.description || ticket.message || ticket.title || 'Support ticket created',
        sender: 'customer',
        sender_type: 'customer',
        sender_name: ticket.customer_name || 'Customer',
        timestamp: ticket.created_at || new Date(),
        message_type: 'public',
        reply_to: null
      };

      try {
        const result = await getTicketMessages(ticket.ticket_id);
        if (result.success && Array.isArray(result.messages)) {
          const allMessages = [initialMessage, ...result.messages];
          setMessages(allMessages);
          const latestIndices = allMessages.slice(-3).map((_, index) => allMessages.length - 3 + index).filter(i => i >= 0);
          setExpandedMessages(new Set([0, ...latestIndices]));
        } else {
          // If API fails or returns invalid data, just show the initial message
          setMessages([initialMessage]);
          setExpandedMessages(new Set([0]));
          if (result.error) {
            setError(`Failed to load messages: ${result.error}`);
          }
        }
      } catch (error) {
        // Fallback: show just the initial message
        setMessages([initialMessage]);
        setExpandedMessages(new Set([0]));
        setError(`Failed to load messages: ${error.message}`);
      }
      
      setLoading(false);
    }
    fetchMessages();
  }, [ticket.ticket_id]);useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);  const handleReply = async (messageId, parentMessage) => {
    if (!replyText.trim()) return;
    setSending(true);
    setError('');
    
    try {
      const messageData = {
        content: replyText.trim(),
        sender_id: 'customer', // or get from context
        sender_type: 'customer',
        sender_name: ticket.customer_name || 'Customer',
        message_type: 'public',
        attachments: [],
        read_by: [],
        reply_to: parentMessage ? parentMessage.id : null
      };
      
      const result = await addMessageToTicket(ticket.ticket_id, messageData);
      if (result.success) {
        setReplyText('');
        setReplyingTo(null);
        
        // Refetch messages
        const msgResult = await getTicketMessages(ticket.ticket_id);
        if (msgResult.success && Array.isArray(msgResult.messages)) {          const initialMessage = {
            id: 'initial',
            content: ticket.description || ticket.message || ticket.title || 'Support ticket created',
            sender: 'customer',
            sender_type: 'customer',
            sender_name: ticket.customer_name || 'Customer',
            timestamp: ticket.created_at || new Date(),
            message_type: 'public',
            reply_to: null
          };
          setMessages([initialMessage, ...msgResult.messages]);
        } else {
          setError('Failed to refresh messages after sending');
        }
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError(`Failed to send message: ${err.message}`);
    }
    setSending(false);
  };
  const toggleMessage = (messageId) => {
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

  const toggleThread = (messageId) => {
    setCollapsedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const findParentMessage = (messageId, allMessages) => {
    const message = allMessages.find(m => m.id === messageId);
    if (!message?.reply_to) return null;
    return allMessages.find(m => m.id === message.reply_to);
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let lastDate = null;
    msgs.forEach((msg) => {
      const msgDate = new Date(msg.timestamp).toDateString();
      if (msgDate !== lastDate) {
        groups.push({ type: 'date', date: msgDate });
        lastDate = msgDate;
      }
      groups.push({ type: 'msg', msg });
    });
    return groups;
  };

  const renderMessage = (message, threadStructure, allMessages, depth = 0) => {
    const isExpanded = expandedMessages.has(message.id);
    const isCustomer = (message.sender === 'customer' || message.sender_type === 'customer');
    const isReplying = replyingTo === message.id;
    const hasReplies = message.children && message.children.length > 0;
    const isThreadCollapsed = collapsedThreads.has(message.id);
    const parentMessage = findParentMessage(message.id, allMessages);
    const threadIds = getThreadMessageIds(message);
    
    return (
      <div key={message.id} className="thread-container">
        <div 
          className={`thread-message ${isCustomer ? 'from-customer' : 'from-agent'} ${isExpanded ? 'expanded' : 'collapsed'} depth-${Math.min(depth, 3)}`}
          style={{ '--thread-depth': depth }}
          onMouseEnter={() => setHoveredThread(threadIds)}
          onMouseLeave={() => setHoveredThread(null)}
        >
          {/* Thread connector line */}
          {depth > 0 && (
            <div className="thread-connector">
              <div className="connector-line"></div>
              <CornerDownRight className="connector-icon" />
            </div>
          )}
          
          <div 
            className="message-header"
            onClick={() => toggleMessage(message.id)}
          >
            <div className="sender-info">
              <div className={`sender-avatar ${hoveredThread?.includes(message.id) ? 'highlighted' : ''}`}>
                {isCustomer ? (
                  <User className="avatar-icon customer" />
                ) : (
                  <Headphones className="avatar-icon agent" />
                )}
              </div>
              <div className="sender-details">
                <div className="sender-name">
                  {message.sender_name || (isCustomer ? (ticket.customer_name || 'Customer') : 'Support Agent')}
                  {depth > 0 && (
                    <span className="thread-indicator">
                      <Hash className="thread-icon" />
                      {depth}
                    </span>
                  )}
                </div>
                <div className="message-meta">
                  <Clock className="time-icon" />
                  <span className="message-time">
                    {formatForumDate(message.timestamp)}
                  </span>
                  {hasReplies && (
                    <span className="reply-count">
                      {message.children.length} {message.children.length === 1 ? 'reply' : 'replies'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="message-actions-header">
              {hasReplies && (
                <button 
                  className="thread-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleThread(message.id);
                  }}
                >
                  {isThreadCollapsed ? 'Expand Thread' : 'Collapse Thread'}
                </button>
              )}
              <button className="expand-toggle">
                {isExpanded ? (
                  <ChevronUp className="toggle-icon" />
                ) : (
                  <ChevronDown className="toggle-icon" />
                )}
              </button>
            </div>
          </div>
          
          {/* Parent message reference */}
          {parentMessage && isExpanded && (
            <div className="parent-reference">
              <Quote className="quote-icon" />
              <span className="parent-info">
                In reply to {parentMessage.sender_name || (parentMessage.sender_type === 'customer' ? ticket.customer_name || 'Customer' : 'Support Agent')}
              </span>
              <div className="parent-preview">
                "{parentMessage.content.substring(0, 80)}{parentMessage.content.length > 80 ? '...' : ''}"
              </div>
            </div>
          )}
          
          {!isExpanded && (
            <div className="message-preview">
              {message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content}
            </div>
          )}
          
          {isExpanded && (
            <>
              <div className="message-content">
                {message.quoted_text && (
                  <div className="quoted-message">
                    <Quote className="quote-icon" />
                    <div className="quote-content">
                      <div className="quote-author">{message.quoted_author}:</div>
                      <div className="quote-text">"{message.quoted_text}"</div>
                    </div>
                  </div>
                )}
                <div className="content-text">{message.content}</div>
              </div>
              
              <div className="message-actions">
                <button 
                  className="reply-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplyingTo(isReplying ? null : message.id);
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
                      <span>Replying to {message.sender_name || (isCustomer ? (ticket.customer_name || 'Customer') : 'Support Agent')}</span>
                    </div>
                  </div>
                  <div className="quoted-context">
                    <Quote className="quote-icon" />
                    <div className="context-text">
                      "{message.content.substring(0, 100)}{message.content.length > 100 ? '...' : ''}"
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
                      onClick={() => handleReply(message.id, message)}
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
        
        {/* Render child messages (replies) */}
        {hasReplies && !isThreadCollapsed && (
          <div className="thread-replies">
            {message.children.map(child => 
              renderMessage(child, threadStructure, allMessages, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };
  useEffect(() => {
    // Remove modal-open class for dashboard embedding
    document.body.classList.remove('modal-open');
    return () => {};
  }, []);
  return (
    <div className="chat-thread-embedded">
      <div className="chat-thread-container forum-centered">
        <div className="thread-header">
          {onBack && (
            <button className="back-btn" onClick={onBack} title="Close">
              <span style={{fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1}}>&times;</span>
            </button>
          )}
          <div className="header-info">
            <div className="ticket-subject">
              <MessageSquare className="thread-icon" />
              <h2>Discussion: {ticket.ticketId}</h2>
            </div>
            <div className="ticket-meta">
              <span className="ticket-priority">Priority: {ticket.priority || 'Medium'}</span>
              <span className="message-count">{messages.length} messages</span>
            </div>
            <div className="thread-summary">
              <b>Summary:</b> {ticket.description || ticket.message || ticket.title || 'Support ticket'}
            </div>
          </div>
        </div>
        <div className="thread-content">
          {loading ? (
            <div className="thread-loading">
              <MessageSquare className="loading-icon" />
              Loading discussion...
            </div>
          ) : (
            messages.length === 0 ? (
              <div className="thread-empty">
                <MessageSquare className="empty-icon" />
                No messages in this discussion.
              </div>
            ) : (
              <div className="thread-messages">
                {messages.length > showCount && (
                  <button className="load-more-btn" onClick={() => setShowCount(showCount + 20)}>
                    Load more messages
                  </button>
                )}
                {groupMessagesByDate(messages.slice(-showCount)).map((item, idx) =>
                  item.type === 'date' ? (
                    <div key={item.date + idx} className="date-separator">{item.date}</div>
                  ) : (
                    renderMessage(item.msg, buildThreadStructure(messages), messages, 0)
                  )
                )}
              </div>
            )
          )}
          <div ref={chatEndRef} />
        </div>
        {error && (
          <div className="error-notification">
            <span className="error-text">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
