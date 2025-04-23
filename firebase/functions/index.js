/**
 * Cloud Functions per Firebase - Invio notifiche email
 *
 * Queste funzioni monitorano la collezione email_notifications e inviano
 * le email utilizzando un provider (es. SendGrid, Nodemailer)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

// Inizializza Firebase Admin SDK
admin.initializeApp();

// Configura SendGrid con la tua API key
// Nota: Sostituisci con la tua API key di SendGrid
sgMail.setApiKey(functions.config().sendgrid.key);

/**
 * Funzione che monitora la collezione email_notifications e invia email
 * quando vengono create nuove notifiche
 */
exports.sendEmailNotification = functions.firestore
  .document('email_notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notificationData = snap.data();

    try {
      // Verifica che i dati necessari siano presenti
      if (!notificationData.to || !notificationData.template) {
        throw new Error('Dati email incompleti: destinatario o template mancanti');
      }

      let emailContent;

      // Genera il contenuto dell'email in base al template
      switch (notificationData.template) {
        case 'product_upload':
          emailContent = generateProductUploadEmail(notificationData.data);
          break;
        case 'csv_upload':
          emailContent = generateCsvUploadEmail(notificationData.data);
          break;
        case 'custom':
          emailContent = generateCustomEmail(notificationData.data);
          break;
        default:
          throw new Error(`Template non supportato: ${notificationData.template}`);
      }

      // Invia l'email tramite SendGrid
      const msg = {
        to: notificationData.to,
        from: 'noreply@docommerce.com', // Sostituisci con il tuo indirizzo email mittente verificato
        ...emailContent
      };

      await sgMail.send(msg);

      // Aggiorna lo stato della notifica
      await snap.ref.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });

      functions.logger.info(`Email inviata con successo a ${notificationData.to}`, {
        notificationId: context.params.notificationId
      });

      return { success: true };

    } catch (error) {
      // Registra l'errore
      functions.logger.error('Errore nell\'invio dell\'email:', error);

      // Aggiorna lo stato della notifica
      await snap.ref.update({
        status: 'error',
        error: error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: false, error: error.message };
    }
  });

/**
 * Genera il contenuto dell'email per notifiche di caricamento prodotto
 */
function generateProductUploadEmail(data) {
  const { siteName, productTitle, productPrice, productCategory, timestamp } = data;

  return {
    subject: `Nuovo prodotto caricato su ${siteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Conferma caricamento prodotto</h2>
        <p>Il seguente prodotto è stato caricato con successo:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Titolo:</strong> ${productTitle}</p>
          <p><strong>Prezzo:</strong> €${productPrice}</p>
          <p><strong>Categoria:</strong> ${productCategory}</p>
          <p><strong>Data:</strong> ${new Date(timestamp).toLocaleString('it-IT')}</p>
          <p><strong>Sito:</strong> ${siteName}</p>
        </div>
        <p>Puoi visualizzare il prodotto nel tuo pannello di amministrazione WooCommerce.</p>
        <hr style="border: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #666;">
          Questa è un'email automatica, non rispondere a questo messaggio.
        </p>
      </div>
    `
  };
}

/**
 * Genera il contenuto dell'email per notifiche di caricamento CSV
 */
function generateCsvUploadEmail(data) {
  const { siteName, totalProducts, successfulProducts, failedProducts, timestamp } = data;

  return {
    subject: `Caricamento CSV completato su ${siteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Riepilogo caricamento CSV</h2>
        <p>Il caricamento del file CSV è stato completato:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Prodotti totali:</strong> ${totalProducts}</p>
          <p><strong>Caricati con successo:</strong> ${successfulProducts}</p>
          <p><strong>Non caricati:</strong> ${failedProducts}</p>
          <p><strong>Data:</strong> ${new Date(timestamp).toLocaleString('it-IT')}</p>
          <p><strong>Sito:</strong> ${siteName}</p>
        </div>
        <p>Puoi visualizzare i prodotti nel tuo pannello di amministrazione WooCommerce.</p>
        <hr style="border: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #666;">
          Questa è un'email automatica, non rispondere a questo messaggio.
        </p>
      </div>
    `
  };
}

/**
 * Genera il contenuto dell'email per notifiche personalizzate
 */
function generateCustomEmail(data) {
  const { subject, message, timestamp } = data;

  return {
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${message}
        </div>
        <p><small>Data: ${new Date(timestamp).toLocaleString('it-IT')}</small></p>
        <hr style="border: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #666;">
          Questa è un'email automatica, non rispondere a questo messaggio.
        </p>
      </div>
    `
  };
}