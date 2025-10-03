import * as admin from 'firebase-admin';

// Ensure that the environment variables are not undefined before initializing
if (
  !admin.apps.length &&
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK Initialized');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error', error.stack);
  }
}

export const fcm = admin.messaging();
export default admin;
