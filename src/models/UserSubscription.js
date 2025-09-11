const mongoose = require('mongoose');

const UserSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  status: { type: String, enum: ['active','expired','pending'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  meta: { type: Object }
});

module.exports = mongoose.model('UserSubscription', UserSubscriptionSchema);
