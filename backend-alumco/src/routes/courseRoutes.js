const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { requireAuth, requireAdmin, requireProfesor } = require('../middlewares/authMiddleware');
const certificateController = require('../controllers/certificateController');

router.get('/', requireAuth, courseController.listarCursos);
router.get('/:id', requireAuth, courseController.obtenerCursoPorId);

// Certificados
router.get('/verificar-certificado/:hash', certificateController.verificarCertificado);
router.get('/:id/certificado', requireAuth, certificateController.descargarCertificado);

// Progreso Manual
router.post('/:cursoId/modulos/:moduloId/completar', requireAuth, courseController.completarModuloManual);

// Admin/Profesor: crear curso
router.post('/', requireAuth, requireProfesor, courseController.crearCurso);

// Admin/Profesor: editar curso (título, descripción, imagen, módulos)
router.put('/:id', requireAuth, requireProfesor, courseController.actualizarCurso);

// Admin: eliminar curso
router.delete('/:id', requireAuth, requireAdmin, courseController.eliminarCurso);

// Admin: asignar alumnos a un curso
router.put('/:id/alumnos', requireAuth, requireAdmin, courseController.asignarAlumnos);

module.exports = router;
