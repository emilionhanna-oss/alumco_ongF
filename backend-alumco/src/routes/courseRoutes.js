const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.listarCursos);
router.get('/:id', courseController.obtenerCursoPorId);

module.exports = router;
