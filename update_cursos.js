const fs = require('fs');

const courses = [
  {
    id: 'C1',
    name: 'Belleza y Cosmetología Profesional',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=D-V-9xN7bdU', theme: 'Clase cosmetología primer año, Estudio/Adriana López - Limpieza facial básica, tipos piel.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=yqxLu1Q8Dbk', theme: 'Básicos cabina cosmetológica, Dra. Marisa Mebra - Equipo, desinfección.' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=TEBhaQ-7D1E', theme: 'Limpieza facial profunda, EDUEM - Exfoliación, masaje.' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=lVZiQjWFDQA', theme: 'Aparatología estética facial, EDES - Acné, manchas.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=EdDF1Her7Lk', theme: 'Clase Cosmetología Md1, Educativo 2023 - Diagnóstico piel.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=g-egicz2wa4', theme: 'Examen cosmetología 2025, ExamPrepEspañol - Repaso higiene.' }
    ]
  },
  {
    id: 'C2',
    name: 'Máster Uñas Acrílicas y Nail Art',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=bLl0YPUA49w', theme: 'Anatomía uña natural, La Chama Nails - Enfermedades, bioseguridad.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=psINlu4c3M', theme: 'Brocas manicura express, Nails by Becerra - Drill, preparación.' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=s1AjFQ7ef6k', theme: 'Manejo perlas acrílico, Uñas RM By Liz - Consistencia, limado.' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=6WLt-ZGdOqQ', theme: 'Uñas baby boomer, Xnails - Encapsulado, 3D.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=NCrEQK8TD0', theme: 'Control aplicación acrílico, Online Sessions - Set escultural.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=WmA8RzUSxPg', theme: 'Perla perfecta acrílico, Nail art 2020 - Errores, química.' }
    ]
  },
  {
    id: 'C3',
    name: 'Auxiliar de Farmacia Especializado',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=Dr206HvVuo', theme: 'Intro farmacología, Conocimiento Bárbaro - Formas farmacéuticas.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=IZV0fzxa8YQ', theme: 'Organización farmacia, Educativo 2022 - Lectura recetas.' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=cQpsJ-IU75Y', theme: 'Control infecciones cadena frío, Farmacéutico - Dispensación.' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=6dVbXmaREgw', theme: 'Clase 6 Auxiliar Farmacia, ITEC123 - Casos mostrador, dosis.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=9nkQVie1llE', theme: 'Rol Auxiliar Farmacia, Educativo - Ética, legal.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=TnYwHlePmdg', theme: 'Conceptos farmacología, Universitario 2021 - Grupos terapéuticos.' }
    ]
  },
  {
    id: 'C4',
    name: 'Informática Básica',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=dyud7aCLUcs', theme: 'Curso computación cero, Educativo - Hardware/software.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=MrdDCOW25Us', theme: 'Windows 11 básico, Educativo 2022 - Escritorio, carpetas.' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=sjj54sdHJpQ', theme: 'Internet navegadores, 2025 - Correo, búsquedas.' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=lJ0oRGIkKQs', theme: 'Word Excel básico, Windows 10 2017 - Fórmulas.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=sAz3Azecuc', theme: 'Búsqueda documentos correos, Educativo - Práctica.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=Z6GGAQOMX8c', theme: 'Conceptos clave computación, 2025 - Seguridad, atajos.' }
    ]
  },
  {
    id: 'C5',
    name: 'Inglés Básico',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=dFJvNYdKGrA', theme: 'Inglés principiantes esencial, Inglés español 2024 - Alfabeto, saludos.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=PeXZktbTgLo', theme: 'Lección 1 To Be, A1 español 2017 - Oraciones básicas.' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=PeXZktbTgLo', theme: 'Presente simple verbos, Educativo 2024 - Preguntas.' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=Z6GGAQOMX8c', theme: 'Conversación básica, 2024 - Compras, restaurantes.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=dFJvNYdKGrA', theme: 'Presentación rutinas, 2024 - Hobbies.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=X9QmL013bVc', theme: 'Repaso gramática A1, A1 - Examen nivel.' }
    ]
  },
  {
    id: 'C6',
    name: 'Masaje Profesional',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=X9QmL013bVc', theme: 'Anatomía piel músculos, Educativo 2020 - Contraindicaciones.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=msWGJLbfg9A', theme: 'Protocolo hidratación aceites, Silvana Rister 2020 - Ergonomía.' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=K0TnfIwSf1o', theme: 'Effleurage masaje sueco, Luis Roldán 2012 - Maniobras básicas.' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=TEBhaQ-7D1E', theme: 'Masaje descontracturante, EDES 2023 - Puntos gatillo (adaptado).' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=cWRIeRgHQrY', theme: 'Sesión tratamiento corporal, EDUEM 2023 - Protocolo cabina.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=OXkjScVSSeY', theme: 'Repaso anatomía ética, Universidad 2024.' }
    ]
  },
  {
    id: 'C7',
    name: 'Corte y Peinado',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=OXkjScVSSeY', theme: 'Estructura cabello visagismo, Academiestetic 2020.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=SNRKjI5R3cM', theme: 'Herramientas corte tijeras peines, Barbería 2021 - Preparación.' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=MAeA-94nZhE', theme: 'Degradado mid fade, Barbería 2021.' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=OXFt07LkCOU', theme: 'Tutorial mid fade brushing, Peluquería 2022.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=J5-U5fpPjKk', theme: 'Mid fade perfecto diagnóstico, 2020.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=OXkjScVSSeY', theme: 'Máquina sobre peine ángulos, Barbería 2021.' }
    ]
  },
  {
    id: 'C8',
    name: 'Maquillaje Profesional',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=OXkjScVSSeY', theme: 'Colorimetría maquillaje, Academiestetic.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=yqxLu1Q8Dbk', theme: 'Brochas esponjas higiene, Cabina (adaptado).' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=TEBhaQ-7D1E', theme: 'Base contorno ojos, EDUEM 2023 (adaptado).' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=tR2Iv0oDgUI', theme: 'Maquillaje noche ahumado, Top Doctors 2023.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=msWGJLbfg9A', theme: 'Maquillaje novias duradero, Silvana Rister.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=g-egicz2wa4', theme: 'Repaso colorimetría, ExamPrepEspañol.' }
    ]
  },
  {
    id: 'C9',
    name: 'Barbería Profesional',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=J5-U5fpPjKk', theme: 'Intro barbería craneal, Barbería 2021.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=MAeA-94nZhE', theme: 'Clippers trimmers higiene, Barbería 2022.' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=OXFt07LkCOU', theme: 'Tutorial mid fade, Barbería 2022.' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=SNRKjI5R3cM', theme: 'Arreglo barba navaja, 2020.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=PYHyc7uRr8', theme: 'Skin fade perfilado, 2021.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=EdDF1Her7Lk', theme: 'Low fade enfermedades piel, 2023.' }
    ]
  },
  {
    id: 'C10',
    name: 'Repostería Profesional',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=n3ulLuQwsYc', theme: 'Masterclass ingredientes repostería, Cook Storming - Harina, huevos, química.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=pX9rq7cAXR0', theme: 'Utensilios básicos repostería, La Cocina Inma López - Horno, mise en place.' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=By_A05FN0z4', theme: 'Curso repostería masas bizcocho, Claudio Us - Crema pastelera.' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=7cQ0ULyPjAg', theme: 'Curso repostería merengues ganache, Vero Sweet Hobby - Rellenos pasteles.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=sGczsnxuUVg', theme: 'Tarta 3 pisos armado decoración, Tundes Cakes - Pastel dos pisos.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=49lXDFkgQlE', theme: 'Higiene conservación repostería, Luddys - Temperaturas horneado.' }
    ]
  },
  {
    id: 'C11',
    name: 'Decoración de Eventos',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=BvQhSe8e5cI', theme: 'Curso repostería intro diseño (adaptado eventos), Edutin Academy - Moodboards color.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=lVZiQjWFDQA', theme: 'Materiales globos eventos (adaptado).' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=6WLt-ZGdOqQ', theme: 'Arte globos guirnaldas, Xnails adaptado.' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=mVNdS2Elrk', theme: 'Decoración telas florales, RSS Estética 2015.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=tDndiFm1Oe8', theme: 'Montaje evento temático (adaptado).' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=EdDF1Her7Lk', theme: 'Presupuestos planificaciones, 2023.' }
    ]
  },
  {
    id: 'C12',
    name: 'Contabilidad Básica',
    modules: [
      { id: 'M1', url: 'https://www.youtube.com/watch?v=UvwPBJYEqs', theme: 'Contabilidad básica partida doble, 2011.' },
      { id: 'M2', url: 'https://www.youtube.com/watch?v=UvwPBJYEqs', theme: 'Catálogo cuentas (usa M1).' },
      { id: 'M3', url: 'https://www.youtube.com/watch?v=X9QmL013bVc', theme: 'Libro diario mayor (adaptado balanza).' },
      { id: 'M4', url: 'https://www.youtube.com/watch?v=UvwPBJYEqs', theme: 'Estados financieros, Caso práctico.' },
      { id: 'M5', url: 'https://www.youtube.com/watch?v=cWRIeRgHQrY', theme: 'Ciclo contable Excel, Terórica.' },
      { id: 'M6', url: 'https://www.youtube.com/watch?v=OXkjScVSSeY', theme: 'Clasificación cuentas ecuación, Repaso.' }
    ]
  }
];

let output = '';
courses.forEach(c => {
  c.modules.forEach(m => {
    output += `${m.url} - ${c.id}${m.id}\r\n`;
    output += `**Tema:** ${m.theme}\r\n\r\n`;
  });
});

fs.writeFileSync('cursos.txt', output);
console.log('cursos.txt actualizado con éxito.');
