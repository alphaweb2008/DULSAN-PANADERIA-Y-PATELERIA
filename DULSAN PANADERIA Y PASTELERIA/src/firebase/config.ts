import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Credenciales de Firebase - Dulsan Cafetería
const app = initializeApp({
  apiKey: "AIzaSyB5jWNhyeHPL-3NFjJ6o5FSa12NtZ_aJkc",
  authDomain: "dulsan-menu-principal.firebaseapp.com",
  projectId: "dulsan-menu-principal",
  storageBucket: "dulsan-menu-principal.firebasestorage.app",
  messagingSenderId: "557421910086",
  appId: "1:557421910086:web:b1383067a662c5e61f5247"
});

export const db = getFirestore(app);
