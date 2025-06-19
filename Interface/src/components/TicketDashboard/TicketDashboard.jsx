import React, { useState, useEffect } from 'react';
import { getTicketsByEmail, getAllTicketsForAgent } from '../../firebase/tickets';
import TicketThread from './TicketThread';
import TicketList from './TicketList';
import './TicketDashboard.css';

const TicketDashboard = ({ currentUser, userType = 'customer' }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTickets();
  }, [currentUser, userType]);

  const loadTickets = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      let result;
      if (userType === 'customer') {
        result = await getTicketsByEmail(currentUser.email);
      } else {
        result = await getAllTicketsForAgent();
      }

      if (result.success) {
        setTickets(result.tickets);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    loadTickets(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="ticket-dashboard">
      {selectedTicket ? (
        <div className="ticket-view">
          <div className="ticket-view-header">
            <button 
              onClick={handleBackToList}
              className="back-button"
            >
              ← Back to Tickets
            </button>
          </div>
          <TicketThread
            ticketId={selectedTicket.id}
            currentUser={currentUser}
            userType={userType}
          />
        </div>
      ) : (
        <div className="tickets-list-view">
          <div className="dashboard-header">
            <h1>
              {userType === 'customer' ? 'My Support Tickets' : 'Support Dashboard'}
            </h1>
            <button 
              onClick={loadTickets}
              className="refresh-button"
            >
              Refresh
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <TicketList
            tickets={tickets}
            onTicketSelect={handleTicketSelect}
            userType={userType}
            currentUser={currentUser}
          />
        </div>
      )}
    </div>
  );
};

export default TicketDashboard;
