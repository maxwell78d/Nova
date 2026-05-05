const admin = require('firebase-admin');
const fs = require('fs');

// 1. DESCARGA TU LLAVE:
// Ve a Firebase Console > Project Settings > Service Accounts
// Haz clic en "Generate new private key" y guárdala como 'serviceAccountKey.json' en este directorio.

if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error('❌ ERROR: No se encuentra el archivo serviceAccountKey.json');
  console.log('Por favor, descárgalo desde la consola de Firebase y ponlo en esta carpeta.');
  process.exit(1);
}

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadData() {
  try {
    const coursesData = JSON.parse(fs.readFileSync('./courses.json', 'utf8'));
    console.log(`🚀 Iniciando subida de ${coursesData.length} cursos...`);

    const batch = db.batch();

    coursesData.forEach((course) => {
      const courseRef = db.collection('courses').doc(course.id);
      batch.set(courseRef, course);
    });

    await batch.commit();
    console.log('✅ ¡TODOS LOS CURSOS SUBIDOS CON ÉXITO A FIRESTORE!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error subiendo datos:', error);
    process.exit(1);
  }
}

uploadData();
