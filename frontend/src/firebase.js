// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration for MindShift project
const firebaseConfig = {
  apiKey: "AIzaSyDduKfW6fXKFx4Fzq02Q4Tc23H-8AvubgU",
  authDomain: "mindshift-206.firebaseapp.com",
  projectId: "mindshift-206",
  storageBucket: "mindshift-206.firebasestorage.app",
  messagingSenderId: "981890857456",
  appId: "1:981890857456:web:b5adacfa133b372a56c535",
  measurementId: "G-92F0Z373KX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    connectFirestoreEmulator(db, 'localhost', 8081);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('✅ Connected to Firebase emulators');
  } catch (error) {
    console.log('⚠️ Emulator connection failed:', error.message);
  }
}

export default app;