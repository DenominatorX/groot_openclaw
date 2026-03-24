import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config — replace with real values from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lumina-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lumina-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:demo',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firestore paths — /artifacts/{appId}/users/{userId}/...
export const APP_ID = import.meta.env.VITE_FIREBASE_APP_ID || 'lumina-demo';
export const userPath = (userId, collection) =>
  `artifacts/${APP_ID}/users/${userId}/${collection}`;
