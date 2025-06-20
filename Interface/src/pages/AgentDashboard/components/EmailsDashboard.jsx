import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaTicketAlt, FaTrash, FaEye, FaReply, FaClock, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import gmailService from '../../../services/gmailService';
import { createTicket } from '../../../firebase/tickets';
import CreateTicketForm from '../../../components/TicketDashboard/CreateTicketForm';
import './EmailsDashboard.css';

const EmailsDashboard = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [ticketFormData, setTicketFormData] = useState(null);
  const [processingEmails, setProcessingEmails] = useState(new Set());
  useEffect(() => {
    fetchEmails();
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showCreateTicket) {
        setShowCreateTicket(false);
        setTicketFormData(null);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showCreateTicket]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const fetchedEmails = await gmailService.fetchEmails();
      setEmails(fetchedEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to fetch emails. Please check your Gmail configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleCreateTicket = (email) => {
    const extractedData = gmailService.extractTicketDataFromEmail(email);
    setTicketFormData(extractedData);
    setShowCreateTicket(true);
  };  const handleTicketCreated = async (result) => {
    if (result.success && ticketFormData?.originalEmail) {
      try {
        // Send automated reply with ticket number
        const emailResult = await gmailService.sendTicketConfirmationReply(
          ticketFormData.originalEmail, 
          result.ticketId
        );
        
        if (emailResult.success) {
          toast.success(`Ticket #${result.ticketId} created and confirmation email sent!`);
          
          // Remove email from dashboard after successful email send
          const removeResult = await gmailService.archiveEmail(ticketFormData.originalEmailId);
          if (removeResult.success) {
            setEmails(prev => prev.filter(email => email.id !== ticketFormData.originalEmailId));
            setSelectedEmail(null);
          } else {
            console.error('Error removing email:', removeResult.error);
            toast.warning('Ticket created and email sent, but failed to remove email from dashboard');
          }
        } else {
          toast.warning(`Ticket #${result.ticketId} created but failed to send confirmation email: ${emailResult.error}`);
        }
        
      } catch (error) {
        console.error('Error in ticket creation process:', error);
        toast.warning(`Ticket #${result.ticketId} created but encountered an error: ${error.message}`);
      }
    } else if (result.success) {
      // Ticket created successfully but no email data
      toast.success(`Ticket #${result.ticketId} created successfully!`);
    } else {
      // Ticket creation failed
      toast.error(`Failed to create ticket: ${result.error || 'Unknown error'}`);
    }
    
    setShowCreateTicket(false);
    setTicketFormData(null);
  };
  const handleRemoveEmail = async (emailId) => {
    setProcessingEmails(prev => new Set(prev).add(emailId));
    
    try {
      const result = await gmailService.archiveEmail(emailId);
      
      if (result.success) {
        setEmails(prev => prev.filter(email => email.id !== emailId));
        setSelectedEmail(null);
        toast.success('Email removed from dashboard');
      } else {
        toast.error(`Failed to remove email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error removing email:', error);
      toast.error('Failed to remove email');
    } finally {
      setProcessingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(emailId);
        return newSet;
      });
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="emails-dashboard">
        <div className="emails-header">
          <h2>Support Emails</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emails-dashboard">
      <div className="emails-header">
        <h2>Support Emails</h2>
        <div className="emails-stats">
          <span className="stat">
            <FaEnvelope className="stat-icon" />
            {emails.length} Total
          </span>
          <span className="stat">
            <FaEnvelopeOpen className="stat-icon" />
            {emails.filter(email => !email.isRead).length} Unread
          </span>
        </div>
        <button className="refresh-btn" onClick={fetchEmails}>
          <FaReply className="refresh-icon" />
          Refresh
        </button>
      </div>

      <div className="emails-content">
        <div className="emails-list">
          {emails.length === 0 ? (
            <div className="no-emails">
              <FaEnvelope className="no-emails-icon" />
              <h3>No emails found</h3>
              <p>All support emails will appear here</p>
            </div>
          ) : (
            emails.map(email => (
              <div
                key={email.id}
                className={`email-item ${selectedEmail?.id === email.id ? 'selected' : ''} ${!email.isRead ? 'unread' : ''}`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="email-header">
                  <div className="email-from">
                    <FaUser className="user-icon" />
                    <span className="sender-name">{email.from}</span>
                  </div>
                  <div className="email-date">
                    <FaClock className="date-icon" />
                    {formatDate(email.date)}
                  </div>
                </div>
                <div className="email-subject">
                  {email.subject || 'No Subject'}
                </div>
                <div className="email-snippet">
                  {truncateText(email.snippet, 100)}
                </div>
                <div className="email-actions">
                  <button
                    className="action-btn create-ticket-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateTicket(email);
                    }}
                    disabled={processingEmails.has(email.id)}
                  >
                    <FaTicketAlt className="action-icon" />
                    Create Ticket
                  </button>
                  <button
                    className="action-btn remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveEmail(email.id);
                    }}
                    disabled={processingEmails.has(email.id)}
                  >
                    <FaTrash className="action-icon" />
                    {processingEmails.has(email.id) ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedEmail && (
          <div className="email-details">
            <div className="email-details-header">
              <h3>Email Details</h3>
              <button
                className="close-details-btn"
                onClick={() => setSelectedEmail(null)}
              >
                ×
              </button>
            </div>
            <div className="email-details-content">
              <div className="detail-row">
                <strong>From:</strong> {selectedEmail.from}
              </div>
              <div className="detail-row">
                <strong>To:</strong> {selectedEmail.to}
              </div>
              <div className="detail-row">
                <strong>Subject:</strong> {selectedEmail.subject}
              </div>
              <div className="detail-row">
                <strong>Date:</strong> {selectedEmail.date.toLocaleString()}
              </div>
              <div className="detail-row">
                <strong>Message:</strong>
                <div className="email-body">
                  {selectedEmail.body}
                </div>
              </div>
            </div>
            <div className="email-details-actions">
              <button
                className="btn-primary"
                onClick={() => handleCreateTicket(selectedEmail)}
              >
                <FaTicketAlt className="btn-icon" />
                Create Ticket
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleRemoveEmail(selectedEmail.id)}
              >
                <FaTrash className="btn-icon" />
                Remove from Dashboard
              </button>
            </div>
          </div>
        )}
      </div>      {showCreateTicket && ticketFormData && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            // Close modal when clicking on overlay
            if (e.target === e.currentTarget) {
              setShowCreateTicket(false);
              setTicketFormData(null);
            }
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Ticket from Email</h3>
              <button
                className="close-modal-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCreateTicket(false);
                  setTicketFormData(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <CreateTicketForm
                onTicketCreated={handleTicketCreated}
                initialData={ticketFormData}
                isEmailTicket={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailsDashboard;
