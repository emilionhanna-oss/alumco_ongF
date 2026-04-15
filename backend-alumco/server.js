const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importamos la ruta de autenticación
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : true;

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Archivos estáticos (imágenes de cursos, etc.)
app.use('/static', express.static(path.join(__dirname, 'public')));

// Fallback explícito para imágenes de cursos (evita edge-cases del static middleware)
app.get('/static/course-images/:name', (req, res) => {
  const { name } = req.params;
  return res.sendFile(path.join(__dirname, 'public', 'course-images', name));
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor de Alumco funcionando correctamente!');
});

// Conectamos la ruta de auth
app.use('/api/auth', authRoutes);

// Conectamos rutas de cursos (fuente de verdad: data/db.json)
app.use('/api/cursos', courseRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});