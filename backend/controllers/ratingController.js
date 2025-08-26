// backend/controllers/ratingController.js
const Rating = require('../models/Rating'); // cria o model abaixo se não existir

// Criar avaliação
exports.createRating = async (req, res) => {
  try {
    const { subjectId, subjectType, score, comment } = req.body;
    const rater = req.user?.id || req.body.rater; // assume que ensureAuth populou req.user
    const rating = new Rating({
      rater,
      subjectId,
      subjectType,
      score,
      comment
    });
    await rating.save();
    return res.status(201).json({ success: true, data: rating });
  } catch (err) {
    console.error('createRating error', err);
    return res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

// Listar avaliações (por subject)
exports.getRatingsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const ratings = await Rating.find({ subjectId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: ratings });
  } catch (err) {
    console.error('getRatingsBySubject error', err);
    return res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

// Remover ou editar avaliação (simples)
exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    await Rating.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Avaliação removida' });
  } catch (err) {
    console.error('deleteRating error', err);
    return res.status(500).json({ success: false, message: 'Erro interno' });
  }
};

// Atualizar avaliação (parcial)
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const rating = await Rating.findByIdAndUpdate(id, updates, { new: true });
    return res.json({ success: true, data: rating });
  } catch (err) {
    console.error('updateRating error', err);
    return res.status(500).json({ success: false, message: 'Erro interno' });
  }
};