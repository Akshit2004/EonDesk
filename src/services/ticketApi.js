// API for tickets and messages using Express backend

const API_BASE = 'http://localhost/php-backend';

export async function getTicketById(ticketId) {
  try {
    const res = await fetch(`${API_BASE}/tickets`);
    const tickets = await res.json();
    const ticket = tickets.find(t => t.ticket_id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };
    return { success: true, ticket };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getTicketMessages(ticketId) {
  try {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`);
    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.error || `HTTP ${res.status}` };
    }
    const messages = await res.json();
    return { success: true, messages: Array.isArray(messages) ? messages : [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function addMessageToTicket(ticketId, messageData) {
  try {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { success: true, message: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
