import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebase';

// Inizializza Firestore
const db = getFirestore(app);

/**
 * Servizio per l'invio di notifiche email utilizzando Cloud Functions
 * Nota: questo servizio presuppone che sia stata implementata una Cloud Function di Firebase
 * che monitori la collection 'email_notifications' e invii effettivamente le email
 */
class EmailNotificationService {
  /**
   * Invia una notifica email di prodotto caricato
   * 
   * @param {string} userEmail - L'email del destinatario
   * @param {string} siteName - Il nome del sito WooCommerce
   * @param {Object} productDetails - Dettagli del prodotto caricato
   * @returns {Promise<string>} - L'ID della notifica creata
   */
  async sendProductUploadNotification(userEmail, siteName, productDetails) {
    try {
      // Riferimento alla collezione di notifiche email
      const notificationsRef = collection(db, 'email_notifications');
      
      // Prepara i dati della notifica
      const notificationData = {
        to: userEmail,
        template: 'product_upload',
        data: {
          siteName,
          productTitle: productDetails.title,
          productPrice: productDetails.price,
          productCategory: productDetails.category || 'N/A',
          timestamp: new Date().toISOString()
        },
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      // Aggiungi la notifica alla collezione
      const docRef = await addDoc(notificationsRef, notificationData);
      
      return docRef.id;
    } catch (error) {
      console.error('Errore nell\'invio della notifica email:', error);
      throw error;
    }
  }
  
  /**
   * Invia una notifica email di caricamento CSV completato
   * 
   * @param {string} userEmail - L'email del destinatario
   * @param {string} siteName - Il nome del sito WooCommerce
   * @param {Object} summary - Riepilogo del caricamento (prodotti totali, riusciti, falliti)
   * @returns {Promise<string>} - L'ID della notifica creata
   */
  async sendCsvUploadNotification(userEmail, siteName, summary) {
    try {
      // Riferimento alla collezione di notifiche email
      const notificationsRef = collection(db, 'email_notifications');
      
      // Prepara i dati della notifica
      const notificationData = {
        to: userEmail,
        template: 'csv_upload',
        data: {
          siteName,
          totalProducts: summary.total,
          successfulProducts: summary.successful,
          failedProducts: summary.failed,
          timestamp: new Date().toISOString()
        },
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      // Aggiungi la notifica alla collezione
      const docRef = await addDoc(notificationsRef, notificationData);
      
      return docRef.id;
    } catch (error) {
      console.error('Errore nell\'invio della notifica email:', error);
      throw error;
    }
  }
  
  /**
   * Invia una notifica email personalizzata
   * 
   * @param {string} userEmail - L'email del destinatario
   * @param {string} subject - L'oggetto dell'email
   * @param {string} message - Il contenuto dell'email
   * @returns {Promise<string>} - L'ID della notifica creata
   */
  async sendCustomNotification(userEmail, subject, message) {
    try {
      // Riferimento alla collezione di notifiche email
      const notificationsRef = collection(db, 'email_notifications');
      
      // Prepara i dati della notifica
      const notificationData = {
        to: userEmail,
        template: 'custom',
        data: {
          subject,
          message,
          timestamp: new Date().toISOString()
        },
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      // Aggiungi la notifica alla collezione
      const docRef = await addDoc(notificationsRef, notificationData);
      
      return docRef.id;
    } catch (error) {
      console.error('Errore nell\'invio della notifica email personalizzata:', error);
      throw error;
    }
  }
}

// Esporta una singola istanza del servizio
export default new EmailNotificationService();