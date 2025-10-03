
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { credential } from 'firebase-admin';

let app: App;

// Correctly format the service account from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Replace escaped newlines from environment variables
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        app = initializeApp({
            credential: credential.cert(serviceAccount),
        });
    } else {
        console.warn("Firebase Admin SDK credentials are not fully provided in environment variables. Server-side auth might not work.");
        // Initialize with default credentials if running in a Google Cloud environment
        app = initializeApp();
    }
} else {
    app = getApp();
}

export const auth: Auth = getAuth(app);
