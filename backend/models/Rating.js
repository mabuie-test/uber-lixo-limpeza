const mongoose = require("mongoose");
const ratingSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Rating", ratingSchema);

