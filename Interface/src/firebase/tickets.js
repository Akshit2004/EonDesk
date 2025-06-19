import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from './config';
import { sendTicketConfirmationEmail, sendSupportNotificationEmail } from '../services/emailService';

// Collection reference
const TICKETS_COLLECTION = 'support_tickets';

/**
 * Generate a unique ticket ID
 */
const generateTicketId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `TKT-${timestamp}-${randomStr}`.toUpperCase();
};

/**
 * Validate ticket data before creation
 */
const validateTicketData = (ticketData) => {
  const errors = [];
  
  // Check for required fields
  if (!ticketData.email && !ticketData.customer_email) {
    errors.push('Email is required');
  }
  
  if (!ticketData.description && !ticketData.message) {
    errors.push('Description is required');
  }
  
  if (!ticketData.name && !ticketData.customer_name && (!ticketData.email && !ticketData.customer_email)) {
    errors.push('Customer name is required');
  }
  
  // Validate email format
  const email = ticketData.email || ticketData.customer_email;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }
  
  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (ticketData.priority && !validPriorities.includes(ticketData.priority)) {
    errors.push('Invalid priority level');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create a new support ticket with initial message
 */
export const createTicket = async (ticketData) => {
  try {
    // Validate input data
    const validation = validateTicketData(ticketData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }
    
    const ticketId = generateTicketId();
    
    // Handle both old and new data structures
    const title = ticketData.title || ticketData.subject || 'Support Request';
    const category = ticketData.category || 'general';
    const description = ticketData.description || ticketData.message || '';
    const customerEmail = ticketData.email || ticketData.customer_email;
    const customerName = ticketData.name || ticketData.customer_name || customerEmail;
    
    const ticket = {
      ticketId,
      title,
      category,
      priority: ticketData.priority || 'medium',
      status: 'open',
      created_by: customerEmail,
      customer_name: customerName,
      customer_email: customerEmail,
      assigned_agent: null,
      assigned_agent_name: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Message metadata
      message_count: 1,
      last_message: {
        content: description,
        sender_id: customerEmail,
        sender_type: 'customer',
        timestamp: serverTimestamp()
      },
      unread_count_customer: 0,
      unread_count_agent: 1
    };

    // Create ticket document
    const docRef = await addDoc(collection(db, TICKETS_COLLECTION), ticket);
      // Add initial message to messages sub-collection
    const messageData = {
      content: description,
      sender_id: customerEmail,
      sender_type: 'customer',
      sender_name: customerName,
      message_type: 'public',
      timestamp: serverTimestamp(),
      attachments: [],
      read_by: [customerEmail]
    };    await addDoc(collection(db, TICKETS_COLLECTION, docRef.id, 'messages'), messageData);
    
    // Send automated confirmation email to customer
    const emailData = {
      ticketId,
      customer_email: customerEmail,
      customer_name: customerName,
      title,
      description,
      priority: ticket.priority,
      category
    };

    try {
      const emailResult = await sendTicketConfirmationEmail(emailData);
      if (emailResult.success) {
        console.log('Confirmation email sent successfully');
      } else {
        console.warn('Failed to send confirmation email:', emailResult.error);
      }

      // Send notification to support team
      const supportEmailResult = await sendSupportNotificationEmail(emailData);
      if (supportEmailResult.success) {
        console.log('Support notification email sent successfully');
      } else {
        console.warn('Failed to send support notification:', supportEmailResult.error);
      }
    } catch (emailError) {
      console.warn('Email service error:', emailError);
      // Don't fail the ticket creation if email fails
    }
    
    return {
      success: true,
      ticketId,
      docId: docRef.id,
      message: 'Ticket created successfully. Confirmation email sent to ' + customerEmail
    };} catch (error) {
    console.error('Error creating ticket:', error);
    
    // Provide more specific error messages
    if (error.message.includes('required')) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: 'Failed to create ticket. Please check your input and try again.'
    };
  }
};

/**
 * Get a ticket by ticket ID and email
 */
export const getTicketByIdAndEmail = async (ticketId, email) => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('ticketId', '==', ticketId),
      where('customer_email', '==', email)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        success: false,
        error: 'Ticket not found or email does not match'
      };
    }

    const ticketDoc = querySnapshot.docs[0];
    const ticketData = ticketDoc.data();
    
    return {
      success: true,
      ticket: {
        id: ticketDoc.id,
        ...ticketData,
        createdAt: ticketData.createdAt?.toDate(),
        updatedAt: ticketData.updatedAt?.toDate()
      }
    };
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all tickets for a specific email
 */
export const getTicketsByEmail = async (email) => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('customer_email', '==', email),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const tickets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
    
    return {
      success: true,
      tickets
    };
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (docId, status) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, docId);
    
    await updateDoc(ticketRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Ticket status updated successfully'
    };
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Add a message to a ticket thread
 */
export const addMessageToTicket = async (ticketDocId, messageData) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const ticketRef = doc(db, TICKETS_COLLECTION, ticketDocId);
      const ticketDoc = await transaction.get(ticketRef);
      
      if (!ticketDoc.exists()) {
        throw new Error('Ticket not found');
      }

      const currentData = ticketDoc.data();
      const isCustomer = messageData.sender_type === 'customer';
      
      // Create message document
      const messageRef = doc(collection(db, TICKETS_COLLECTION, ticketDocId, 'messages'));
      const newMessage = {
        content: messageData.content,
        sender_id: messageData.sender_id,
        sender_type: messageData.sender_type,
        sender_name: messageData.sender_name,
        message_type: messageData.message_type || 'public',
        timestamp: serverTimestamp(),
        attachments: messageData.attachments || [],
        read_by: [messageData.sender_id]
      };
      
      // Update ticket metadata
      const updateData = {
        updatedAt: serverTimestamp(),
        message_count: increment(1),
        last_message: {
          content: messageData.content,
          sender_id: messageData.sender_id,
          sender_type: messageData.sender_type,
          timestamp: serverTimestamp()
        }
      };

      // Update unread counts
      if (isCustomer) {
        updateData.unread_count_agent = increment(1);
        updateData.unread_count_customer = 0;
        updateData.status = 'waiting_for_agent';
      } else {
        updateData.unread_count_customer = increment(1);
        updateData.unread_count_agent = 0;
        updateData.status = 'waiting_for_customer';
      }

      transaction.set(messageRef, newMessage);
      transaction.update(ticketRef, updateData);
      
      return { messageId: messageRef.id, ...newMessage };
    });
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error(error.message);
  }
};

