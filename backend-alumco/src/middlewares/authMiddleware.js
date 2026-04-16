const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'dev_insecure_change_me';

function normalizeRoles(raw) {
  if (Array.isArray(raw)) return raw.map(String);
  if (raw === undefined || raw === null) return [];
  return [String(raw)];
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    req.user = {
      id: decoded?.id !== undefined ? String(decoded.id) : undefined,
      rol: normalizeRoles(decoded?.rol),
    };

    if (!req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    return next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

function requireAdmin(req, res, next) {
  const roles = normalizeRoles(req.user?.rol);
  if (!roles.includes('admin')) {
    return res.status(403).json({ mensaje: 'No autorizado' });
  }
  return next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
