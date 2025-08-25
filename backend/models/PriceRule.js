const mongoose = require("mongoose");
const priceRuleSchema = new mongoose.Schema({
  serviceType: { type: String, enum: ["waste","cleaning","garden"], required: true },
  parameters: [{ name: String, value: String, price: Number }],
  distancePricePerKm: { type: Number, default: 0 },
  urgencyMultiplier: { type: Number, default: 1.0 }
});
module.exports = mongoose.model("PriceRule", priceRuleSchema);

