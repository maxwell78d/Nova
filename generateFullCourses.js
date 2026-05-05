const fs = require('fs');

const covers = {
  'c1': 'https://images.pexels.com/photos/3985361/pexels-photo-3985361.jpeg',
  'c2': 'https://images.pexels.com/photos/34930151/pexels-photo-34930151.jpeg',
  'c3': 'https://images.pexels.com/photos/19471016/pexels-photo-19471016.jpeg',
  'c4': 'https://images.pexels.com/photos/5621952/pexels-photo-5621952.jpeg',
  'c5': 'https://images.pexels.com/photos/8466704/pexels-photo-8466704.jpeg',
  'c6': 'https://images.pexels.com/photos/31234760/pexels-photo-31234760.jpeg',
  'c7': 'https://images.pexels.com/photos/32329615/pexels-photo-32329615.jpeg',
  'c8': 'https://images.pexels.com/photos/33580449/pexels-photo-33580449.jpeg',
  'c9': 'https://images.pexels.com/photos/7697445/pexels-photo-7697445.jpeg',
  'c10': 'https://images.pexels.com/photos/33393555/pexels-photo-33393555.jpeg',
  'c11': 'https://images.pexels.com/photos/17206078/pexels-photo-17206078.jpeg',
  'c12': 'https://images.pexels.com/photos/7654131/pexels-photo-7654131.jpeg'
};

