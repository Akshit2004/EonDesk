import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, currentUser, isOwn }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return messageTime.toLocaleDateString();
  };

  const getSenderTypeClass = () => {
    switch (message.sender_type) {
      case 'customer':
        return 'message-customer';
      case 'agent':
        return 'message-agent';
      case 'system':
        return 'message-system';
      default:
        return 'message-default';
    }
  };

  const getSenderName = () => {
    if (message.sender_type === 'system') return 'System';
    if (isOwn) return 'You';
    return message.sender_name || message.sender_id;
  };

  return (
    <div className={`message-bubble ${getSenderTypeClass()} ${isOwn ? 'own' : 'other'}`}>
      {message.sender_type === 'system' ? (
        <div className="system-message">
          <span className="system-icon">ℹ️</span>
          <span className="system-text">{message.content}</span>
          <span className="message-time">{formatTimestamp(message.timestamp)}</span>
        </div>
      ) : (
        <>
          <div className="message-header">
            <span className="sender-name">{getSenderName()}</span>
            <span className="message-time">{formatTimestamp(message.timestamp)}</span>
          </div>
          
          <div className="message-content">
            {message.content}
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="message-attachments">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="attachment">
                  <span className="attachment-icon">📎</span>
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="attachment-link"
                  >
                    {attachment.name}
                  </a>
                </div>
              ))}
            </div>
          )}

          {message.message_type === 'internal' && (
            <div className="internal-note-badge">
              Internal Note
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessageBubble;
