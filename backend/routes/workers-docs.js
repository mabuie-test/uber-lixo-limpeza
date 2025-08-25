const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp');
const Worker = require('../models/Worker');
const { ensureAuth } = require('../middleware/auth'); // adapta ao teu middleware auth

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.id; // assume ensureAuth preenche req.user
    const dir = path.join(__dirname, '..', 'uploads', 'workers', String(userId));
    mkdirp.sync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const prefix = file.fieldname === 'bi' ? 'bi' : 'nuit';
    cb(null, `${prefix}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6 MB
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png/.test(file.mimetype);
    cb(ok ? null : new Error('Apenas imagens JPG/PNG são permitidas'), ok);
  }
});

// POST /api/workers/submit-documents-multipart
router.post('/submit-documents-multipart', ensureAuth, upload.fields([{ name: 'bi', maxCount: 1 }, { name: 'nuit', maxCount: 1 }]), async (req, res) => {
  try {
    const userId = req.user.id;
    const worker = await Worker.findOne({ userId });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    const biFile = req.files['bi']?.[0];
    const nuitFile = req.files['nuit']?.[0];
    if (!biFile || !nuitFile) return res.status(400).json({ message: 'BI e NUIT obrigatórios' });

    // store public-accessible paths (serve '/uploads' static)
    worker.biUrl = `/uploads/workers/${userId}/${path.basename(biFile.path)}`;
    worker.nuitUrl = `/uploads/workers/${userId}/${path.basename(nuitFile.path)}`;
    worker.documentsSubmittedAt = new Date();
    worker.documentsStatus = 'submitted';
    await worker.save();

    // emit socket event for admins/dashboard
    const io = req.app.get('io');
    if (io) io.emit('worker_documents_submitted', { workerId: worker._id.toString(), userId });

    return res.json({ message: 'Uploaded', biUrl: worker.biUrl, nuitUrl: worker.nuitUrl });
  } catch (err) {
    console.error('submit-docs error', err);
    return res.status(500).json({ message: 'Erro interno' });
  }
});

module.exports = router;