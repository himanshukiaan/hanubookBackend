// const Worker = require('../models/Worker');

// // ✅ Worker Create (default active)
// exports.createWorker = async (req, res, next) => {
//   try {
//     const { name, phone, age, designation, dailySalary, joiningDate } = req.body;
//     const worker = await Worker.create({
//       user: req.user._id,
//       name,
//       phone,
//       age,
//       designation,
//       dailySalary,
//       joiningDate,
//       status: "active" // 👈 default active
//     });
//     res.json(worker);
//   } catch (err) {
//     next(err);
//   }
// };

// // ✅ Get all ACTIVE workers
// exports.getAll = async (req, res, next) => {
//   try {
//     const workers = await Worker.find({ user: req.user._id, status: "active" });
//     res.json(workers);
//   } catch (err) {
//     next(err);
//   }
// };

// // ✅ Get worker by ID (must be active)
// exports.getById = async (req, res, next) => {
//   try {
//     const worker = await Worker.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//       status: "active"
//     });

//     if (!worker) return res.status(404).json({ message: 'Worker not found or inactive' });
//     res.json(worker);
//   } catch (err) {
//     next(err);
//   }
// };

// // ✅ Update only ACTIVE worker
// exports.update = async (req, res, next) => {
//   try {
//     const updates = req.body;
//     const worker = await Worker.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id, status: "active" },
//       updates,
//       { new: true }
//     );

//     if (!worker) return res.status(404).json({ message: "Worker not found or inactive" });
//     res.json(worker);
//   } catch (err) {
//     next(err);
//   }
// };

// // ✅ Mark worker as inactive (instead of delete)
// exports.inactivate = async (req, res, next) => {
//   try {
//     const worker = await Worker.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id, status: "active" },
//       { status: "inactive" },
//       { new: true }
//     );

//     if (!worker) {
//       return res.status(404).json({ message: "Worker not found or already inactive" });
//     }

//     res.json({ success: true, worker });
//   } catch (err) {
//     next(err);
//   }
// };


// exports.remove = async (req, res, next) => {
//   try {
//     await Worker.deleteOne({ _id: req.params.id, user: req.user._id });
//     res.json({ success: true });
//   } catch (err) { next(err); }
// };


const Worker = require('../models/Worker');

// // ✅ Create Worker (default active)
// exports.createWorker = async (req, res, next) => {
//   try {
//     const { name, phone, age, designation, dailySalary, joiningDate } = req.body;
//     const worker = await Worker.create({
//       user: req.user._id,
//       name,
//       phone,
//       age,
//       designation,
//       dailySalary,
//       joiningDate,
//       status: "active"
//     });
//     res.json(worker);
//   } catch (err) { next(err); }
// };

// ✅ Create Worker (default active, auto set joiningDate)
exports.createWorker = async (req, res, next) => {
  try {
    const { name, phone, age, designation, dailySalary } = req.body;

    const worker = await Worker.create({
      user: req.user._id,
      name,
      phone,
      age,
      designation,
      dailySalary,
      joiningDate: new Date(), // ⬅️ auto set to current date
      status: "active"
    });

    res.json(worker);
  } catch (err) {
    next(err);
  }
};


// ✅ Get all ACTIVE workers
exports.getAll = async (req, res, next) => {
  try {
    const workers = await Worker.find({ user: req.user._id, status: "active" });
    res.json(workers);
  } catch (err) { next(err); }
};

// ✅ Get worker by ID (must be active)
exports.getById = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "active"
    });
    if (!worker) return res.status(404).json({ message: 'Worker not found or inactive' });
    res.json(worker);
  } catch (err) { next(err); }
};

// ✅ Update only ACTIVE worker
exports.update = async (req, res, next) => {
  try {
    const updates = req.body;
    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: "active" },
      updates,
      { new: true }
    );
    if (!worker) return res.status(404).json({ message: "Worker not found or inactive" });
    res.json(worker);
  } catch (err) { next(err); }
};

// ✅ Mark worker as inactive
exports.inactivate = async (req, res, next) => {
  try {
    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: "active" },
      { status: "inactive", inactiveDate: new Date() },
      { new: true }
    );
    if (!worker) return res.status(404).json({ message: "Worker not found or already inactive" });
    res.json({ success: true, worker });
  } catch (err) { next(err); }
};

// ✅ Remove worker permanently
exports.remove = async (req, res, next) => {
  try {
    await Worker.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) { next(err); }
};
