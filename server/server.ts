import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import admin from 'firebase-admin';
import Groq from 'groq-sdk';

/**
 * 🚀 NOVA ACADEMY - BACKEND API (EXPRESS ONLY)
 */

const app = express();
app.use(express.json());

// ===========================================================================
// FIREBASE INITIALIZATION (SECURE)
// ===========================================================================
try {
  // En producción (Render) las variables de entorno están en process.env
  // En desarrollo local se pueden cargar desde un .env si se usa dotenv
  const projectId = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
  const privateKey = process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    console.log('✅ Firebase Admin initialized via Env Variables');
  } else {
    console.warn('⚠️ Firebase credentials missing in Env Variables. Firebase features might not work.');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
}

const db = admin.apps.length ? admin.firestore() : null;

// ===========================================================================
// HELPERS
// ===========================================================================
function getApiKey(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(new RegExp(`${key}="(.*?)"`));
      return match?.[1] ?? undefined;
    }
  } catch {}
  return undefined;
}

// ===========================================================================
// API ROUTES
// ===========================================================================

// /api/chat - Chatbot with Groq
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context } = req.body;
    const apiKey = getApiKey('GROQ_API_KEY');

    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const groq = new Groq({ apiKey });
    const systemPrompt = context
      ? `Eres un tutor académico de la plataforma NOVA Academy. Responde siempre en español.\nContexto del curso: ${context}`
      : `Eres un tutor académico de la plataforma NOVA Academy. Responde siempre en español.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((h: any) => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts[0].text,
      })),
      { role: 'user', content: message },
    ];

    const chat = await groq.chat.completions.create({
      messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
    });

    res.json({ response: chat.choices[0]?.message?.content || 'Sin respuesta' });
  } catch (err: any) {
    console.error('Groq Chat Error:', err.message);
    res.status(500).json({ error: 'Error processing chat request' });
  }
});

// /api/evaluate - Academic evaluation
app.post('/api/evaluate', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const apiKey = getApiKey('GROQ_EVAL_KEY');

    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_EVAL_KEY not configured' });
    }

    const groq = new Groq({ apiKey });
    const messages: any[] = [
      { role: 'system', content: 'Eres un estricto evaluador académico de NOVA Academy. Evalúa la respuesta del alumno según las instrucciones dadas. Si se pide una puntuación numérica, da SOLO el número.' },
      { role: 'user', content: message },
    ];

    const chat = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 500,
    });

    res.json({ response: chat.choices[0]?.message?.content || '0' });
  } catch (err: any) {
    console.error('Groq Eval Error:', err.message);
    res.status(500).json({ error: 'Error processing evaluation' });
  }
});

// ===========================================================================
// ANGULAR STATIC SERVING & SPA FALLBACK
// ===========================================================================

// En dist/, el servidor está en dist/server.js y Angular en dist/browser/
const staticPath = path.join(__dirname, 'browser');

app.use(express.static(staticPath, {
  maxAge: '1y',
  index: false
}));

// Fallback para SPA: cualquier ruta no manejada devuelve index.html
app.get(/.*/, (req: Request, res: Response) => {
  const indexFile = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Frontend not found. Make sure to run "ng build" first.');
  }
});

// ===========================================================================
// START SERVER
// ===========================================================================
const PORT = process.env['PORT'] || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Nova Academy Server Running:`);
  console.log(`   - Mode: SPA + Backend API`);
  console.log(`   - Port: ${PORT}`);
  console.log(`   - Static path: ${staticPath}\n`);
});
