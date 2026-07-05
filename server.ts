import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini Client with correct User-Agent for telemetry
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Base prompt endpoint
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not configured. Please add it to your secrets panel.' 
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || 'You are a helpful creative assistant.',
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini generate error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate content' });
    }
  });

  // Structured brainstorming endpoint
  app.post('/api/gemini/brainstorm', async (req, res) => {
    try {
      const { conceptTitle, conceptDescription } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not configured. Please add it to your secrets panel.' 
        });
      }

      const systemInstruction = 
        'You are an expert brainstorming assistant. Your job is to break down a central concept into 3 to 4 logical, highly creative sub-concepts, ideas, or actionable questions. You MUST respond with a valid JSON array matching the requested schema exactly. IMPORTANT: You MUST write all titles and content descriptions in Behdini Kurdish (Kurdish of Duhok, "کوردیا بەهدینی"). Do not use English or Sorani Kurdish for the titles or content paragraphs; use pure, friendly, and professional Behdini Kurdish.';

      const prompt = `Brainstorm 3 or 4 sub-concepts for this central idea:
Topic (The central idea): "${conceptTitle}"
Context: "${conceptDescription || 'No additional details provided'}"

For each sub-concept, provide a concise but inspiring title in Behdini Kurdish, a descriptive paragraph of 2-3 sentences explaining it in Behdini Kurdish, and suggest a node type from this list: 'concept', 'action', or 'question'.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'A list of sub-concepts or ideas.',
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: 'The title of the sub-concept in Behdini Kurdish.',
                },
                content: {
                  type: Type.STRING,
                  description: 'A descriptive paragraph explaining the sub-concept in Behdini Kurdish (2-3 sentences).',
                },
                type: {
                  type: Type.STRING,
                  description: 'The type of idea. Must be either "concept", "action", or "question".',
                },
              },
              required: ['title', 'content', 'type'],
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No content returned from Gemini API');
      }

      // Try parsing the JSON safely before sending
      const parsed = JSON.parse(responseText.trim());
      res.json(parsed);
    } catch (error: any) {
      console.error('Gemini brainstorm error:', error);
      res.status(500).json({ error: error.message || 'Failed to brainstorm branches' });
    }
  });

  // Serve static assets in production or mount Vite middleware in development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Dynamically import Vite in dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] AI Concept Canvas running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start full-stack server:', err);
});
