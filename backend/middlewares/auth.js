// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware simples de autenticação JWT.
 * - Usa process.env.JWT_SECRET (obrigatório em produção).
 * - Se o token for válido, popula req.user = { id, role, ...payload }.
 * - Se inválido ou ausente, responde 401 (apenas para ensureAuth).
 *
 * Também exporta ensureAdmin (verifica role === 'admin') e optionalAuth.
 */

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Verifica token e popula req.user
function verifyTokenFromHeader(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme)) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // normalize payload: try common fields
    const id = payload.id || payload.userId || payload.sub || null;
    const role = payload.role || payload.roles || payload.userRole || 'user';
    return { ...payload, id, role };
  } catch (err) {
    return null;
  }
}

function ensureAuth(req, res, next) {
  const user = verifyTokenFromHeader(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  req.user = user;
  next();
}

function ensureAdmin(req, res, next) {
  const user = verifyTokenFromHeader(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!user.role || (typeof user.role === 'string' && user.role.toLowerCase() !== 'admin')) {
    return res.status(403).json({ message: 'Forbidden - admin only' });
  }
  req.user = user;
  next();
}

// Permite mas não exige autenticação (se token presente popula req.user)
function optionalAuth(req, res, next) {
  const user = verifyTokenFromHeader(req);
  if (user) req.user = user;
  next();
}

module.exports = {
  ensureAuth,
  ensureAdmin,
  optionalAuth,
};
