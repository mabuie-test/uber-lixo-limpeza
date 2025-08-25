const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
  amount: Number,
  client_number: String,
  agent_id: String,
  transaction_reference: String,
  third_party_reference: String,
  mpesa_transaction_id: String,
  status: { type: String, enum: ["pending","paid","failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});
module.exports = mongoose.model("Payment", paymentSchema);

