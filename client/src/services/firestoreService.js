import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';

// Inizializza Firestore
const db = getFirestore(app);

/**
 * Recupera i siti WooCommerce associati a un utente
 * @param {string} email - Email dell'utente
 * @returns {Promise<Array<string>>} - Array di URL dei siti assegnati all'utente
 */
export const getUserSites = async (email) => {
  try {
    // Riferimento al documento dell'utente
    const userDocRef = doc(db, 'userSites', email);
    
    // Ottieni il documento
    const userDoc = await getDoc(userDocRef);
    
    // Se il documento esiste, restituisci i siti
    if (userDoc.exists()) {
      return userDoc.data().sites || [];
    }
    
    // Se il documento non esiste, restituisci un array vuoto
    return [];
  } catch (error) {
    console.error('Errore nel recupero dei siti utente:', error);
    throw error;
  }
};

/**
 * Verifica se un utente è un amministratore
 * @param {string} email - Email dell'utente
 * @returns {Promise<boolean>} - True se l'utente è un amministratore
 */
export const isUserAdmin = async (email) => {
  try {
    // Riferimento al documento degli amministratori
    const adminsDocRef = doc(db, 'settings', 'admins');
    
    // Ottieni il documento
    const adminsDoc = await getDoc(adminsDocRef);
    
    // Se il documento esiste, controlla se l'utente è nella lista
    if (adminsDoc.exists()) {
      const adminEmails = adminsDoc.data().emails || [];
      return adminEmails.includes(email);
    }
    
    // Se il documento non esiste, l'utente non è un amministratore
    return false;
  } catch (error) {
    console.error('Errore nella verifica dei permessi di amministratore:', error);
    return false;
  }
};

export default {
  getUserSites,
  isUserAdmin
};