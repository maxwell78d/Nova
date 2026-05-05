const fs = require('fs');
const cs = fs.readFileSync('src/app/services/course.service.ts', 'utf8');
const additionalCourses = `    {
      id: 'c4',
      title: 'Informática Básica',
      shortDescription: 'Aprende a manejar la computadora, ofimática e internet desde cero.',
      fullDescription: 'Curso esencial para dominar Windows, Microsoft Office (Word, Excel, PowerPoint) y navegación segura por internet. Imprescindible para cualquier trabajo hoy en día.',
      imageUrl: 'https://picsum.photos/seed/informatica/600/400',
      duration: '2 meses',
      level: 'Básico',
      learningObjectives: [
        'Manejar el sistema operativo Windows.',
        'Crear documentos en Microsoft Word.',
        'Elaborar hojas de cálculo en Excel.',
        'Navegar por internet de forma segura.'
      ],
      modules: [
        {
          id: 'c4-m1',
          title: 'Sistema Operativo y Ofimática',
          lessons: [
            { id: 'c4-l1', title: 'Introducción a Windows', type: 'video', duration: '30 min', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
            { id: 'c4-l2', title: 'Conceptos básicos de Word', type: 'reading', duration: '20 min', content: '<p>Contenido introductorio.</p>' }
          ]
        }
      ]
    },
    {
      id: 'c5',
      title: 'Inglés Básico',
      shortDescription: 'Inicia tu aprendizaje del idioma inglés con bases sólidas.',
      fullDescription: 'Aprende vocabulario, gramática básica y pronunciación para comunicarte en situaciones cotidianas. El primer paso para ser bilingüe.',
      imageUrl: 'https://picsum.photos/seed/ingles/600/400',
      duration: '4 meses',
      level: 'Básico',
      learningObjectives: [
        'Saludar y presentarse en inglés.',
        'Usar el verbo To Be correctamente.',
        'Adquirir vocabulario cotidiano.',
        'Mantener conversaciones básicas.'
      ],
      modules: [
        {
          id: 'c5-m1',
          title: 'Bases del Idioma',
          lessons: [
            { id: 'c5-l1', title: 'Saludos y presentaciones', type: 'video', duration: '25 min', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
          ]
        }
      ]
    },
    {
      id: 'c6',
      title: 'Masaje Profesional',
      shortDescription: 'Técnicas de masaje relajante, descontracturante y terapéutico.',
      fullDescription: 'Descubre el arte de la masoterapia. Aprenderás anatomía básica y diferentes técnicas de masaje para aliviar el estrés y dolores musculares.',
      imageUrl: 'https://picsum.photos/seed/masaje/600/400',
      duration: '3 meses',
      level: 'Intermedio',
      learningObjectives: [
        'Conocer la anatomía muscular básica.',
        'Aplicar técnicas de masaje relajante.',
        'Realizar masajes descontracturantes.',
        'Mantener la ética profesional.'
      ],
      modules: [
        {
          id: 'c6-m1',
          title: 'Introducción a la Masoterapia',
          lessons: [
            { id: 'c6-l1', title: 'Anatomía y fisiología', type: 'reading', duration: '30 min', content: '<p>Contenido básico</p>' },
            { id: 'c6-l2', title: 'Técnicas básicas', type: 'video', duration: '40 min', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
          ]
        }
      ]
    },
    {
      id: 'c7',
      title: 'Corte y Peinado',
      shortDescription: 'Técnicas modernas de corte de cabello y estilismo.',
      fullDescription: 'Aprende a realizar cortes de cabello para damas, caballeros y niños, así como técnicas de secado, planchado y peinados para eventos.',
      imageUrl: 'https://picsum.photos/seed/corte/600/400',
      duration: '4 meses',
      level: 'Básico a Intermedio',
      learningObjectives: [
        'Aplicar técnicas de visagismo.',
        'Realizar cortes de cabello modernos.',
        'Dominar el secado y planchado.',
        'Crear peinados de gala.'
      ],
      modules: [
        {
          id: 'c7-m1',
          title: 'Fundamentos del Estilismo',
          lessons: [
            { id: 'c7-l1', title: 'Visagismo', type: 'video', duration: '20 min', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' }
          ]
        }
      ]
    },
    {
      id: 'c8',
      title: 'Maquillaje Profesional',
      shortDescription: 'Conviértete en un Make-up Artist profesional.',
      fullDescription: 'Desde maquillaje social hasta técnicas avanzadas para fotografía y eventos. Aprende sobre colorimetría, tipos de piel y contornos.',
      imageUrl: 'https://picsum.photos/seed/maquillaje/600/400',
      duration: '3 meses',
      level: 'Intermedio',
      learningObjectives: [
        'Preparar la piel correctamente.',
        'Aplicar teoría de colorimetría.',
        'Realizar maquillaje social.',
        'Crear looks para novias.'
      ],
      modules: [
        {
          id: 'c8-m1',
          title: 'Bases del Maquillaje',
          lessons: [
            { id: 'c8-l1', title: 'Preparación de la piel', type: 'video', duration: '35 min', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
          ]
        }
      ]
    },
    {
      id: 'c9',
      title: 'Barbería',
      shortDescription: 'El arte del corte masculino y arreglo de barba.',
      fullDescription: 'Domina el uso de la máquina, tijera y navaja. Aprenderás los cortes clásicos y las últimas tendencias en barbería urbana.',
      imageUrl: 'https://picsum.photos/seed/barberia/600/400',
      duration: '3 meses',
      level: 'Básico',
      learningObjectives: [
        'Uso correcto de la máquina y tijeras.',
        'Cortes clásicos masculinos.',
        'Arreglo de barba.',
        'Atención al cliente en barbería.'
      ],
      modules: [
        {
          id: 'c9-m1',
          title: 'Fundamentos de Barbería',
          lessons: [
            { id: 'c9-l1', title: 'Herramientas básicas', type: 'video', duration: '20 min', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' }
          ]
        }
      ]
    },
    {
      id: 'c12',
      title: 'Contabilidad Básica',
      shortDescription: 'Fundamentos contables para negocios y finanzas personales.',
      fullDescription: 'Entiende los principios de la contabilidad, manejo de libros, ingresos, egresos y elaboración de estados financieros básicos.',
      imageUrl: 'https://picsum.photos/seed/contabilidad/600/400',
      duration: '3 meses',
      level: 'Intermedio',
      learningObjectives: [
        'Entender principios de contabilidad.',
        'Manejar libro diario y mayor.',
        'Realizar conciliación bancaria.',
        'Elaborar estados financieros.'
      ],
      modules: [
        {
          id: 'c12-m1',
          title: 'Principios Contables',
          lessons: [
            { id: 'c12-l1', title: 'Introducción a la contabilidad', type: 'video', duration: '35 min', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
          ]
        }
      ]
    }`;

const signalMatch = cs.indexOf('  courses = signal');
const endMockArray = cs.lastIndexOf('];', signalMatch);
if (endMockArray > -1) {
  const beforeEnd = cs.substring(0, endMockArray);
  const afterEnd = cs.substring(endMockArray);
  const newCs = beforeEnd.trim() + ',\n' + additionalCourses + '\n' + afterEnd;
  fs.writeFileSync('src/app/services/course.service.ts', newCs);
  console.log('Agregados cursos del 4 al 12 exitosamente.');
} else {
  console.log('No se encontro courses = signal');
}
