// PostgreSQL ticket service - alternative to Firebase
const API_BASE = 'http://localhost:3001';

export async function createTicketPG(ticketData) {
  try {
    const ticket_id = `EON-TKT-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
      const payload = {
      ticket_id,
      title: ticketData.title || ticketData.subject,
      category: ticketData.category || 'general',
      priority: ticketData.priority || 'medium',
      status: 'open',
      created_by: ticketData.email || ticketData.customer_email,
      customer_name: ticketData.name || ticketData.customer_name,
      customer_email: ticketData.email || ticketData.customer_email,
      customer_no: ticketData.customer_no, // <-- add this line
      assigned_agent: null,
      assigned_agent_name: null,
      description: ticketData.description || ticketData.message
    };

    const res = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.error || `HTTP ${res.status}` };
    }

    const ticket = await res.json();
    
    // Also create the initial message
    if (ticketData.description || ticketData.message) {
      const messageData = {
        content: ticketData.description || ticketData.message,
        sender_id: ticket.customer_email,
        sender_type: 'customer',
        sender_name: ticket.customer_name,
        message_type: 'public',
        attachments: [],
        read_by: [],
        reply_to: null
      };
      
      await fetch(`${API_BASE}/tickets/${ticket.ticket_id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
    }    return { 
      success: true, 
      ticketId: ticket.ticket_id,  // For backwards compatibility with email service
      ticket_id: ticket.ticket_id,
      ticket,
      // Add formatted data for email service
      customer_name: ticket.customer_name,
      customer_email: ticket.customer_email,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      category: ticket.category
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getTicketByIdPG(ticketId) {
  try {
    const res = await fetch(`${API_BASE}/tickets`);
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    
    const tickets = await res.json();
    const ticket = tickets.find(t => t.ticket_id === ticketId);
    
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }
    
    return { success: true, ticket };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
