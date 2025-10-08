
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validar que las variables de entorno estén configuradas y exponer el error
let firebaseMissingVars: string[] = [];
if (typeof window !== 'undefined') {
  firebaseMissingVars = [];
  if (!firebaseConfig.apiKey) firebaseMissingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) firebaseMissingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.databaseURL) firebaseMissingVars.push('NEXT_PUBLIC_FIREBASE_DATABASE_URL');
  if (!firebaseConfig.projectId) firebaseMissingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.appId) firebaseMissingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (firebaseMissingVars.length > 0) {
    console.error('❌ Variables de entorno de Firebase faltantes:', firebaseMissingVars);
    console.error('📋 Consulta FIREBASE_SETUP.md para instrucciones de configuración');
  }
}

// Initialize Firebase

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db, reauthenticateWithCredential, EmailAuthProvider, firebaseMissingVars };

    