import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import LoginForm from './components/LoginForm';
import ProductForm from './components/ProductForm';
import AdminDashboard from './components/AdminDashboard';
import { getUserSites, isUserAdmin } from './services/firestoreService';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSites, setUserSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('products'); // 'products' o 'admin'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      
      if (currentUser) {
        try {
          // Recupera i siti assegnati all'utente
          const sites = await getUserSites(currentUser.email);
          setUserSites(sites);

          // Se ci sono siti disponibili, seleziona il primo
          if (sites.length > 0) {
            setSelectedSite(sites[0]);
          }

          // Verifica se l'utente è un amministratore
          const adminStatus = await isUserAdmin(currentUser.email);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Errore nel caricamento dei dati utente:', error);
        }
      } else {
        // Reset stato quando l'utente si disconnette
        setUserSites([]);
        setSelectedSite(null);
        setIsAdmin(false);
        setView('products');
      }

      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup della sottoscrizione quando il componente viene smontato
    return () => unsubscribe();
  }, []);

  const handleSiteChange = (e) => {
    setSelectedSite(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  // Caricamento iniziale
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Utente non autenticato, mostra form di login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">DoCommerce</h1>
            <p className="mt-2 text-gray-600">Accedi per gestire i tuoi prodotti</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  // Utente autenticato ma senza siti assegnati
  if (userSites.length === 0 && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold mb-4">Accesso non autorizzato</h1>
          <p className="text-gray-600 mb-4">
            Non hai nessun sito WooCommerce assegnato. Contatta l'amministratore per ricevere l'accesso.
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">DoCommerce</h1>
          
          <div className="flex items-center space-x-4">
            {/* Selezione sito se l'utente ha più di un sito */}
            {userSites.length > 1 && view === 'products' && (
              <select
                value={selectedSite}
                onChange={handleSiteChange}
                className="border border-gray-300 rounded-md py-2 px-3 text-sm"
              >
                {userSites.map((site, index) => (
                  <option key={index} value={site}>
                    {site}
                  </option>
                ))}
              </select>
            )}
            
            {/* Toggle vista admin/prodotti */}
            {isAdmin && (
              <button
                onClick={() => setView(view === 'products' ? 'admin' : 'products')}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {view === 'products' ? 'Admin Dashboard' : 'Gestione Prodotti'}
              </button>
            )}
            
            {/* Informazioni utente e logout */}
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">{user.email}</span>
              <button
                onClick={handleLogout}
                className="py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenuto principale */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {view === 'admin' && isAdmin ? (
          <AdminDashboard />
        ) : (
          <ProductForm 
            user={user} 
            apiUrl={selectedSite ? `${selectedSite}/wp-json/docommerce/v1` : ''} 
          />
        )}
      </main>
    </div>
  );
}

export default App;