// backend/routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { ensureAuth, ensureAdmin } = require('../middleware/auth'); // adapta ao teu middleware

// Criar avaliação (usuário autenticado)
router.post('/', ensureAuth, ratingController.createRating);

// Listar avaliações por subjectId
router.get('/subject/:subjectId', ratingController.getRatingsBySubject);

// Atualizar (apenas rater ou admin) - aqui simplificamos: require auth
router.patch('/:id', ensureAuth, ratingController.updateRating);

// Remover (apenas admin ou autor) - simplificado
router.delete('/:id', ensureAuth, ratingController.deleteRating);

module.exports = router;
