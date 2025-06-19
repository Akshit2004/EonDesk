import React, { useState, useEffect, useRef } from 'react';
import { 
  subscribeToTicketMessages, 
  subscribeToTicket, 
  addMessageToTicket, 
  markMessagesAsRead 
} from '../../firebase/tickets';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TicketHeader from './TicketHeader';
import './TicketThread.css';

const TicketThread = ({ ticketId, currentUser, userType = 'customer' }) => {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

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
        content: messageData.content,
        sender_id: currentUser.email,
        sender_type: userType,
        sender_name: currentUser.name || currentUser.email,
        message_type: 'public',
        attachments: messageData.attachments || []
      };

      await addMessageToTicket(ticketId, newMessageData);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
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

  return (
    <div className="ticket-thread">
      <TicketHeader 
        ticket={ticket} 
        currentUser={currentUser} 
        userType={userType} 
      />
      
      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUser={currentUser}
              isOwn={message.sender_id === currentUser?.email}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sending || ticket.status === 'resolved'}
        placeholder={
          ticket.status === 'resolved' 
            ? 'This ticket has been resolved. Reopen to continue conversation.'
            : 'Type your message...'
        }
      />
    </div>
  );
};

export default TicketThread;
