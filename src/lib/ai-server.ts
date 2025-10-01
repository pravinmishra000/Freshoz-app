// /lib/ai-server.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: "ignored-for-security",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: "ignored-for-security",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: ""
};

export const ai = genkit({
  plugins: [
    googleAI({
      credentials: serviceAccount,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
