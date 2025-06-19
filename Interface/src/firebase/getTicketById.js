import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';

const TICKETS_COLLECTION = 'support_tickets';

/**
 * Get a ticket by ticket ID only
 */
export const getTicketById = async (ticketId) => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('ticketId', '==', ticketId)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return { success: false, error: 'Ticket not found' };
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
    return { success: false, error: error.message };
  }
};
