// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// API key check
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY missing in environment variables');
  throw new Error('GEMINI_API_KEY is required for Genkit AI');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY!,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});