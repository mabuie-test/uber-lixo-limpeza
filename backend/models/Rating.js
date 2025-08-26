// backend/models/Rating.js
const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  subjectId: { type: String, required: true },
  subjectType: { type: String, default: 'worker' },
  score: { type: Number, required: true, min: 0, max: 5 },
  comment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Rating', RatingSchema);
