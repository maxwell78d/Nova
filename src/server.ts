import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

import Groq from 'groq-sdk';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json()); // Add JSON body parser for API requests

const angularApp = new AngularNodeAppEngine();

/**
 * Production Security Headers
 */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});


// Groq API Endpoint (For Chatbot)
app.post('/api/chat', async (req, res, next) => {
  try {
    const { message, history, context } = req.body;
    let apiKey = process.env['GROQ_API_KEY'];
    
    // Fallback: try to read .env file manually if not in process.env
    if (!apiKey) {
      try {
        const fs = await import('fs');
        const envContent = fs.readFileSync(join(process.cwd(), '.env'), 'utf-8');
        const match = envContent.match(/GROQ_API_KEY="(.*?)"/);
        if (match && match[1]) apiKey = match[1];
      } catch (e) {
        console.warn('Could not read .env file');
      }
    }

    if (!apiKey) {
      res.status(500).json({ error: 'GROQ_API_KEY not configured' });
      return;
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = context 
      ? `Eres un tutor académico de la plataforma NOVA Academy. Responde siempre en español. \nContexto del curso: ${context}`
      : `Eres un tutor académico de la plataforma NOVA Academy. Responde siempre en español.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((h: any) => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts[0].text
      })),
      { role: 'user', content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || 'Sin respuesta';
    res.json({ response: responseText });
  } catch (error: any) {
    console.error('Groq Chat API Error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Error processing Groq request' });
  }
});

// Groq API Endpoint (For Academic Evaluation)
app.post('/api/evaluate', async (req, res, next) => {
  try {
    const { message, history, context } = req.body;
    let apiKey = process.env['GROQ_EVAL_KEY'];
    
    // Fallback: try to read .env file manually if not in process.env
    if (!apiKey) {
      try {
        const fs = await import('fs');
        const envContent = fs.readFileSync(join(process.cwd(), '.env'), 'utf-8');
        const match = envContent.match(/GROQ_EVAL_KEY="(.*?)"/);
        if (match && match[1]) apiKey = match[1];
      } catch (e) {
        console.warn('Could not read .env file');
      }
    }

    if (!apiKey) {
      res.status(500).json({ error: 'GROQ_EVAL_KEY not configured' });
      return;
    }

    const groq = new Groq({ apiKey });

    const messages: any[] = [
      { role: 'system', content: `Eres un estricto evaluador académico de NOVA Academy. Evalúa la respuesta del alumno según las instrucciones dadas. Si se pide una puntuación numérica, da SOLO el número.` },
      { role: 'user', content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile', // High precision model for evaluations
      temperature: 0.1, // Low temperature for deterministic grading
      max_tokens: 500,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '0';
    res.json({ response: responseText });
  } catch (error: any) {
    console.error('Groq Eval API Error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Error processing Eval request' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
