const mongoose = require('mongoose');

const SalaryTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  multiplier: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SalaryType', SalaryTypeSchema);
