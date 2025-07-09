// API for tickets and messages using Express backend

const API_BASES = [
  import.meta.env.VITE_API_BASE || process.env.VITE_API_BASE || 'http://localhost:3001',
  'http://localhost/php-backend'
];

async function fetchWithFallback(path, options) {
  let lastError;
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export async function getTicketById(ticketId) {
  try {
    const res = await fetchWithFallback('/tickets');
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
    const res = await fetchWithFallback(`/tickets/${ticketId}/messages`);
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
    const res = await fetchWithFallback(`/tickets/${ticketId}/messages`, {
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
