const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const { ensureAdmin } = require('../middleware/auth'); // implementa/usa o teu ensureAdmin

// Aprovar
router.patch('/approve/:workerId', ensureAdmin, async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    worker.documentsStatus = 'approved';
    worker.approved = true;
    worker.verificationNotes = req.body.notes || '';
    await worker.save();

    req.app.get('io')?.emit('worker_documents_verified', { workerId, status: 'approved' });

    return res.json({ message: 'Aprovado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

// Rejeitar
router.patch('/reject/:workerId', ensureAdmin, async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    worker.documentsStatus = 'rejected';
    worker.approved = false;
    worker.verificationNotes = req.body.notes || '';
    await worker.save();

    req.app.get('io')?.emit('worker_documents_verified', { workerId, status: 'rejected', notes: worker.verificationNotes });

    return res.json({ message: 'Rejeitado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

module.exports = router;