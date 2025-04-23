import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CsvUploader from './CsvUploader';
import ProductTranslator from './ProductTranslator';
import LoadingSpinner from './ui/LoadingSpinner';
import emailNotificationService from '../services/emailNotificationService';

const categories = ["Abbigliamento", "Accessori", "Tecnologia", "Casa", "Bellezza"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = ["Rosso", "Blu", "Verde", "Nero", "Bianco", "Giallo", "Arancione", "Viola"];

const ProductForm = ({ user, apiUrl }) => {
  // Stati base del prodotto
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [size, setSize] = useState(sizes[0]);
  const [color, setColor] = useState(colors[0]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Stati per funzionalità aggiuntive
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [showTranslator, setShowTranslator] = useState(false);
  const [uploadType, setUploadType] = useState('single'); // 'single' o 'csv'
  
  // Funzionalità autosuggest per i titoli dei prodotti
  useEffect(() => {
    if (title.length > 2) {
      // In un'implementazione reale, qui ci sarebbe una chiamata API
      // per ottenere suggerimenti basati sui prodotti esistenti
      // Simuliamo con alcuni esempi statici
      const fakeSuggestions = [
        `${title} - Edizione Speciale`,
        `${title} Premium`,
        `${title} (Nuovo Modello)`,
        `${title} Collection`
      ];
      setTitleSuggestions(fakeSuggestions);
    } else {
      setTitleSuggestions([]);
    }
  }, [title]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleTitleSuggestionClick = (suggestion) => {
    setTitle(suggestion);
    setTitleSuggestions([]);
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setStock('');
    setCategory(categories[0]);
    setSize(sizes[0]);
    setColor(colors[0]);
    setImage(null);
    setPreview(null);
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!title.trim()) return "Il titolo è obbligatorio";
    if (!price || isNaN(price) || Number(price) <= 0) return "Inserisci un prezzo valido";
    if (!image) return "L'immagine è obbligatoria";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Creazione FormData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('stock', stock);
    formData.append('category', category);
    formData.append('size', size);
    formData.append('color', color);
    formData.append('image', image);
    formData.append('user_email', user.email);
    
    try {
      // Invio al server
      const response = await axios.post(`${apiUrl}/product`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setSuccess('Prodotto caricato con successo!');
        
        // Invia notifica email
        try {
          await emailNotificationService.sendProductUploadNotification(
            user.email,
            new URL(apiUrl).hostname,
            {
              title,
              price,
              category
            }
          );
        } catch (emailError) {
          console.error("Errore nell'invio della notifica email:", emailError);
          // Non blocchiamo l'utente se la notifica fallisce
        }
        
        // Reset form
        resetForm();
      } else {
        setError('Errore durante il caricamento del prodotto');
      }
    } catch (err) {
      setError(`Errore: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationComplete = (translatedProduct) => {
    setTitle(translatedProduct.title);
    setDescription(translatedProduct.description);
    setShowTranslator(false);
    
    // Mostra messaggio di successo
    setSuccess('Traduzione applicata con successo!');
    
    // Nasconde il messaggio dopo 3 secondi
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const handleCsvUploadSuccess = (result) => {
    setSuccess(`Caricamento CSV completato! ${result.successful} prodotti caricati con successo.`);
    
    // Invia notifica email per l'upload CSV
    try {
      emailNotificationService.sendCsvUploadNotification(
        user.email,
        new URL(apiUrl).hostname,
        {
          total: result.total,
          successful: result.successful,
          failed: result.failed
        }
      );
    } catch (emailError) {
      console.error("Errore nell'invio della notifica email:", emailError);
    }
  };

  if (!apiUrl) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              URL API non disponibile. Contatta l'amministratore.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab per scegliere tra caricamento singolo e CSV */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setUploadType('single')}
            className={`pb-4 px-1 ${
              uploadType === 'single'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Prodotto Singolo
          </button>
          <button
            onClick={() => setUploadType('csv')}
            className={`pb-4 px-1 ${
              uploadType === 'csv'
                ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                : 'border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Caricamento CSV
          </button>
        </nav>
      </div>

      {/* Messaggio di errore o successo */}
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-md border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 p-4 rounded-md border-l-4 border-green-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form per caricamento singolo prodotto */}
      {uploadType === 'single' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Aggiungi Prodotto</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titolo con autosuggest */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titolo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  placeholder="Nome del prodotto"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                {titleSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg border rounded-md py-1">
                    {titleSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleTitleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Prezzo e Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Prezzo *
                </label>
                <input
                  type="number"
                  id="price"
                  placeholder="Prezzo"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                  Disponibilità
                </label>
                <input
                  type="number"
                  id="stock"
                  placeholder="Quantità disponibile"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min="0"
                />
              </div>
            </div>
            
            {/* Descrizione */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrizione
              </label>
              <textarea
                id="description"
                placeholder="Descrizione del prodotto"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            {/* Categoria, Taglia, Colore */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <select
                  id="category"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                  Taglia
                </label>
                <select
                  id="size"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                  Colore
                </label>
                <select
                  id="color"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                >
                  {colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Immagine */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Immagine *
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                  required={!image}
                />
                <label
                  htmlFor="image"
                  className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Seleziona file
                </label>
                {image && (
                  <span className="ml-3 text-sm text-gray-500">{image.name}</span>
                )}
              </div>
              {preview && (
                <div className="mt-2">
                  <img
                    src={preview}
                    alt="Anteprima"
                    className="h-32 w-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            
            {/* Pulsanti azione */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <button
                  type="button"
                  onClick={() => setShowTranslator(!showTranslator)}
                  className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  {showTranslator ? 'Nascondi Traduttore' : 'Traduci Contenuti'}
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="small" color="white" />
                      <span className="ml-2">Caricamento...</span>
                    </span>
                  ) : (
                    'Carica Prodotto'
                  )}
                </button>
              </div>
            </div>
          </form>
          
          {/* Pannello traduzione */}
          {showTranslator && (
            <div className="mt-6">
              <ProductTranslator
                product={{ title, description }}
                onTranslationComplete={handleTranslationComplete}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Uploader CSV */}
      {uploadType === 'csv' && (
        <CsvUploader
          userEmail={user.email}
          apiUrl={apiUrl}
          onSuccess={handleCsvUploadSuccess}
        />
      )}
    </div>
  );
};

export default ProductForm;