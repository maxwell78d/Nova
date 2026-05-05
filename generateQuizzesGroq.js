const fs = require('fs');
const Groq = require('groq-sdk');

// Load .env file for local usage
try { require('dotenv').config(); } catch(e) {}

// Read key from environment variable — never hardcode
const apiKey = process.env.GROQ_GEN_KEY;
if (!apiKey) {
  console.error('ERROR: GROQ_GEN_KEY not set. Run: set GROQ_GEN_KEY=your_key');
  process.exit(1);
}
const groq = new Groq({ apiKey });

const courses = {
  'c1': 'Belleza y Cosmetología Profesional',
  'c2': 'Máster en Uñas Acrílicas y Nail Art',
  'c3': 'Auxiliar de Farmacia Especializado',
  'c4': 'Informática Básica',
  'c5': 'Inglés Básico',
  'c6': 'Masaje Profesional',
  'c7': 'Corte y Peinado',
  'c8': 'Maquillaje Profesional',
  'c9': 'Barbería Profesional',
  'c10': 'Repostería Profesional',
  'c11': 'Decoración de Eventos',
  'c12': 'Contabilidad Básica'
};

const moduleNames = [
  'Fundamentos y Conceptos Básicos',
  'Herramientas y Preparación',
  'Técnicas Esenciales',
  'Casos Prácticos y Especialización',
  'Proyecto Final y Certificación',
  'Examen Final Integral'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateQuizForModule(courseName, moduleNum, moduleTitle) {
  const prompt = `Eres un experto creador de contenido educativo. Crea un examen único y riguroso de 10 preguntas sobre el curso "${courseName}", enfocándote en el módulo ${moduleNum}: "${moduleTitle}".

DEBES DEVOLVER ÚNICAMENTE UN ARRAY JSON CON 10 OBJETOS, NADA MÁS. SIN TEXTO EXTRA.

Estructura estricta del JSON:
[
  // Preguntas 1 a 6: type "mc" (Selección múltiple teórica)
  {
    "type": "mc",
    "question": "Pregunta teórica sobre el tema...",
    "options": ["Respuesta correcta", "Distractor 1", "Distractor 2", "Distractor 3"],
    "correctAnswerIndex": 0 // El índice de la opción correcta (mezcla el orden para que no siempre sea 0)
  },
  // Preguntas 7 y 8: type "mc" (Casos prácticos)
  {
    "type": "mc",
    "question": "Caso práctico: Un cliente llega con X problema. ¿Qué haces?",
    "options": ["Opción correcta", "Error común", "Opción peligrosa", "Opción ineficaz"],
    "correctAnswerIndex": 0 // Mezcla el orden
  },
  // Pregunta 9: type "order" (Ordenar pasos lógicos)
  {
    "type": "order",
    "question": "Ordena cronológicamente los pasos para realizar X procedimiento:",
    "options": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"], // Array de opciones desordenadas
    "correctOrder": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"] // Array con el orden correcto exacto
  },
  // Pregunta 10: type "short" (Pregunta de desarrollo corto)
  {
    "type": "short",
    "question": "Explica brevemente (máx 50 palabras) por qué es importante X en este procedimiento.",
    "explanation": "Guía para el evaluador: El alumno debe mencionar la importancia de Y y Z."
  }
]

Haz que las opciones sean realistas y desafiantes. Recuerda devolver SOLO EL JSON VÁLIDO.`;

  let retries = 3;
  while (retries > 0) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: "json_object" } // Enforce JSON
      });

      // We asked for an array, but response_format json_object requires an object.
      // So let's wrap the prompt's expected output in an object {"questions": [...]}
      // Wait, let me adjust the prompt to return {"questions": [...]}
      // I'll parse it below.
      return chatCompletion.choices[0]?.message?.content;
    } catch (e) {
      if (e.status === 429) {
        console.log(`Rate limit hit, waiting 5 seconds...`);
        await sleep(5000);
        retries--;
      } else {
        throw e;
      }
    }
  }
  throw new Error("Failed after retries");
}

