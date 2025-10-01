// /pages/api/ai.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { ai } from '@/lib/ai-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: "Prompt missing" });

    const response = await ai.generate({ prompt });
    res.status(200).json({ output: response.output_text });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
