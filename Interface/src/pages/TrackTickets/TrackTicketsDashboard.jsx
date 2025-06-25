import { useEffect, useState } from 'react';
import './TrackTickets.css';

function TrackTicketsDashboard({ customer_no }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:3001/tickets/customer/${customer_no}`);
        if (!res.ok) throw new Error('Failed to fetch tickets');
        const data = await res.json();
        setTickets(data);
        setSelectedTicket(data[0] || null);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    if (customer_no) fetchTickets();
  }, [customer_no]);

  return (
    <div className="track-tickets-dashboard">
      <div className="tickets-sidebar">
        <h3>Your Tickets</h3>
        {loading ? <div>Loading...</div> : null}
        {error ? <div className="error">{error}</div> : null}
        <ul>
          {tickets.map(ticket => (
            <li
              key={ticket.ticket_id}
              className={selectedTicket && selectedTicket.ticket_id === ticket.ticket_id ? 'active' : ''}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="ticket-title">{ticket.title}</div>
              <div className="ticket-date">{new Date(ticket.created_at).toLocaleString()}</div>
              <div className="ticket-status">{ticket.status}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="ticket-details">
        {selectedTicket ? (
          <div>
            <h2>{selectedTicket.title}</h2>
            <p><b>Status:</b> {selectedTicket.status}</p>
            <p><b>Created:</b> {new Date(selectedTicket.created_at).toLocaleString()}</p>
            <p><b>Description:</b> {selectedTicket.description}</p>
            {/* Add more ticket details/messages here */}
          </div>
        ) : (
          <div>Select a ticket to view details</div>
        )}
      </div>
    </div>
  );
}

export default TrackTicketsDashboard;
