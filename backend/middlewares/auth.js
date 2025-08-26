// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
function verifyTokenFromHeader(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  if (!/^Bearer$/i.test(parts[0])) return null;
  try { const payload = jwt.verify(parts[1], JWT_SECRET); return { ...payload, id: payload.id || payload.userId || payload.sub, role: payload.role || 'user' }; }
  catch (err) { return null; }
}
function ensureAuth(req, res, next) {
  const user = verifyTokenFromHeader(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  req.user = user; next();
}
function ensureAdmin(req, res, next) {
  const user = verifyTokenFromHeader(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!user.role || (typeof user.role === 'string' && user.role.toLowerCase() !== 'admin')) return res.status(403).json({ message: 'Forbidden' });
  req.user = user; next();
}
function optionalAuth(req, res, next) {
  const user = verifyTokenFromHeader(req);
  if (user) req.user = user; next();
}
module.exports = { ensureAuth, ensureAdmin, optionalAuth };
