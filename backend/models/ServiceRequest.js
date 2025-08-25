const mongoose = require("mongoose");
const serviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
  type: { type: String, enum: ["waste","cleaning","garden"], required: true },
  details: { type: Object },
  location: { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], required: true } }, // [lng, lat]
  status: { type: String, enum: ["requested","assigned","in_route","in_progress","completed","cancelled"], default: "requested" },
  price: Number,
  requestedAt: { type: Date, default: Date.now },
  scheduledAt: Date,
  assignedAt: Date,
  startedAt: Date,
  completedAt: Date
});
serviceSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("ServiceRequest", serviceSchema);

