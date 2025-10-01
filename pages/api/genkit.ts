import type { NextApiRequest, NextApiResponse } from 'next';
import { ai } from '@/lib/ai-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt, history } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt missing" });

    // AI call server-side
    const response = await ai.generate({ prompt, context: history || [] });
    res.status(200).json({ output: response.output_text });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
