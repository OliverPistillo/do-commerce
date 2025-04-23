import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB4gof6OH5pXHQgG9WmlkBE_i-LJ49xedw",
  authDomain: "docommerce-c35ad.firebaseapp.com",
  projectId: "docommerce-c35ad",
  storageBucket: "docommerce-c35ad.firebasestorage.app",
  messagingSenderId: "67363967209",
  appId: "1:67363967209:web:42d913b94a902d1172a078",
  measurementId: "G-BGSZ9P2V4T"
};

// Inizializza Firebase
export const app = initializeApp(firebaseConfig);

// Esporta istanze di servizi
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;