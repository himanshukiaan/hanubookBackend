const Attendance = require('../models/Attendance');
const MonthlySummary = require('../models/MonthlySummary');
const Worker = require('../models/Worker');

exports.generateMonthlySummaryForWorker = async (userId, workerId, month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const aggr = await Attendance.aggregate([
    { $match: { user: userId, worker: workerId, date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        totalSalary: { $sum: '$calculatedSalary' },
        fullDays: { $sum: { $cond: [ { $eq: ['$multiplier', 1] }, 1, 0 ] } },
        halfDays: { $sum: { $cond: [ { $eq: ['$multiplier', 0.5] }, 1, 0 ] } },
        absents: { $sum: { $cond: [ { $eq: ['$multiplier', 0] }, 1, 0 ] } }
      }
    }
  ]);

  const summary = aggr[0] || { totalDays: 0, totalSalary: 0, fullDays: 0, halfDays: 0, absents: 0 };

  const result = await MonthlySummary.findOneAndUpdate(
    { user: userId, worker: workerId, month, year },
    {
      $set: {
        totalDays: summary.totalDays,
        totalSalary: summary.totalSalary,
        fullDays: summary.fullDays,
        halfDays: summary.halfDays,
        absents: summary.absents
      }
    },
    { upsert: true, new: true }
  );

  return result;
};

exports.generateMonthlySummary = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ message: 'month and year required' });
    const userId = req.user._id;
    const workers = await Worker.find({ user: userId }).select('_id');
    const results = [];
    for (const w of workers) {
      const r = await exports.generateMonthlySummaryForWorker(userId, w._id, month, year);
      results.push(r);
    }
    res.json(results);
  } catch (err) { next(err); }
};

exports.workerReport = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'month and year required' } );
    const userId = req.user._id;

    const attendance = await Attendance.find({
      user: userId,
      worker: workerId,
      date: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) }
    }).populate('salaryType');

    const summary = await MonthlySummary.findOne({ user: userId, worker: workerId, month, year });

    res.json({ attendance, summary });
  } catch (err) { next(err); }
};

exports.thekedarReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;
    const summaries = await MonthlySummary.find({ user: userId, month: Number(month), year: Number(year) }).populate('worker');
    const totals = summaries.reduce((acc, s) => {
      acc.totalSalary += s.totalSalary;
      acc.totalPayoutDays = (acc.totalPayoutDays || 0) + s.totalDays;
      return acc;
    }, { totalSalary: 0, totalPayoutDays: 0 });
    res.json({ summaries, totals });
  } catch (err) { next(err); }
};
