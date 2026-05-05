const fs = require('fs');

const cursosTxt = fs.readFileSync('cursos.txt', 'utf8');
const generateJS = fs.readFileSync('generateFullCourses.js', 'utf8');

const topics = {
  'C1': 'Belleza y Cosmetología Profesional',
  'C2': 'Máster en Uñas Acrílicas y Nail Art',
  'C3': 'Auxiliar de Farmacia Especializado',
  'C4': 'Informática Básica',
  'C5': 'Inglés Básico',
  'C6': 'Masaje Profesional',
  'C7': 'Corte y Peinado',
  'C8': 'Maquillaje Profesional',
  'C9': 'Barbería Profesional',
  'C10': 'Repostería Profesional',
  'C11': 'Decoración de Eventos',
  'C12': 'Contabilidad Básica'
};

const moduleNames = [
  'Fundamentos y Conceptos Básicos',
  'Herramientas y Preparación',
  'Técnicas Esenciales',
  'Casos Prácticos y Especialización',
  'Proyecto Final y Certificación',
  'Examen Final'
];

// Extract topicsData (questions) from generateJS
let questionsMap = {};
try {
  const match = generateJS.match(/const topicsData = (\{[\s\S]*?\n  \});/);
  if (match) {
    // A bit hacky but works for the static structure
    const topicsDataStr = match[1]
      .replace(/'/g, '"')
      .replace(/(['"])?([a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)(['"])?:/g, '"$2": ');
    // We actually just parse it using eval since it's safe local code
    const topicsData = eval('(' + match[1] + ')');
    questionsMap = topicsData;
  }
} catch (e) {
  console.log("Error parsing topicsData", e);
}

const defaultQuestions = [
  '¿Cuál es el objetivo principal del Módulo en este curso?',
  'En un entorno profesional, la ética laboral implica:',
  'El paso más importante antes de iniciar cualquier procedimiento es:',
  '¿Cuál es la mejor práctica para mantener el área de trabajo limpia?',
  '¿Qué actitud es clave para el éxito profesional?'
];

// Parse cursos.txt for topics
const regex = /-\s*(C\d+M\d+)\r?\n\*\*Tema:\*\*\s*(.*?)\r?\n/gi;
const temasMap = {};
let matchInfo;
while ((matchInfo = regex.exec(cursosTxt)) !== null) {
  temasMap[matchInfo[1].toUpperCase()] = matchInfo[2].trim();
}

let output = '';

for (let c = 1; c <= 12; c++) {
  const cKey = 'C' + c;
  const courseName = topics[cKey];

  output += `==================================================\n`;
  output += `[${cKey}]\n`;
  output += `Nombre del curso: ${courseName}\n`;
  output += `==================================================\n\n`;

  for (let m = 1; m <= 6; m++) {
    const mKey = 'M' + m;
    const fullKey = cKey + mKey;
    const modName = moduleNames[m-1];
    const temaDesc = temasMap[fullKey] || 'Descripción no disponible.';
    
    // Extract concepts from the description
    const conceptsParts = temaDesc.split('—');
    const introPart = conceptsParts[0] ? conceptsParts[0].trim() : '';
    const detailsPart = conceptsParts[1] ? conceptsParts[1].split('Canal:')[0].trim() : temaDesc;

    output += `--------------------------------------------------\n`;
    output += `[${mKey}]\n`;
    output += `Nombre del módulo: ${modName}\n`;
    output += `--------------------------------------------------\n\n`;

    output += `CONTENIDO TEÓRICO:\n`;
    output += `Bienvenido a la lección teórica de ${courseName}, enfocada en ${modName}. En esta etapa abordaremos a profundidad los aspectos clave que diferencian a un aficionado de un verdadero profesional. Se explica: ${detailsPart}.\n\n`;

    output += `CONCEPTOS CLAVE:\n`;
    output += `- Consistencia y Método: Un profesional no depende de la inspiración momentánea, sino de sistemas probados.\n`;
    output += `- Contexto Técnico: Base científica e histórica de las herramientas y materiales para prever y resolver problemas.\n`;
    output += `- ${introPart}: Fundamento principal abordado en el video/módulo.\n\n`;

    output += `PROCEDIMIENTOS:\n`;
    output += `1. Planificación: Reducción de errores mediante previsión y preparación del área de trabajo.\n`;
    output += `2. Ejecución: Aplicación de la técnica (${detailsPart}) obtenida a través del estudio.\n`;
    output += `3. Evaluación: Capacidad de autocrítica constructiva y revisión del resultado.\n\n`;

    output += `EJEMPLOS:\n`;
    output += `Aplicación práctica de ${detailsPart} en un entorno real de trabajo o estudio, siguiendo los protocolos de seguridad.\n\n`;

    output += `HERRAMIENTAS:\n`;
    if (m === 2) {
      output += `Equipamiento básico, herramientas de la disciplina, productos esenciales y protocolos de desinfección/limpieza.\n\n`;
    } else {
      output += `Herramientas, software o materiales específicos mencionados en el tema: ${detailsPart}.\n\n`;
    }

    output += `ERRORES COMUNES:\n`;
    output += `- Práctica sin base teórica previa.\n`;
    output += `- Falta de planificación y diagnóstico inicial.\n`;
    output += `- Ignorar protocolos de seguridad o higiene.\n\n`;

    output += `PUNTOS IMPORTANTES PARA EXAMEN:\n`;
    if (m === 6) {
      output += `- Repaso general de todos los módulos anteriores.\n`;
      output += `- Simulacro de certificación y resolución de casos prácticos.\n`;
    } else {
      // Add specific questions if any
      const courseQuestions = questionsMap[courseName];
      if (courseQuestions && m === 1) {
        courseQuestions.forEach(q => {
          output += `- Concepto evaluado: ${q[0]}\n`;
        });
      } else {
        output += `- Conceptos fundamentales de ${modName}.\n`;
        output += `- Entendimiento de la técnica: ${detailsPart}.\n`;
      }
    }
    output += `\n`;

    output += `FUENTES UTILIZADAS:\n`;
    output += `- Material de lectura de la plataforma (HTML interactivo).\n`;
    output += `- Descripción y contenido de video: ${temaDesc}\n`;
    output += `- Banco de preguntas y recursos complementarios del módulo.\n\n`;
  }
}

fs.writeFileSync('estudio.txt', output);
console.log('estudio.txt generado con éxito.');
