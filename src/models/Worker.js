// const mongoose = require('mongoose');

// const WorkerSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   name: { type: String, required: true },
//   phone: { type: String },
//   age: { type: Number }, // 👈 Added
//   designation: { type: String }, // 👈 Added
//   dailySalary: { type: Number, required: true },
//   joiningDate: { type: Date },
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Worker', WorkerSchema);

const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String },
  age: { type: Number },
  designation: { type: String },
  dailySalary: { type: Number, required: true },
  joiningDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  inactiveDate: { type: Date }, // 👈 Added to track when worker became inactive
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Worker', WorkerSchema);
