import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Avoid initializing Firebase during static SSR/Expo export on the server.
const isBrowser = typeof window !== 'undefined';
const app = isBrowser && (getApps().length ? getApps()[0]! : initializeApp(firebaseConfig));
export const auth = isBrowser ? getAuth(app as any) : (null as any);
export const db = isBrowser ? getFirestore(app as any) : (null as any);
export const googleProvider = isBrowser ? new GoogleAuthProvider() : (null as any);
