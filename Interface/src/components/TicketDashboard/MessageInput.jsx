import React, { useState } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, disabled, placeholder = 'Type your message...' }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;
    if (disabled) return;

    const messageData = {
      content: message.trim(),
      attachments: attachments
    };

    await onSendMessage(messageData);
    setMessage('');
    setAttachments([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    // Here you would implement file upload to your storage service
    // For now, we'll just simulate the attachment
    try {
      const newAttachments = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // In production, upload to storage and get real URL
      }));
      
      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="message-input-container">
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((attachment, index) => (
            <div key={index} className="attachment-preview">
              <span className="attachment-name">{attachment.name}</span>
              <button 
                type="button"
                onClick={() => removeAttachment(index)}
                className="remove-attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-row">
          <div className="message-input-wrapper">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="message-input"
              rows="1"
              style={{
                minHeight: '40px',
                maxHeight: '120px',
                resize: 'none'
              }}
            />
          </div>
          
          <div className="input-actions">
            <label className="attach-button" disabled={disabled || isUploading}>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={disabled || isUploading}
                style={{ display: 'none' }}
              />
              📎
            </label>
            
            <button
              type="submit"
              disabled={disabled || (!message.trim() && attachments.length === 0)}
              className="send-button"
            >
              {disabled ? '...' : '➤'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
