import React, { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

const CsvUploader = ({ userEmail, apiUrl, onSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadSummary, setUploadSummary] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // Gestione del drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  // Gestione del drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Gestione del file selezionato tramite input
  const handleChange = (e) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Click sul pulsante di upload
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Gestione del file (sia da drop che da input)
  const handleFile = (file) => {
    if (file.type !== 'text/csv') {
      setError('Il file deve essere in formato CSV');
      return;
    }

    setFile(file);
    setError(null);
    
    // Analisi del CSV con PapaParse
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Errore nell'analisi del CSV: ${results.errors[0].message}`);
          return;
        }
        
        if (results.data.length === 0) {
          setError('Il file CSV è vuoto o non contiene dati validi');
          return;
        }
        
        // Verifica che i campi obbligatori siano presenti
        const requiredFields = ['title', 'price'];
        const headers = Object.keys(results.data[0]);
        
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        if (missingFields.length > 0) {
          setError(`Campi obbligatori mancanti: ${missingFields.join(', ')}`);
          return;
        }
        
        setParsedData(results.data);
      }
    });
  };

  // Invio dei dati al server
  const handleUpload = async () => {
    if (!parsedData || parsedData.length === 0) {
      setError('Nessun dato da caricare');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setError(null);
    setUploadSummary(null);
    
    try {
      // Approccio 1: Invio bulk (tutti i prodotti in una chiamata)
      // Questo approccio è più efficiente per il server ma non mostra progressi incrementali
      const response = await axios.post(`${apiUrl}/products/bulk`, {
        products: parsedData,
        user_email: userEmail
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setUploadSummary({
        total: response.data.total,
        successful: response.data.successful,
        failed: response.data.failed,
        failedItems: response.data.failures || []
      });
      
      if (response.data.success) {
        if (onSuccess) onSuccess(response.data);
      }
      
      setProgress(100);
      
      /* Approccio 2: Invio sequenziale (un prodotto alla volta)
      // Questo approccio è utile per mostrare un progresso incrementale
      
      let successful = 0;
      let failed = 0;
      let failures = [];
      
      for (let i = 0; i < parsedData.length; i++) {
        try {
          await axios.post(`${apiUrl}/product`, {
            ...parsedData[i],
            user_email: userEmail
          });
          
          successful++;
        } catch (err) {
          failed++;
          failures.push({
            index: i,
            error: err.message,
            product_data: parsedData[i]
          });
        }
        
        // Aggiorna il progresso
        setProgress(Math.round(((i + 1) / parsedData.length) * 100));
      }
      
      setUploadSummary({
        total: parsedData.length,
        successful,
        failed,
        failedItems: failures
      });
      
      if (successful > 0 && onSuccess) {
        onSuccess({ successful, failed });
      }
      */
      
    } catch (err) {
      setError(`Errore durante l'upload: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Reset dello stato
  const resetUploader = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    setUploadSummary(null);
    setProgress(0);
    
    // Reset del campo input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Caricamento CSV Prodotti</h2>
      
      {/* Area Drag & Drop */}
      {!parsedData && (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          <p className="mt-2 text-sm text-gray-600">
            Trascina il file CSV qui, o 
            <button 
              type="button"
              className="font-medium text-blue-600 hover:text-blue-700 mx-1"
              onClick={onButtonClick}
            >
              seleziona un file
            </button>
            dal tuo computer
          </p>
          <p className="mt-1 text-xs text-gray-500">CSV (max. 10MB)</p>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleChange}
          />
        </div>
      )}
      
      {/* Mostra file selezionato */}
      {file && !parsedData && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Analisi del file in corso...</p>
        </div>
      )}
      
      {/* Errore */}
      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Anteprima dati CSV */}
      {parsedData && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Anteprima ({parsedData.length} prodotti)</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {parsedData.length > 0 && Object.keys(parsedData[0]).map((header, idx) => (
                    <th 
                      key={idx}
                      scope="col" 
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedData.slice(0, 5).map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {Object.values(row).map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 whitespace-nowrap text-xs">
                        {typeof cell === 'object' ? JSON.stringify(cell) : String(cell || '')}
                      </td>
                    ))}
                  </tr>
                ))}
                {parsedData.length > 5 && (
                  <tr>
                    <td colSpan={Object.keys(parsedData[0]).length} className="px-3 py-2 text-xs text-gray-500">
                      ... e altri {parsedData.length - 5} prodotti
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pulsanti azione */}
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {uploading ? 'Caricamento...' : 'Carica Prodotti'}
            </button>
            
            <button
              type="button"
              onClick={resetUploader}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
      
      {/* Barra di progresso */}
      {uploading && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Caricamento in corso... {progress}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Riepilogo upload */}
      {uploadSummary && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Riepilogo Upload</h3>
          <p className="text-sm">
            Prodotti totali: <span className="font-semibold">{uploadSummary.total}</span>
          </p>
          <p className="text-sm text-green-600">
            Caricati con successo: <span className="font-semibold">{uploadSummary.successful}</span>
          </p>
          {uploadSummary.failed > 0 && (
            <>
              <p className="text-sm text-red-600">
                Non caricati: <span className="font-semibold">{uploadSummary.failed}</span>
              </p>
              
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Dettagli errori:</p>
                <ul className="mt-1 text-xs text-red-600 list-disc pl-5">
                  {uploadSummary.failedItems.map((item, idx) => (
                    <li key={idx}>
                      Prodotto {item.index + 1} ({item.product_data.title}): {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          
          <div className="mt-4">
            <button
              type="button"
              onClick={resetUploader}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Carica un altro file
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvUploader;