# Guía: Conectar L Academy a MySQL Workbench

Angular es un framework de frontend (se ejecuta en el navegador del usuario). Por razones de seguridad, **nunca debe conectarse directamente a una base de datos MySQL**. Las credenciales quedarían expuestas en el navegador.

Para conectar este proyecto a tu base de datos en MySQL Workbench, necesitas crear un **Backend (API REST)**.

Aquí te explico paso a paso cómo hacerlo:

## 1. Crea tu base de datos en MySQL Workbench

Abre MySQL Workbench y ejecuta este script para crear las tablas básicas:

```sql
CREATE DATABASE lacademy_db;
USE lacademy_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student'
);

CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    shortDescription TEXT,
    fullDescription TEXT,
    imageUrl VARCHAR(255),
    duration VARCHAR(50),
    level VARCHAR(50)
);

CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    course_id VARCHAR(50),
    progress INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

## 2. Crea un Backend con Node.js y Express

Fuera de la carpeta de Angular, crea una nueva carpeta para tu backend (ej. `lacademy-backend`) y ejecuta:

```bash
npm init -y
npm install express mysql2 cors
```

Crea un archivo llamado `server.js` con el siguiente código:

```javascript
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite que Angular se conecte
app.use(express.json()); // Permite recibir JSON

// Configura la conexión a tu MySQL Workbench
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Tu usuario de MySQL
  password: 'tu_contraseña', // Tu contraseña de MySQL
  database: 'lacademy_db'
});

db.connect(err => {
  if (err) console.error('Error conectando a MySQL:', err);
  else console.log('Conectado a MySQL Workbench');
});

// --- RUTAS DE LA API ---

// Obtener todos los cursos
app.get('/api/courses', (req, res) => {
  db.query('SELECT * FROM courses', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Login de usuario
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor Backend corriendo en el puerto 3000');
});
```

Ejecuta el servidor con: `node server.js`

## 3. Conectar Angular al Backend

En tu proyecto de Angular, debes hacer 2 cosas:

1. Proveer `HttpClient` en `src/app/app.config.ts`:
   ```typescript
   import { provideHttpClient } from '@angular/common/http';
   
   export const appConfig: ApplicationConfig = {
     providers: [
       provideRouter(routes),
       provideHttpClient() // <-- Agrega esto
     ]
   };
   ```

2. Usar `HttpClient` en los servicios (`course.service.ts` y `auth.service.ts`). Revisa los comentarios que dejé al final de esos archivos en el código fuente para ver el ejemplo exacto de cómo reemplazar los datos de prueba (Mock) por llamadas a tu nueva API.
