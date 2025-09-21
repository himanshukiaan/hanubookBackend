const mongoose = require('mongoose');

const MonthlySummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalDays: { type: Number, default: 0 },
  fullDays: { type: Number, default: 0 },
  halfDays: { type: Number, default: 0 },
  absents: { type: Number, default: 0 },
  totalSalary: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

MonthlySummarySchema.index({ user: 1, worker: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlySummary', MonthlySummarySchema);
