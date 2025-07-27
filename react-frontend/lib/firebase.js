import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Check if we're in a browser environment and import.meta.env is available
const env = typeof import !== 'undefined' && import.meta && import.meta.env ? import.meta.env : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: env.VITE_FIREBASE_APP_ID || 'demo-app-id'
};

// Check if we're using demo values
const isDemoMode = firebaseConfig.apiKey === 'demo-api-key';

if (isDemoMode) {
  console.warn('🚧 Firebase is running in demo mode');
  console.warn('📋 To use real Firebase:');
  console.warn('1. Copy .env.example to .env');
  console.warn('2. Add your Firebase credentials to .env');
  console.warn('3. Restart your development server');
}

// Validate required environment variables for production
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !env[varName]);

if (missingEnvVars.length > 0 && !isDemoMode) {
  console.error('Missing Firebase environment variables:', missingEnvVars);
  console.error('Please copy .env.example to .env and fill in your Firebase configuration');
}

let app;
let db;
let auth;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore
  db = getFirestore(app);
  
  // Initialize Auth
  auth = getAuth(app);
  
  if (isDemoMode) {
    console.log('🎭 Firebase initialized in demo mode - some features may not work');
  } else {
    console.log('🔥 Firebase initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  
  // Create mock objects to prevent app crashes
  db = {
    collection: () => ({ 
      add: () => Promise.reject(new Error('Firebase not configured')),
      get: () => Promise.reject(new Error('Firebase not configured'))
    })
  };
  
  auth = {
    currentUser: null,
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    signOut: () => Promise.reject(new Error('Firebase not configured'))
  };
}

export { db, auth };
export default app;