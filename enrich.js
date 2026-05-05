const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/services/course.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

function generateModules(topic) {
  return [
    {
      id: topic.id + '-m1',
      title: 'Fundamentos y Conceptos Básicos',
      lessons: [
        {
          id: topic.id + '-l1',
          title: 'Introducción a ' + topic.name,
          type: 'video',
          duration: '35 min',
          url: 'https://www.youtube.com/watch?v=J---aiyznGQ'
        },
        {
          id: topic.id + '-l2',
          title: 'Teoría Fundamental',
          type: 'reading',
          duration: '45 min',
          content: '<h1>Fundamentos de ' + topic.name + '</h1><p>Bienvenido al primer módulo. Aquí sentaremos las bases necesarias para que domines esta disciplina a nivel profesional.</p><h2>1. Historia y Evolución</h2><p>Conocer el origen nos ayuda a entender las prácticas actuales.</p><h2>2. Herramientas del Oficio</h2><ul><li><strong>Herramienta Principal:</strong> Elemento clave.</li><li><strong>Equipo de Seguridad:</strong> Fundamental para prevenir accidentes.</li></ul>'
        },
        {
          id: topic.id + '-l3',
          title: 'Quiz: Conceptos Clave',
          type: 'quiz',
          duration: '15 min',
          isAssessment: true
        }
      ]
    },
    {
      id: topic.id + '-m2',
      title: 'Técnicas Intermedias y Práctica',
      lessons: [
        {
          id: topic.id + '-l4',
          title: 'Metodología Paso a Paso',
          type: 'video',
          duration: '50 min',
          url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
        },
        {
          id: topic.id + '-l5',
          title: 'Casos Prácticos y Resolución',
          type: 'reading',
          duration: '60 min',
          content: '<h1>Aplicación Práctica</h1><p>En esta lección analizaremos situaciones reales y cómo aplicar nuestros conocimientos.</p><h2>Estudio de Caso 1</h2><ol><li>Diagnosticar la situación con calma.</li><li>Seleccionar el procedimiento adecuado.</li><li>Ejecutar con precisión.</li></ol><img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop" alt="Práctica profesional" />'
        },
        {
          id: topic.id + '-l6',
          title: 'Evaluación Práctica',
          type: 'quiz',
          duration: '25 min',
          isAssessment: true
        }
      ]
    },
    {
      id: topic.id + '-m3',
      title: 'Nivel Avanzado y Especialización',
      lessons: [
        {
          id: topic.id + '-l7',
          title: 'Técnicas Maestras',
          type: 'video',
          duration: '40 min',
          url: 'https://www.youtube.com/watch?v=9bZkp7q19f0'
        },
        {
          id: topic.id + '-l8',
          title: 'Examen Final de Certificación',
          type: 'quiz',
          duration: '60 min',
          isAssessment: true
        }
      ]
    }
  ];
}

const topicsMap = {
  'c4': 'Informática Básica',
  'c5': 'Inglés Básico',
  'c6': 'Masaje Profesional',
  'c7': 'Corte y Peinado',
  'c8': 'Maquillaje Profesional',
  'c9': 'Barbería',
  'c12': 'Contabilidad Básica'
};

let newAdditionalCourses = '';
const keys = Object.keys(topicsMap);
for (let i = 0; i < keys.length; i++) {
  const id = keys[i];
  const name = topicsMap[id];
  
  const courseObj = {
      id: id,
      title: name,
      shortDescription: 'Formación profesional e integral en ' + name + ' con módulos prácticos y teóricos.',
      fullDescription: 'Este programa avanzado te preparará para destacar en el ámbito profesional de ' + name + '. Abarca desde los conceptos iniciales hasta las técnicas más especializadas. Incluye video, lecturas profundas y evaluaciones.',
      imageUrl: 'https://picsum.photos/seed/' + id + '/600/400',
      duration: '4 meses',
      level: 'Básico a Avanzado',
      learningObjectives: [
        'Dominar los fundamentos teóricos esenciales.',
        'Aplicar técnicas prácticas de nivel profesional.',
        'Resolver problemas comunes de manera eficiente.',
        'Obtener las habilidades necesarias para la certificación.'
      ],
      modules: generateModules({ id, name })
  };
    
  newAdditionalCourses += JSON.stringify(courseObj, null, 6);
  if (i < keys.length - 1) newAdditionalCourses += ',\n';
}

const c4Match = "id: 'c4',";
const c4Match2 = '"id": "c4"';
let c4Index = content.indexOf(c4Match);
if (c4Index === -1) c4Index = content.indexOf(c4Match2);
if (c4Index === -1) {
  // Let's just find the start of c4 in the raw text
  c4Index = content.indexOf("'c4'");
}

if (c4Index !== -1) {
  const startC4Obj = content.lastIndexOf('{', c4Index);
  
  const signalMatch = content.indexOf('  courses = signal');
  const endMockArray = content.lastIndexOf('];', signalMatch);
  
  const beforeC4 = content.substring(0, startC4Obj);
  const afterMock = content.substring(endMockArray);
  
  const finalContent = beforeC4 + newAdditionalCourses + '\n  ' + afterMock;
  fs.writeFileSync(filePath, finalContent);
  console.log('Courses successfully enriched!');
} else {
  console.log('Could not find c4');
}
