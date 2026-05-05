const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

async function generateQuizzes() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY no encontrada en el entorno.');
    return;
  }

  const genAI = new GoogleGenAI({ apiKey });

  const estudioContent = fs.readFileSync('estudio.txt', 'utf8');
  const courseBlocks = estudioContent.split(/={10,}/);

  const allQuizzes = {};

  let currentCourseId = null;
  let currentCourseName = null;

  const sections = estudioContent.split(/={10,}/);

  for (const section of sections) {
    if (!section.trim()) continue;

    const courseMatch = section.match(/\[(C\d+)\]\s+Nombre del curso: (.*)/);
    if (courseMatch) {
      currentCourseId = courseMatch[1];
      currentCourseName = courseMatch[2].trim();
      console.log(`Procesando curso: ${currentCourseName} (${currentCourseId})...`);
      continue;
    }

    // If it's not a course header, it must be the modules for the current course
    if (currentCourseId) {
      const moduleBlocks = section.split(/-{10,}/);
      for (const mBlock of moduleBlocks) {
        if (!mBlock.trim()) continue;

        const moduleMatch = mBlock.match(/\[(M\d+)\]\s+Nombre del módulo: (.*)/);
        if (!moduleMatch) continue;

        const moduleId = moduleMatch[1];
        const moduleName = moduleMatch[2].trim();
        const key = `${currentCourseId}${moduleId}`;

        console.log(`  Generando quiz estructurado para ${moduleName}...`);

        const prompt = `Genera un cuestionario PROFESIONAL de 10 preguntas en ESPAÑOL basado en el siguiente contenido educativo. 
      
      ESTRUCTURA DEL CUESTIONARIO (OBLIGATORIA):
      1. Preguntas 1-6: Selección múltiple clásica (3-4 opciones, solo una correcta).
      2. Preguntas 7-8: Casos prácticos (Situación real donde el alumno elige la mejor acción de 4 opciones).
      3. Pregunta 9: Ordenar pasos (Una lista de 4-5 pasos que el alumno debe ordenar correctamente).
      4. Pregunta 10: Explicación corta (Pregunta abierta de desarrollo, máximo 50 palabras).

      FORMATO DE RESPUESTA:
      Responde ÚNICAMENTE con un objeto JSON que contenga un array llamado "questions".
      Cada objeto del array debe seguir este esquema según su tipo:
      - MC y Casos (1-8): { "type": "mc", "question": "...", "options": ["...", "..."], "correctAnswerIndex": 0 }
      - Ordenar (9): { "type": "order", "question": "Ordena los pasos de...", "options": ["Paso B", "Paso A", "Paso C"], "correctOrder": ["Paso A", "Paso B", "Paso C"] }
      - Desarrollo (10): { "type": "short", "question": "Explica la diferencia entre...", "explanation": "Criterios: mencionar pH, mencionar hidratación..." }

      No incluyas markdown, solo el JSON.

      Contenido del módulo:
      ${mBlock}`;

      try {
        const result = await genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        let text = result.text.trim();
        
        if (text.includes('```')) {
          text = text.replace(/```json|```/g, '').trim();
        }

        const data = JSON.parse(text);
        allQuizzes[key] = data.questions || data; // Handle both direct array or wrapped object
      } catch (error) {
        console.error(`    Error en ${key}:`, error.message);
      }
    }
    }
  }

  fs.writeFileSync('quizzes.json', JSON.stringify(allQuizzes, null, 2));
  console.log('¡Quizzes estructurados generados exitosamente en quizzes.json!');
}

generateQuizzes();
