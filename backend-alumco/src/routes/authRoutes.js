// Archivo: src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para procesar el login
router.post('/login', authController.iniciarSesion);

module.exports = router;