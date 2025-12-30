// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 1. Load config from .env (Typesafe and clean)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 2. Initialize App (Singleton Pattern)
// We only want to do this once.
const app = initializeApp(firebaseConfig);

// 3. Export specific instances
// This prevents "prop drilling" configuration later.
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optional: Log to verify connection in dev mode only
if (import.meta.env.DEV) {
  console.log("🔥 Firebase Initialized");
}