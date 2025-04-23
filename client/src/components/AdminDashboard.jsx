import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ email: '', password: '', sites: [''] });
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  
  const db = getFirestore();
  const auth = getAuth();

  // Carica tutti gli utenti da Firestore
  const loadUsers = async () => {
    setLoading(true);
    try {
      const userSitesCollection = collection(db, 'userSites');
      const snapshot = await getDocs(userSitesCollection);
      
      const loadedUsers = snapshot.docs.map(doc => ({
        email: doc.id,
        sites: doc.data().sites || []
      }));
      
      setUsers(loadedUsers);
    } catch (error) {
      console.error("Errore nel caricamento degli utenti:", error);
      alert("Impossibile caricare gli utenti: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Crea un nuovo utente
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Crea l'utente in Firebase Auth
      await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      
      // Salva i siti dell'utente in Firestore
      const userRef = doc(db, 'userSites', newUser.email);
      await setDoc(userRef, {
        sites: newUser.sites.filter(site => site.trim() !== '')
      });
      
      // Reset form e ricarica la lista
      setNewUser({ email: '', password: '', sites: [''] });
      loadUsers();
      alert('Utente creato con successo!');
    } catch (error) {
      console.error("Errore nella creazione dell'utente:", error);
      alert("Errore nella creazione dell'utente: " + error.message);
    }
  };

  // Modifica un utente esistente
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, 'userSites', editingUser.email);
      await updateDoc(userRef, {
        sites: editingUser.sites.filter(site => site.trim() !== '')
      });
      
      setEditingUser(null);
      loadUsers();
      alert('Utente aggiornato con successo!');
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'utente:", error);
      alert("Errore nell'aggiornamento dell'utente: " + error.message);
    }
  };

  // Elimina un utente
  const handleDeleteUser = async (email) => {
    if (window.confirm(`Sei sicuro di voler eliminare l'utente ${email}?`)) {
      try {
        const userRef = doc(db, 'userSites', email);
        await deleteDoc(userRef);
        loadUsers();
        alert('Utente eliminato con successo!');
      } catch (error) {
        console.error("Errore nell'eliminazione dell'utente:", error);
        alert("Errore nell'eliminazione dell'utente: " + error.message);
      }
    }
  };

  // Gestione del form per nuovo utente
  const handleNewUserChange = (field, value, index = null) => {
    if (field === 'sites' && index !== null) {
      const updatedSites = [...newUser.sites];
      updatedSites[index] = value;
      setNewUser({ ...newUser, sites: updatedSites });
    } else {
      setNewUser({ ...newUser, [field]: value });
    }
  };

  // Aggiunge un campo per un nuovo sito
  const addSiteField = (isNewUser = true) => {
    if (isNewUser) {
      setNewUser({ ...newUser, sites: [...newUser.sites, ''] });
    } else {
      setEditingUser({ ...editingUser, sites: [...editingUser.sites, ''] });
    }
  };

  // Rimuove un campo sito
  const removeSiteField = (index, isNewUser = true) => {
    if (isNewUser) {
      const updatedSites = newUser.sites.filter((_, i) => i !== index);
      setNewUser({ ...newUser, sites: updatedSites });
    } else {
      const updatedSites = editingUser.sites.filter((_, i) => i !== index);
      setEditingUser({ ...editingUser, sites: updatedSites });
    }
  };

  // Gestione form per modifica utente
  const handleEditUserChange = (field, value, index = null) => {
    if (field === 'sites' && index !== null) {
      const updatedSites = [...editingUser.sites];
      updatedSites[index] = value;
      setEditingUser({ ...editingUser, sites: updatedSites });
    } else {
      setEditingUser({ ...editingUser, [field]: value });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Creazione nuovo utente */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Crea Nuovo Utente</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                value={newUser.email} 
                onChange={(e) => handleNewUserChange('email', e.target.value)}
                className="w-full border p-2 rounded" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input 
                type="password" 
                value={newUser.password} 
                onChange={(e) => handleNewUserChange('password', e.target.value)}
                className="w-full border p-2 rounded" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Siti WooCommerce</label>
            {newUser.sites.map((site, index) => (
              <div key={index} className="flex items-center mb-2">
                <input 
                  type="url" 
                  value={site} 
                  onChange={(e) => handleNewUserChange('sites', e.target.value, index)}
                  placeholder="https://negozio.it" 
                  className="flex-1 border p-2 rounded" 
                />
                <button 
                  type="button" 
                  onClick={() => removeSiteField(index)}
                  className="ml-2 bg-red-500 text-white p-2 rounded"
                >
                  Rimuovi
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => addSiteField()}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Aggiungi Sito
            </button>
          </div>
          
          <button 
            type="submit" 
            className="bg-green-600 text-white py-2 px-4 rounded"
          >
            Crea Utente
          </button>
        </form>
      </div>
      
      {/* Lista utenti */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Utenti Registrati</h2>
        
        {loading ? (
          <p>Caricamento utenti...</p>
        ) : (
          <div className="space-y-4">
            {users.length === 0 ? (
              <p>Nessun utente trovato.</p>
            ) : (
              users.map(user => (
                <div key={user.email} className="border p-4 rounded">
                  {editingUser && editingUser.email === user.email ? (
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                      <h3 className="font-medium">{user.email}</h3>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Siti WooCommerce</label>
                        {editingUser.sites.map((site, index) => (
                          <div key={index} className="flex items-center mb-2">
                            <input 
                              type="url" 
                              value={site} 
                              onChange={(e) => handleEditUserChange('sites', e.target.value, index)}
                              className="flex-1 border p-2 rounded" 
                            />
                            <button 
                              type="button" 
                              onClick={() => removeSiteField(index, false)}
                              className="ml-2 bg-red-500 text-white p-2 rounded"
                            >
                              Rimuovi
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addSiteField(false)}
                          className="bg-blue-500 text-white p-2 rounded"
                        >
                          Aggiungi Sito
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          type="submit" 
                          className="bg-green-600 text-white py-2 px-4 rounded"
                        >
                          Salva
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setEditingUser(null)}
                          className="bg-gray-500 text-white py-2 px-4 rounded"
                        >
                          Annulla
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 className="font-medium">{user.email}</h3>
                      <div className="mt-2">
                        <p className="font-medium text-sm">Siti assegnati:</p>
                        {user.sites.length === 0 ? (
                          <p className="text-sm text-gray-500">Nessun sito assegnato</p>
                        ) : (
                          <ul className="list-disc list-inside">
                            {user.sites.map((site, index) => (
                              <li key={index} className="text-sm">{site}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="bg-blue-500 text-white py-1 px-3 rounded text-sm"
                        >
                          Modifica
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.email)}
                          className="bg-red-500 text-white py-1 px-3 rounded text-sm"
                        >
                          Elimina
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;