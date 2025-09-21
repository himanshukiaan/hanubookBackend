// const Attendance = require('../models/Attendance');
// const Worker = require('../models/Worker');
// const SalaryType = require('../models/SalaryType');


// exports.getAllAttendance = async (req, res, next) => {
//   try {
//     const data = await Attendance.find({ user: req.user._id })
//       .populate('worker')
//       .populate('salaryType')
//       .sort({ date: -1 }); // latest first
//     res.json(data);
//   } catch (err) {
//     next(err);
//   }
// };


// exports.createAttendance = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const { workerId, date, salaryTypeId, remarks } = req.body;

//     const worker = await Worker.findOne({ _id: workerId, user: userId });
//     if (!worker) return res.status(404).json({ message: 'Worker not found' });

//     const salaryType = await SalaryType.findById(salaryTypeId);
//     if (!salaryType) return res.status(404).json({ message: 'Salary type not found' });

//     const attDate = new Date(date);
//     attDate.setHours(0, 0, 0, 0);

//     const calculatedSalary = Number((worker.dailySalary * salaryType.multiplier).toFixed(2));

//     const attendance = await Attendance.create({
//       user: userId,
//       worker: worker._id,
//       date: attDate,
//       salaryType: salaryType._id,
//       dailySalary: worker.dailySalary,
//       multiplier: salaryType.multiplier,
//       calculatedSalary,
//       remarks
//     });

//     const populated = await attendance.populate('salaryType');
//     res.json(populated);
//   } catch (err) {
//     if (err.code === 11000) {
//       return res.status(400).json({ message: 'Attendance for this worker & date already exists' });
//     }
//     next(err);
//   }
// };

// exports.bulkCreate = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const { entries } = req.body;
//     if (!Array.isArray(entries)) return res.status(400).json({ message: 'Entries array expected' });

//     const results = [];
//     for (const e of entries) {
//       const worker = await Worker.findOne({ _id: e.workerId, user: userId });
//       const salaryType = await SalaryType.findById(e.salaryTypeId);
//       if (!worker || !salaryType) {
//         results.push({ entry: e, error: 'missing worker or salaryType' });
//         continue;
//       }
//       const attDate = new Date(e.date);
//       attDate.setHours(0, 0, 0, 0);
//       const calculatedSalary = Number((worker.dailySalary * salaryType.multiplier).toFixed(2));
//       try {
//         const created = await Attendance.create({
//           user: userId,
//           worker: worker._id,
//           date: attDate,
//           salaryType: salaryType._id,
//           dailySalary: worker.dailySalary,
//           multiplier: salaryType.multiplier,
//           calculatedSalary,
//           remarks: e.remarks
//         });
//         const populated = await created.populate('salaryType');
//         results.push({ entry: e, created: populated });
//       } catch (err) {
//         results.push({ entry: e, error: err.message });
//       }
//     }

//     res.json(results);
//   } catch (err) { next(err); }
// };

// exports.getByWorkerAndMonth = async (req, res, next) => {
//   try {
//     const { workerId } = req.params;
//     const { month, year } = req.query;
//     const start = new Date(year, month - 1, 1);
//     const end = new Date(year, month, 1);

//     const data = await Attendance.find({
//       user: req.user._id,
//       worker: workerId,
//       date: { $gte: start, $lt: end }
//     }).populate('salaryType');

//     res.json(data);
//   } catch (err) { next(err); }
// };

const Attendance = require('../models/Attendance');
const Worker = require('../models/Worker');
const SalaryType = require('../models/SalaryType');

// ✅ Get All Attendance (only active workers included)
exports.getAllAttendance = async (req, res, next) => {
  try {
    const data = await Attendance.find({ user: req.user._id })
      .populate({
        path: 'worker',
        match: { status: "active" } // 👈 sirf active workers
      })
      .populate('salaryType')
      .sort({ date: -1 });

    // inactive worker ke attendance filter karne ke liye
    const filtered = data.filter(d => d.worker !== null);

    res.json(filtered);
  } catch (err) {
    next(err);
  }
};

// ✅ Create Attendance (worker must be active)
exports.createAttendance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { workerId, date, salaryTypeId, remarks } = req.body;

    const worker = await Worker.findOne({ _id: workerId, user: userId, status: "active" });
    if (!worker) return res.status(404).json({ message: 'Worker not found or inactive' });

    const salaryType = await SalaryType.findById(salaryTypeId);
    if (!salaryType) return res.status(404).json({ message: 'Salary type not found' });

    const attDate = new Date(date);
    attDate.setHours(0, 0, 0, 0);

    const calculatedSalary = Number((worker.dailySalary * salaryType.multiplier).toFixed(2));

    const attendance = await Attendance.create({
      user: userId,
      worker: worker._id,
      date: attDate,
      salaryType: salaryType._id,
      dailySalary: worker.dailySalary,
      multiplier: salaryType.multiplier,
      calculatedSalary,
      remarks
    });

    const populated = await attendance.populate('salaryType');
    res.json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Attendance for this worker & date already exists' });
    }
    next(err);
  }
};

// ✅ Bulk Create Attendance (workers must be active)
exports.bulkCreate = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { entries } = req.body;
    if (!Array.isArray(entries)) return res.status(400).json({ message: 'Entries array expected' });

    const results = [];
    for (const e of entries) {
      const worker = await Worker.findOne({ _id: e.workerId, user: userId, status: "active" });
      const salaryType = await SalaryType.findById(e.salaryTypeId);
      if (!worker || !salaryType) {
        results.push({ entry: e, error: 'missing worker, inactive worker, or salaryType' });
        continue;
      }

      const attDate = new Date(e.date);
      attDate.setHours(0, 0, 0, 0);
      const calculatedSalary = Number((worker.dailySalary * salaryType.multiplier).toFixed(2));

      try {
        const created = await Attendance.create({
          user: userId,
          worker: worker._id,
          date: attDate,
          salaryType: salaryType._id,
          dailySalary: worker.dailySalary,
          multiplier: salaryType.multiplier,
          calculatedSalary,
          remarks: e.remarks
        });
        const populated = await created.populate('salaryType');
        results.push({ entry: e, created: populated });
      } catch (err) {
        results.push({ entry: e, error: err.message });
      }
    }

    res.json(results);
  } catch (err) { next(err); }
};

// ✅ Get Attendance by Worker & Month (worker must be active)
exports.getByWorkerAndMonth = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const { month, year } = req.query;

    // check worker status first
    const worker = await Worker.findOne({ _id: workerId, user: req.user._id, status: "active" });
    if (!worker) return res.status(404).json({ message: "Worker not found or inactive" });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const data = await Attendance.find({
      user: req.user._id,
      worker: workerId,
      date: { $gte: start, $lt: end }
    }).populate('salaryType');

    res.json(data);
  } catch (err) { next(err); }
};
