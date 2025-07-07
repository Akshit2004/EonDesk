// PostgreSQL agent dashboard API service
const API_BASE = 'http://localhost:3001';

export async function getAllTicketsForAgent() {
  try {
    const res = await fetch(`${API_BASE}/tickets`);
    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.error || `HTTP ${res.status}` };
    }
    
    const tickets = await res.json();
    return { 
      success: true, 
      tickets: Array.isArray(tickets) ? tickets : [] 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getTicketStats() {
  try {
    const res = await fetch(`${API_BASE}/tickets`);
    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.error || `HTTP ${res.status}` };
    }
    
    const tickets = await res.json();
    
    // Calculate stats from tickets
    const stats = {
      total: tickets.length,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    };
    
    tickets.forEach(ticket => {
      const status = ticket.status || 'open';
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });
    
    return { success: true, stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateTicketStatus(ticketId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.error || `HTTP ${res.status}` };
    }
    
    const ticket = await res.json();
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
    return { 
      success: true, 
      messages: Array.isArray(messages) ? messages : [] 
    };
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
    
    const message = await res.json();
    return { success: true, message };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
