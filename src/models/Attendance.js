// const mongoose = require('mongoose');

// const AttendanceSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
//   date: { type: Date, required: true },
//   salaryType: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryType', required: true },
//   dailySalary: { type: Number, required: true },
//   multiplier: { type: Number, required: true },
//   calculatedSalary: { type: Number, required: true },
//   remarks: { type: String },
//   createdAt: { type: Date, default: Date.now }
// });

// AttendanceSchema.index({ user:1, worker:1, date:1 }, { unique: true });

// module.exports = mongoose.model('Attendance', AttendanceSchema);

const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  date: { type: Date, required: true },
  salaryType: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryType', required: true },
  dailySalary: { type: Number, required: true },
  multiplier: { type: Number, required: true },
  calculatedSalary: { type: Number, required: true },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

AttendanceSchema.index({ user: 1, worker: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
