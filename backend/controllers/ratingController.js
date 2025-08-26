// backend/controllers/ratingController.js
const Rating = require('../models/Rating'); // se não existir, cria (veja abaixo)

// Criar avaliação
async function createRating(req, res) {
  try {
    const { subjectId, subjectType, score, comment } = req.body;
    const rater = req.user?.id || req.body.rater || null;
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
}

// Listar avaliações por subject
async function getRatingsBySubject(req, res) {
  try {
    const { subjectId } = req.params;
    if (!subjectId) return res.status(400).json({ success: false, message: 'subjectId obrigatório' });
    const ratings = await Rating.find({ subjectId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: ratings });
  } catch (err) {
    console.error('getRatingsBySubject error', err);
    return res.status(500).json({ success: false, message: 'Erro interno' });
  }
}

// Apagar avaliação
async function deleteRating(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id obrigatório' });
    await Rating.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Avaliação removida' });
  } catch (err) {
    console.error('deleteRating error', err);
    return res.status(500).json({ success: false, message: 'Erro interno' });
  }
}

// Atualizar avaliação
async function updateRating(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id obrigatório' });
    const updates = req.body;
    const rating = await Rating.findByIdAndUpdate(id, updates, { new: true });
    return res.json({ success: true, data: rating });
  } catch (err) {
    console.error('updateRating error', err);
    return res.status(500).json({ success: false, message: 'Erro interno' });
  }
}

module.exports = {
  createRating,
  getRatingsBySubject,
  deleteRating,
  updateRating
};
