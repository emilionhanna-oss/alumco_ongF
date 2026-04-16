// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'dev_insecure_change_me';

/**
 * Verifica que el request tenga un JWT válido en el header Authorization.
 * Usa: Authorization: Bearer <token>
 */
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado: token no proporcionado' });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.usuario = payload; // { id, rol }
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
};

/**
 * Verifica que el usuario autenticado tenga rol 'admin'.
 * Siempre debe usarse DESPUÉS de verificarToken.
 */
const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol administrador' });
  }
  next();
};

module.exports = { verificarToken, soloAdmin };