import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './config';

// Create a document
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

// Get a single document
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: 'Document not found' };
    }
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Get all documents from a collection
export const getDocuments = async (collectionName, conditions = []) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply conditions if provided
    if (conditions.length > 0) {
      const queryConstraints = conditions.map(condition => {
        if (condition.type === 'where') {
          return where(condition.field, condition.operator, condition.value);
        } else if (condition.type === 'orderBy') {
          return orderBy(condition.field, condition.direction);
        } else if (condition.type === 'limit') {
          return limit(condition.count);
        }
      });
      q = query(q, ...queryConstraints);
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return { data: documents, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Update a document
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Delete a document
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};
