import React, { useState } from 'react';
import { translateProduct, supportedLanguages } from '../services/translationService';
import LoadingSpinner from './ui/LoadingSpinner';

const ProductTranslator = ({ product, onTranslationComplete }) => {
  const [targetLang, setTargetLang] = useState('EN');
  const [sourceLang, setSourceLang] = useState('IT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [translatedPreview, setTranslatedPreview] = useState(null);

  const handleSourceLangChange = (e) => {
    setSourceLang(e.target.value);
    // Reset traduzione quando si cambia lingua
    setTranslatedPreview(null);
  };

  const handleTargetLangChange = (e) => {
    setTargetLang(e.target.value);
    // Reset traduzione quando si cambia lingua
    setTranslatedPreview(null);
  };

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const translated = await translateProduct(product, targetLang, sourceLang);
      setTranslatedPreview(translated);
    } catch (err) {
      setError(`Errore durante la traduzione: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTranslation = () => {
    if (translatedPreview && onTranslationComplete) {
      onTranslationComplete(translatedPreview);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Traduzione Automatica</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lingua di origine
          </label>
          <select
            value={sourceLang}
            onChange={handleSourceLangChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {supportedLanguages.map(lang => (
              <option key={`source-${lang.code}`} value={lang.code}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lingua di destinazione
          </label>
          <select
            value={targetLang}
            onChange={handleTargetLangChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {supportedLanguages.map(lang => (
              <option key={`target-${lang.code}`} value={lang.code}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <button
          onClick={handleTranslate}
          disabled={loading || !product}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <LoadingSpinner size="small" color="white" /> 
              <span className="ml-2">Traduzione in corso...</span>
            </span>
          ) : (
            'Traduci'
          )}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {translatedPreview && (
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Anteprima Traduzione</h3>
          
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-500">Titolo</div>
              <div className="text-md">{translatedPreview.title}</div>
            </div>
            
            {translatedPreview.description && (
              <div>
                <div className="text-sm font-medium text-gray-500">Descrizione</div>
                <div className="text-md">
                  {translatedPreview.description.length > 200 
                    ? translatedPreview.description.substring(0, 200) + '...' 
                    : translatedPreview.description}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <button
              onClick={handleApplyTranslation}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
            >
              Applica Traduzione
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTranslator;