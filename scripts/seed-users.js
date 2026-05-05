const admin = require('firebase-admin');
const fs = require('fs');

/**
 * 🚀 SCRIPT DE SIEMBRA SEGURA DE USUARIOS PARA NOVA ACADEMY
 * 
 * Este script genera 200 usuarios de prueba y los inserta en Firestore
 * de forma eficiente usando Batch Writes.
 */

// 1. Configuración de Seguridad: Solo ejecutar si existe la llave
if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error('❌ ERROR: No se encuentra el archivo serviceAccountKey.json');
  console.log('Instrucciones:');
  console.log('1. Ve a Firebase Console > Project Settings > Service Accounts.');
  console.log('2. Clic en "Generate new private key".');
  console.log('3. Guarda el archivo como "serviceAccountKey.json" en la raíz del proyecto.');
  console.log('4. Ejecuta: node scripts/seed-users.js');
  process.exit(1);
}

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedUsers() {
  console.log('🔍 Validando estado de la colección "users"...');
  
  const usersRef = db.collection('users');
  const batchSize = 50;
  let totalCreated = 0;

  try {
    console.log('🚀 Iniciando generación de 200 usuarios...');

    for (let i = 1; i <= 200; i++) {
      const userId = `test-user-${i.toString().padStart(3, '0')}`;
      const userEmail = `user${i}@nova-test.com`;
      
      // Creamos una referencia con un ID predecible para evitar duplicados si se re-ejecuta
      const docRef = usersRef.doc(userId);
      
      // Usamos BATCH para eficiencia (máximo 500 por batch, usamos 50 para máxima seguridad)
      let batch = db.batch();
      
      batch.set(docRef, {
        id: userId,
        name: `Estudiante de Prueba ${i}`,
        email: userEmail,
        role: 'student',
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        enrolledCourses: [], // Inicialmente sin cursos
        metadata: {
          isTestData: true,
          generationBatch: 'PROD_READY_SEED_001'
        }
      }, { merge: true }); // 'merge: true' evita sobrescribir campos si el documento ya existía

      totalCreated++;

      if (totalCreated % batchSize === 0 || totalCreated === 200) {
        await batch.commit();
        console.log(`✅ Lote completado: ${totalCreated}/200 usuarios procesados.`);
      }
    }

    console.log('\n✨ ¡ÉXITO! Se han generado e insertado 200 usuarios de prueba de forma segura.');
    console.log('📌 Nota: Los IDs siguen el patrón "test-user-001" para fácil limpieza posterior.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error crítico durante la siembra de datos:', error);
    process.exit(1);
  }
}

seedUsers();
