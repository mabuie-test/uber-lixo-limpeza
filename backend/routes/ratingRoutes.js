// topo de routes/ratingRoutes.js
const path = require('path');
let authModule;
try {
  // resolve relativo ao próprio ficheiro routes
  authModule = require(path.join(__dirname, '..', 'middleware', 'auth'));
} catch (err1) {
  try {
    // tentar alternativa um nível acima (caso a estrutura difira)
    authModule = require(path.join(__dirname, '..', '..', 'middleware', 'auth'));
  } catch (err2) {
    console.error('Auth middleware not found. Errors:', err1.message, err2.message);
    // fallback TEMPORÁRIO para permitir o server correr (apenas para testes)
    authModule = {
      ensureAuth: (req, res, next) => { req.user = { id: 'TEST', role: 'admin' }; next(); },
      ensureAdmin: (req, res, next) => { req.user = { id: 'TEST', role: 'admin' }; next(); },
      optionalAuth: (req, res, next) => { next(); }
    };
  }
}
const { ensureAuth, ensureAdmin, optionalAuth } = authModule;
