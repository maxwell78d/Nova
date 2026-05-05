const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Target the specific JSON file found in the root
const serviceAccountPath = path.join(__dirname, '..', 'nova-8f666-firebase-adminsdk-fbsvc-0c7ab654b4.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: No se encontró el archivo de credenciales JSON.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const users = [
  {
    uid: 'student_001',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    role: 'student',
    courses: ['c1', 'c5'],
    progress: { 'c1': 45, 'c5': 10 },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    uid: 'student_002',
    name: 'María García',
    email: 'maria.garcia@example.com',
    role: 'student',
    courses: ['c2', 'c6'],
    progress: { 'c2': 100, 'c6': 25 },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    uid: 'student_003',
    name: 'Carlos Rodríguez',
    email: 'carlos.rod@example.com',
    role: 'student',
    courses: ['c3'],
    progress: { 'c3': 0 },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    uid: 'admin_nova',
    name: 'Admin Nova',
    email: 'admin@nova-academy.com',
    role: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seed() {
  console.log('🚀 Iniciando inserción masiva de usuarios...');
  
  for (const user of users) {
    try {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`✅ Usuario creado: ${user.name} (${user.uid})`);
    } catch (e) {
      console.error(`❌ Error con ${user.uid}:`, e.message);
    }
  }
  
  console.log('✨ Proceso completado con éxito.');
  process.exit(0);
}

seed();
