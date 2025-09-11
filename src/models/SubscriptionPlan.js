const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  maxWorkers: { type: Number, default: 1 },
  features: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
