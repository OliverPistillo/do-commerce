import axios from 'axios';

// Configurazione per l'API DeepL
// Nota: Sarà necessario sostituire questo con una chiave API reale
const DEEPL_API_KEY = 'YOUR_DEEPL_API_KEY';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

/**
 * Traduce un testo in una lingua di destinazione utilizzando DeepL
 * 
 * @param {string} text - Il testo da tradurre
 * @param {string} targetLang - Il codice della lingua di destinazione (es. 'IT', 'EN', 'FR', 'DE')
 * @param {string} sourceLang - Il codice della lingua di origine (opzionale)
 * @returns {Promise<string>} - Il testo tradotto
 */
export const translateText = async (text, targetLang, sourceLang = null) => {
  try {
    if (!text || text.trim() === '') {
      return '';
    }

    // Prepara i parametri per la richiesta
    const params = {
      auth_key: DEEPL_API_KEY,
      text: text,
      target_lang: targetLang,
    };

    // Aggiunge la lingua di origine se specificata
    if (sourceLang) {
      params.source_lang = sourceLang;
    }

    // Effettua la richiesta a DeepL
    const response = await axios.post(DEEPL_API_URL, null, { params });

    // Estrae e restituisce il testo tradotto
    if (response.data && response.data.translations && response.data.translations.length > 0) {
      return response.data.translations[0].text;
    } else {
      throw new Error('Nessuna traduzione ricevuta');
    }
  } catch (error) {
    console.error('Errore durante la traduzione:', error);
    throw error;
  }
};

/**
 * Traduce più testi contemporaneamente
 * 
 * @param {Array<string>} texts - Array di testi da tradurre
 * @param {string} targetLang - Il codice della lingua di destinazione
 * @param {string} sourceLang - Il codice della lingua di origine (opzionale)
 * @returns {Promise<Array<string>>} - Array di testi tradotti
 */
export const translateMultiple = async (texts, targetLang, sourceLang = null) => {
  try {
    // Filtra i testi vuoti
    const nonEmptyTexts = texts.filter(text => text && text.trim() !== '');
    
    if (nonEmptyTexts.length === 0) {
      return [];
    }

    // Prepara i parametri per la richiesta
    const params = {
      auth_key: DEEPL_API_KEY,
      text: nonEmptyTexts,
      target_lang: targetLang,
    };

    // Aggiunge la lingua di origine se specificata
    if (sourceLang) {
      params.source_lang = sourceLang;
    }

    // Effettua la richiesta a DeepL
    const response = await axios.post(DEEPL_API_URL, null, { params });

    // Estrae e restituisce i testi tradotti
    if (response.data && response.data.translations) {
      return response.data.translations.map(translation => translation.text);
    } else {
      throw new Error('Nessuna traduzione ricevuta');
    }
  } catch (error) {
    console.error('Errore durante la traduzione multipla:', error);
    throw error;
  }
};

/**
 * Traduce un oggetto prodotto completo (titolo, descrizione, ecc.)
 * 
 * @param {Object} product - L'oggetto prodotto da tradurre
 * @param {string} targetLang - Il codice della lingua di destinazione
 * @param {string} sourceLang - Il codice della lingua di origine (opzionale)
 * @returns {Promise<Object>} - L'oggetto prodotto tradotto
 */
export const translateProduct = async (product, targetLang, sourceLang = null) => {
  try {
    // Campi da tradurre
    const fieldsToTranslate = ['title', 'description'];
    
    // Estrai i testi da tradurre
    const textsToTranslate = fieldsToTranslate
      .filter(field => product[field])
      .map(field => product[field]);
    
    if (textsToTranslate.length === 0) {
      return { ...product };
    }
    
    // Traduce tutti i testi
    const translatedTexts = await translateMultiple(textsToTranslate, targetLang, sourceLang);
    
    // Crea una copia del prodotto con i testi tradotti
    const translatedProduct = { ...product };
    let translatedIndex = 0;
    
    for (const field of fieldsToTranslate) {
      if (product[field]) {
        translatedProduct[field] = translatedTexts[translatedIndex++];
      }
    }
    
    return translatedProduct;
  } catch (error) {
    console.error('Errore durante la traduzione del prodotto:', error);
    // In caso di errore, restituisci il prodotto originale
    return { ...product };
  }
};

// Lingue supportate da DeepL
export const supportedLanguages = [
  { code: 'BG', name: 'Bulgaro' },
  { code: 'CS', name: 'Ceco' },
  { code: 'DA', name: 'Danese' },
  { code: 'DE', name: 'Tedesco' },
  { code: 'EL', name: 'Greco' },
  { code: 'EN', name: 'Inglese' },
  { code: 'ES', name: 'Spagnolo' },
  { code: 'ET', name: 'Estone' },
  { code: 'FI', name: 'Finlandese' },
  { code: 'FR', name: 'Francese' },
  { code: 'HU', name: 'Ungherese' },
  { code: 'IT', name: 'Italiano' },
  { code: 'JA', name: 'Giapponese' },
  { code: 'LT', name: 'Lituano' },
  { code: 'LV', name: 'Lettone' },
  { code: 'NL', name: 'Olandese' },
  { code: 'PL', name: 'Polacco' },
  { code: 'PT', name: 'Portoghese' },
  { code: 'RO', name: 'Rumeno' },
  { code: 'RU', name: 'Russo' },
  { code: 'SK', name: 'Slovacco' },
  { code: 'SL', name: 'Sloveno' },
  { code: 'SV', name: 'Svedese' },
  { code: 'ZH', name: 'Cinese' }
];

export default {
  translateText,
  translateMultiple,
  translateProduct,
  supportedLanguages
};