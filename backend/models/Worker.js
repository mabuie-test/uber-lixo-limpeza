const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  serviceTypes: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  biUrl: { type: String },      // URL/caminho para BI
  nuitUrl: { type: String },    // URL/caminho para NUIT
  documentsSubmittedAt: { type: Date },
  documentsStatus: { type: String, enum: ['none','submitted','under_review','approved','rejected'], default: 'none' },
  verificationNotes: { type: String },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

WorkerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Worker', WorkerSchema);