// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration for MindShift project
const firebaseConfig = {
  apiKey: "ADD-YOUR-API-KEY",
  authDomain: "ADD-YOUR-API-KEY",
  projectId: "ADD-YOUR-API-KEY",
  storageBucket: "mADD-YOUR-API-KEY",
  messagingSenderId: "ADD-YOUR-API-KEY",
  appId: "ADD-YOUR-API-KEY",
  measurementId: "ADD-YOUR-API-KEY"
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