async function main() {
  let quizzesData = {};
  if (fs.existsSync('quizzes.json')) {
    try {
      quizzesData = JSON.parse(fs.readFileSync('quizzes.json', 'utf8'));
    } catch (e) {
      quizzesData = {};
    }
  }

  const courseIds = Object.keys(courses);
  for (const cId of courseIds) {
    const courseName = courses[cId];
    
    for (let m = 1; m <= 6; m++) {
      const moduleKey = `${cId.toUpperCase()}M${m}`;
      
      if (quizzesData[moduleKey] && quizzesData[moduleKey].length === 10 && quizzesData[moduleKey][0].question.indexOf('Opción incorrecta') === -1) {
        console.log(`Skipping ${moduleKey}, already generated properly.`);
        continue;
      }

      console.log(`Generating quiz for ${moduleKey} (${courseName} - Module ${m})...`);
      
      // Ajuste del prompt para que devuelva un objeto JSON, ya que llama-3.3 en modo json requiere un objeto raíz
      const prompt = `Eres un experto creador de contenido educativo. Crea un examen único y riguroso de 10 preguntas sobre el curso "${courseName}", enfocándote en el módulo ${m}: "${moduleNames[m-1]}".

DEBES DEVOLVER ÚNICAMENTE UN OBJETO JSON CON LA PROPIEDAD "questions" QUE CONTENGA UN ARRAY DE 10 OBJETOS.

Estructura estricta del JSON:
{
  "questions": [
    {
      "type": "mc",
      "question": "Pregunta teórica sobre el tema...",
      "options": ["Respuesta correcta", "Distractor 1", "Distractor 2", "Distractor 3"],
      "correctAnswerIndex": 2
    },
    {
      "type": "mc",
      "question": "Caso práctico: Un cliente llega con X problema. ¿Qué haces?",
      "options": ["Opción correcta", "Error común", "Opción peligrosa", "Opción ineficaz"],
      "correctAnswerIndex": 0
    },
    {
      "type": "order",
      "question": "Ordena cronológicamente los pasos para realizar X procedimiento:",
      "options": ["Paso 2", "Paso 4", "Paso 1", "Paso 3"], 
      "correctOrder": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"] 
    },
    {
      "type": "short",
      "question": "Explica brevemente (máx 50 palabras) por qué es importante X en este procedimiento.",
      "explanation": "Guía para el evaluador: El alumno debe mencionar la importancia de Y y Z."
    }
  ]
}

- Genera EXACTAMENTE 6 preguntas de type "mc" teóricas.
- Genera EXACTAMENTE 2 preguntas de type "mc" de casos prácticos.
- Genera EXACTAMENTE 1 pregunta de type "order".
- Genera EXACTAMENTE 1 pregunta de type "short".
- Total: 10 preguntas en el array "questions".
- Haz que las opciones sean realistas y desafiantes.`;

      let success = false;
      let retries = 3;
      while (!success && retries > 0) {
        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            response_format: { type: "json_object" }
          });

          const responseText = chatCompletion.choices[0]?.message?.content;
          const parsed = JSON.parse(responseText);
          
          if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length === 10) {
            quizzesData[moduleKey] = parsed.questions;
            fs.writeFileSync('quizzes.json', JSON.stringify(quizzesData, null, 2));
            console.log(`  -> Success! Saved ${moduleKey}.`);
            success = true;
          } else {
            console.log(`  -> Bad format, retrying...`);
            retries--;
          }
        } catch (e) {
          console.error(`  -> Error: ${e.message}`);
          if (e.status === 429) {
            await sleep(6000);
          }
          retries--;
        }
        await sleep(3000); // Wait between calls to avoid rate limits
      }
    }
  }
  console.log("All quizzes generated!");
}

main();
