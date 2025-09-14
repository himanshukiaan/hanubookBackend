const Worker = require('../models/Worker');

exports.createWorker = async (req, res, next) => {
  try {
    const { name, phone, age, designation, dailySalary, joiningDate } = req.body;
    const worker = await Worker.create({
      user: req.user._id,
      name,
      phone,
      age,           // 👈 Added
      designation,   // 👈 Added
      dailySalary,
      joiningDate
    });
    res.json(worker);
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const workers = await Worker.find({ user: req.user._id });
    res.json(workers);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ _id: req.params.id, user: req.user._id });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updates = req.body;
    const worker = await Worker.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, { new: true });
    res.json(worker);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Worker.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) { next(err); }
};
