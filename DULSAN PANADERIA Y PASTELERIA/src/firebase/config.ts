import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Credenciales de Firebase - Dulsan Pastelería y Panadería
const app = initializeApp({
  apiKey: "AIzaSyAyx-qrA8qKNofTgZy-WoO7sUtRl6Uen44",
  authDomain: "dulsan-panaderia-y-pasteleria.firebaseapp.com",
  projectId: "dulsan-panaderia-y-pasteleria",
  storageBucket: "dulsan-panaderia-y-pasteleria.firebasestorage.app",
  messagingSenderId: "867748902765",
  appId: "1:867748902765:web:68404c6149d2897a930c64"
});

export const db = getFirestore(app);
