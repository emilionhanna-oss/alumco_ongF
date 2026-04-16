const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, requireAdmin, usersController.listarUsuarios);

module.exports = router;
