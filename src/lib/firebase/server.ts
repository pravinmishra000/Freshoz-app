
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { credential } from 'firebase-admin';

// Correctly format the service account from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Replace escaped newlines from environment variables
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app: App = !getApps().length
  ? initializeApp({
      credential: credential.cert(serviceAccount),
    })
  : getApp();

export const auth: Auth = getAuth(app);