/**
 * Get ticket statistics
 */
export const getTicketStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, TICKETS_COLLECTION));
    
    const stats = {
      total: querySnapshot.size,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    };
    
    querySnapshot.docs.forEach(doc => {
      const status = doc.data().status;
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });
    
    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get messages for a ticket with real-time updates
 */
export const subscribeToTicketMessages = (ticketDocId, callback) => {
  const messagesRef = collection(db, TICKETS_COLLECTION, ticketDocId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
    callback([]);
  });
};

/**
 * Get messages for a ticket (one-time fetch)
 */
export const getTicketMessages = async (ticketDocId) => {
  try {
    const messagesRef = collection(db, TICKETS_COLLECTION, ticketDocId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    
    return {
      success: true,
      messages
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mark messages as read by a user
 */
export const markMessagesAsRead = async (ticketDocId, userId, userType) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const ticketRef = doc(db, TICKETS_COLLECTION, ticketDocId);
      
      // Reset unread count for the user
      const updateData = {};
      if (userType === 'customer') {
        updateData.unread_count_customer = 0;
      } else {
        updateData.unread_count_agent = 0;
      }
      
      transaction.update(ticketRef, updateData);
      
      // Update all messages to mark as read by this user
      const messagesRef = collection(db, TICKETS_COLLECTION, ticketDocId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      messagesSnapshot.docs.forEach(messageDoc => {
        const messageRef = doc(db, TICKETS_COLLECTION, ticketDocId, 'messages', messageDoc.id);
        transaction.update(messageRef, {
          read_by: arrayUnion(userId)
        });
      });
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw new Error(error.message);
  }
};

/**
 * Subscribe to ticket updates for real-time status changes
 */
export const subscribeToTicket = (ticketDocId, callback) => {
  const ticketRef = doc(db, TICKETS_COLLECTION, ticketDocId);
  
  return onSnapshot(ticketRef, (snapshot) => {
    if (snapshot.exists()) {
      const ticket = {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate(),
        updatedAt: snapshot.data().updatedAt?.toDate()
      };
      callback(ticket);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to ticket:', error);
    callback(null);
  });
};

/**
 * Get all tickets for agent dashboard
 */
export const getAllTicketsForAgent = async () => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const tickets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
    
    return {
      success: true,
      tickets
    };
  } catch (error) {
    console.error('Error fetching tickets for agent:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Assign ticket to an agent
 */
export const assignTicketToAgent = async (ticketDocId, agentId, agentName) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketDocId);
    
    await updateDoc(ticketRef, {
      assigned_agent: agentId,
      assigned_agent_name: agentName,
      status: 'assigned',
      updatedAt: serverTimestamp()
    });

    // Add system message about assignment
    const systemMessageData = {
      content: `Ticket assigned to ${agentName}`,
      sender_id: 'system',
      sender_type: 'system',
      sender_name: 'System',
      message_type: 'system',
      timestamp: serverTimestamp(),
      attachments: [],
      read_by: []
    };

    await addDoc(collection(db, TICKETS_COLLECTION, ticketDocId, 'messages'), systemMessageData);
    
    return {
      success: true,
      message: 'Ticket assigned successfully'
    };
  } catch (error) {
    console.error('Error assigning ticket:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update ticket priority
 */
export const updateTicketPriority = async (ticketDocId, priority) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketDocId);
    
    await updateDoc(ticketRef, {
      priority,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Ticket priority updated successfully'
    };
  } catch (error) {
    console.error('Error updating ticket priority:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Close/Resolve ticket
 */
export const closeTicket = async (ticketDocId, resolution) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketDocId);
    
    await updateDoc(ticketRef, {
      status: 'resolved',
      resolution,
      resolved_at: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Add system message about resolution
    const systemMessageData = {
      content: `Ticket resolved: ${resolution}`,
      sender_id: 'system',
      sender_type: 'system',
      sender_name: 'System',
      message_type: 'system',
      timestamp: serverTimestamp(),
      attachments: [],
      read_by: []
    };

    await addDoc(collection(db, TICKETS_COLLECTION, ticketDocId, 'messages'), systemMessageData);
    
    return {
      success: true,
      message: 'Ticket resolved successfully'
    };
  } catch (error) {
    console.error('Error closing ticket:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Reopen a resolved ticket
 */
export const reopenTicket = async (ticketDocId, reason) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, ticketDocId);
    
    await updateDoc(ticketRef, {
      status: 'open',
      reopened_at: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Add system message about reopening
    const systemMessageData = {
      content: `Ticket reopened: ${reason}`,
      sender_id: 'system',
      sender_type: 'system',
      sender_name: 'System',
      message_type: 'system',
      timestamp: serverTimestamp(),
      attachments: [],
      read_by: []
    };

    await addDoc(collection(db, TICKETS_COLLECTION, ticketDocId, 'messages'), systemMessageData);
    
    return {
      success: true,
      message: 'Ticket reopened successfully'
    };
  } catch (error) {
    console.error('Error reopening ticket:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
