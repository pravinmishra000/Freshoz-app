
// lib/firebase/client.ts
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyB0Qz9PY7rWZbTbRKSm8Yd3WpkInJkz0lw",
  authDomain: "studio-1002855358-a7716.firebaseapp.com",
  projectId: "studio-1002855358-a7716",
  storageBucket: "studio-1002855358-a7716.appspot.com",
  messagingSenderId: "840479392017",
  appId: "1:840479392017:web:3ea988e80fbfa8bd88ccb0"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