const topics = {
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

// Helper function to dynamically generate a YouTube search playlist embed
// This ensures every single module has a highly relevant, unique educational video without hardcoded links
const getVideoUrl = (courseName, moduleName) => {
  const searchQuery = encodeURIComponent(`${courseName} ${moduleName} curso tutorial en español`);
  return `https://www.youtube.com/embed?listType=search&list=${searchQuery}`;
};

let quizzesData = {};
try {
  if (fs.existsSync('quizzes.json')) {
    quizzesData = JSON.parse(fs.readFileSync('quizzes.json', 'utf8'));
    // If it's an empty object, ignore it
    if (Object.keys(quizzesData).length > 0) {
      console.log('Using AI-generated quizzes from quizzes.json');
    } else {
      quizzesData = null;
    }
  }
} catch (e) {
  console.warn('Error reading quizzes.json, using defaults.');
}

function generateQuestions(topicName, moduleNum, courseId, moduleId) {
  const key = `${courseId.toUpperCase()}${moduleId.toUpperCase()}`;
  if (quizzesData && quizzesData[key]) {
    return quizzesData[key];
  }

  // Manually build the 10-question structure (6 MC, 2 Cases, 1 Order, 1 Short)
  const q = [];

  // Preguntas 1-6: Selección múltiple clásica
  for (let i = 1; i <= 6; i++) {
    q.push({
      type: 'mc',
      question: `Pregunta Teórica ${i}: ¿Cuál es un concepto clave asociado a ${topicName} (Módulo ${moduleNum})?`,
      options: ['La técnica correcta y la precisión', 'Opción incorrecta A', 'Opción incorrecta B', 'Opción incorrecta C'],
      correctAnswerIndex: 0
    });
  }

  // Preguntas 7-8: Casos prácticos
  for (let i = 7; i <= 8; i++) {
    q.push({
      type: 'mc',
      question: `Caso Práctico ${i-6}: Un cliente solicita un servicio avanzado de ${topicName}. ¿Qué haces primero?`,
      options: ['Realizar un diagnóstico profesional', 'Empezar a trabajar inmediatamente', 'No hacer preguntas', 'Cobrar extra'],
      correctAnswerIndex: 0
    });
  }

  // Pregunta 9: Ordenar pasos
  q.push({
    type: 'order',
    question: `Ordena los pasos lógicos del procedimiento estándar en este módulo:`,
    options: ['Diagnóstico', 'Preparación', 'Ejecución', 'Evaluación final'],
    correctOrder: ['Diagnóstico', 'Preparación', 'Ejecución', 'Evaluación final']
  });

  // Pregunta 10: Explicación corta
  q.push({
    type: 'short',
    question: `Explica en máximo 50 palabras por qué es vital mantener la bioseguridad y ética profesional en ${topicName}.`,
    explanation: 'Debe mencionar la protección del cliente, el profesionalismo y la confianza generada.'
  });

  return q;
}

function generateModules(topicId, topicName) {
  const modules = [];
  const moduleNames = [
    'Fundamentos y Conceptos Básicos',
    'Herramientas y Preparación',
    'Técnicas Esenciales',
    'Casos Prácticos y Especialización',
    'Proyecto Final y Certificación'
  ];

  for (let i = 0; i < 5; i++) {
    const videoUrl = getVideoUrl(topicName, moduleNames[i]);

    modules.push({
      id: topicId + '-m' + (i+1),
      title: moduleNames[i],
      lessons: [
        {
          id: topicId + '-l' + (i*3 + 1),
          title: 'Video Tutorial: ' + moduleNames[i],
          type: 'video',
          duration: '45 min',
          url: videoUrl
        },
        {
          id: topicId + '-l' + (i*3 + 2),
          title: 'Lectura Profunda y Análisis',
          type: 'reading',
          duration: '60 min',
          content: '<h1>Análisis Detallado: ' + moduleNames[i] + '</h1><p>Bienvenido a esta lección teórica del curso de <strong>' + topicName + '</strong>. En esta etapa abordaremos a profundidad los aspectos clave que diferencian a un aficionado de un verdadero profesional.</p><h2>La Importancia del Método</h2><p>La consistencia es el pilar del éxito. Un profesional no depende de la inspiración momentánea, sino de sistemas probados. Esto significa establecer rutinas de diagnóstico, preparación del área de trabajo y protocolos de seguridad.</p><h2>Contexto Técnico</h2><p>La base científica e histórica de nuestras herramientas nos permite innovar. Si entiendes por qué un material reacciona de cierta manera, podrás prever problemas y resolverlos antes de que ocurran.</p><ul><li><strong>Planificación:</strong> Reducción de errores mediante previsión.</li><li><strong>Ejecución:</strong> Precisión obtenida a través de la memoria muscular y el estudio.</li><li><strong>Evaluación:</strong> Capacidad de autocrítica constructiva.</li></ul><p><em>Nota: Recuerde repasar esta teoría antes del examen de certificación de este módulo. La práctica sin teoría es ciega.</em></p>'
        },
        {
          id: topicId + '-l' + (i*3 + 3),
          title: 'Examen del Módulo ' + (i+1),
          type: 'quiz',
          duration: '20 min',
          isAssessment: true,
          questions: generateQuestions(topicName, i+1, topicId, 'M' + (i+1))
        }
      ]
    });
  }

  // 6to Módulo: Examen Final
  const m6VideoUrl = getVideoUrl(topicName, 'Examen Final y Certificación');

  modules.push({
    id: topicId + '-m6',
    title: 'Examen Final',
    lessons: [
      {
        id: topicId + '-l16',
        title: 'Video de Repaso Final',
        type: 'video',
        duration: '15 min',
        url: m6VideoUrl
      },
      {
        id: topicId + '-l17',
        title: 'Examen Final de Certificación',
        type: 'quiz',
        duration: '60 min',
        isAssessment: true,
        questions: generateQuestions(topicName, 6, topicId, 'M6')
      }
    ]
  });

  return modules;
}

const mockCourses = [];
for (const [id, name] of Object.entries(topics)) {
  mockCourses.push({
    id: id,
    title: name,
    shortDescription: 'Formación profesional e integral en ' + name + ' con 5 módulos prácticos.',
    fullDescription: 'Este programa hiper-detallado te preparará para destacar en el ámbito profesional de ' + name + '. Abarca 5 módulos extensos, desde los conceptos iniciales hasta las técnicas maestras. Incluye evaluación mediante quizzes interactivos y simuladores reales.',
    imageUrl: covers[id],
    duration: '6 meses',
    level: 'Básico a Avanzado',
    learningObjectives: [
      'Dominar los fundamentos teóricos esenciales de ' + name,
      'Aplicar técnicas prácticas de nivel profesional',
      'Desarrollar una ética laboral intachable',
      'Aprobar los 5 niveles de certificación'
    ],
    modules: generateModules(id, name)
  });
}

const fileContent = "import { Injectable, signal } from '@angular/core';\n" +
"import { Course } from '../models/types';\n\n" +
"@Injectable({\n" +
"  providedIn: 'root'\n" +
"})\n" +
"export class CourseService {\n" +
"  private readonly mockCourses: Course[] = " + JSON.stringify(mockCourses, null, 2) + ";\n\n" +
"  courses = signal<Course[]>(this.mockCourses);\n\n" +
"  getCourseById(id: string): Course | undefined {\n" +
"    return this.courses().find(c => c.id === id);\n" +
"  }\n\n" +
"  addCourse(course: Course) {\n" +
"    const updated = [...this.courses(), course];\n" +
"    this.courses.set(updated);\n" +
"  }\n" +
"}\n";

fs.writeFileSync('src/app/services/course.service.ts', fileContent);
console.log('course.service.ts fully regenerated!');
