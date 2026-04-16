// src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

// ── Public (any logged-in user can read) ─────────────────────────────────────
router.get('/', courseController.listarCursos);
router.get('/:id', courseController.obtenerCursoPorId);

// ── Admin only (must be authenticated AND have rol=admin) ─────────────────────
router.post('/',        verificarToken, soloAdmin, courseController.crearCurso);
router.put('/:id',     verificarToken, soloAdmin, courseController.actualizarCurso);
router.delete('/:id',  verificarToken, soloAdmin, courseController.eliminarCurso);

module.exports = router;