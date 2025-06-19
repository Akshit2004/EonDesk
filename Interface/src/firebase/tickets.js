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
  updateDoc
} from 'firebase/firestore';
import { db } from './config';

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
 * Create a new support ticket
 */
export const createTicket = async (ticketData) => {
  try {
    const ticketId = generateTicketId();
    const now = new Date();
    
    const ticket = {
      ticketId,
      ...ticketData,
      status: 'open',
      priority: ticketData.priority || 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messages: [
        {
          id: 1,
          content: ticketData.description,
          sender: 'customer',
          timestamp: now,
          senderName: ticketData.name
        }
      ]
    };

    const docRef = await addDoc(collection(db, TICKETS_COLLECTION), ticket);
    
    return {
      success: true,
      ticketId,
      docId: docRef.id,
      message: 'Ticket created successfully'
    };
  } catch (error) {
    console.error('Error creating ticket:', error);
    return {
      success: false,
      error: error.message
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
      where('email', '==', email)
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
      where('email', '==', email),
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
 * Add a message to a ticket
 */
export const addMessageToTicket = async (docId, message) => {
  try {
    const ticketRef = doc(db, TICKETS_COLLECTION, docId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (!ticketDoc.exists()) {
      return {
        success: false,
        error: 'Ticket not found'
      };
    }
    
    const currentMessages = ticketDoc.data().messages || [];
    const newMessage = {
      id: currentMessages.length + 1,
      ...message,
      timestamp: new Date()
    };
    
    await updateDoc(ticketRef, {
      messages: [...currentMessages, newMessage],
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Message added successfully'
    };
  } catch (error) {
    console.error('Error adding message:', error);
    return {
      success: false,
      error: error.message
    };
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
