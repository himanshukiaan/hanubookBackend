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
        fullDays: { $sum: { $cond: [{ $eq: ['$multiplier', 1] }, 1, 0] } },
        halfDays: { $sum: { $cond: [{ $eq: ['$multiplier', 0.5] }, 1, 0] } },
        absents: { $sum: { $cond: [{ $eq: ['$multiplier', 0] }, 1, 0] } }
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
    if (!month || !year) return res.status(400).json({ message: 'month and year required' });
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

// exports.thekedarReport = async (req, res, next) => {
//   try {
//     const { month, year } = req.query;
//     const userId = req.user._id;
//     const summaries = await MonthlySummary.find({ user: userId, month: Number(month), year: Number(year) }).populate('worker');
//     const totals = summaries.reduce((acc, s) => {
//       acc.totalSalary += s.totalSalary;
//       acc.totalPayoutDays = (acc.totalPayoutDays || 0) + s.totalDays;
//       return acc;
//     }, { totalSalary: 0, totalPayoutDays: 0 });
//     res.json({ summaries, totals });
//   } catch (err) { next(err); }
// };


// controllers/report.controller.js


// exports.thekedarDayReport = async (req, res, next) => {
//   try {
//     const { date } = req.query; // "YYYY-MM-DD"
//     if (!date) return res.status(400).json({ message: 'Date is required' });

//     const userId = req.user._id;
//     const reportDate = new Date(date);
//     reportDate.setHours(0, 0, 0, 0);

//     const workers = await Worker.find({ user: userId });

//     const summaries = await Promise.all(workers.map(async (worker) => {
//       // Check attendance for the day
//       const att = await Attendance.findOne({
//         worker: worker._id,
//         date: reportDate
//       });

//       let status = 'Absent';
//       let salary = 0;

//       if (att) {
//         salary = att.calculatedSalary;
//         status = att.calculatedSalary === worker.dailySalary ? 'Full' :
//           att.calculatedSalary === worker.dailySalary / 2 ? 'Half' : 'Absent';
//       }

//       return {
//         worker,
//         date: reportDate,
//         status,
//         salary
//       };
//     }));

//     const totals = summaries.reduce((acc, s) => {
//       acc.totalSalary += s.salary;
//       acc.fullDays += s.status === 'Full' ? 1 : 0;
//       acc.halfDays += s.status === 'Half' ? 1 : 0;
//       acc.absents += s.status === 'Absent' ? 1 : 0;
//       acc.totalDays++;
//       return acc;
//     }, { totalSalary: 0, fullDays: 0, halfDays: 0, absents: 0, totalDays: 0 });

//     res.json({ summaries, totals });

//   } catch (err) { next(err); }
// };

// exports.thekedarMonthReport = async (req, res, next) => {
//   try {
//     const { month, year } = req.query;
//     if (!month || !year) return res.status(400).json({ message: 'Month and year required' });

//     const userId = req.user._id;
//     const startOfMonth = new Date(year, month - 1, 1);
//     const endOfMonth = new Date(year, month, 0); // last date of month
//     const today = new Date();

//     const workers = await Worker.find({ user: userId });

//     const summaries = await Promise.all(workers.map(async (worker) => {
//       const workerJoin = worker.joiningDate || worker.createdAt;
//       const workerInactive = worker.inactiveDate || today;

//       const fromDate = workerJoin > startOfMonth ? workerJoin : startOfMonth;
//       const toDate = workerInactive < endOfMonth ? workerInactive : endOfMonth;

//       let fullDays = 0, halfDays = 0, absents = 0, totalSalary = 0;

//       for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
//         const att = await Attendance.findOne({ worker: worker._id, date: new Date(d) });
//         if (att) {
//           if (att.calculatedSalary === worker.dailySalary) { fullDays++; totalSalary += att.calculatedSalary; }
//           else if (att.calculatedSalary === worker.dailySalary / 2) { halfDays++; totalSalary += att.calculatedSalary; }
//         } else absents++;
//       }

//       return { worker, fullDays, halfDays, absents, totalDays: fullDays + halfDays + absents, totalSalary };
//     }));

//     const totals = summaries.reduce((acc, s) => {
//       acc.totalSalary += s.totalSalary;
//       acc.fullDays += s.fullDays;
//       acc.halfDays += s.halfDays;
//       acc.absents += s.absents;
//       acc.totalDays += s.totalDays;
//       return acc;
//     }, { totalSalary: 0, fullDays: 0, halfDays: 0, absents: 0, totalDays: 0 });

//     res.json({ summaries, totals });

//   } catch (err) { next(err); }
// };

// exports.thekedarYearReport = async (req, res, next) => {
//   try {
//     const { year } = req.query;
//     if (!year) return res.status(400).json({ message: 'Year required' });

//     const userId = req.user._id;
//     const workers = await Worker.find({ user: userId });

//     const summaries = await Promise.all(workers.map(async (worker) => {
//       const months = [];
//       for (let m = 0; m < 12; m++) {
//         const start = new Date(year, m, 1);
//         const end = new Date(year, m + 1, 0);
//         const today = new Date();
//         const fromDate = worker.joiningDate > start ? worker.joiningDate : start;
//         const toDate = worker.inactiveDate && worker.inactiveDate < end ? worker.inactiveDate : (end > today ? today : end);

//         let fullDays = 0, halfDays = 0, absents = 0, totalSalary = 0;

//         for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
//           const att = await Attendance.findOne({ worker: worker._id, date: new Date(d) });
//           if (att) {
//             if (att.calculatedSalary === worker.dailySalary) { fullDays++; totalSalary += att.calculatedSalary; }
//             else if (att.calculatedSalary === worker.dailySalary / 2) { halfDays++; totalSalary += att.calculatedSalary; }
//           } else absents++;
//         }

//         months.push({ month: m + 1, fullDays, halfDays, absents, totalDays: fullDays + halfDays + absents, totalSalary });
//       }

//       return { worker, months };
//     }));

//     res.json({ summaries });

//   } catch (err) { next(err); }
// };

// // dashboardController.js
// exports.getDashboard = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth();

//     const workers = await Worker.find({ user: userId });

//     // 1. Calculate top stats
//     let totalEmployees = workers.length;
//     let totalSalaryToday = 0;
//     let totalSalaryThisMonth = 0;
//     let totalSalaryThisYear = 0;

//     // 2. Monthly trends (for current year)
//     const monthlyTrends = Array.from({ length: 12 }, (_, i) => ({
//       month: i + 1,
//       salary: 0,
//     }));

//     // 3. Yearly trends (last 5 years)
//     const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
//     const yearlyTrends = years.map(y => ({
//       year: y,
//       totalSalary: 0,
//       averageSalary: 0,
//     }));

//     for (const worker of workers) {
//       const workerJoin = worker.joiningDate || worker.createdAt;
//       const workerInactive = worker.inactiveDate || today;

//       // Calculate salaries
//       for (let y = currentYear - 4; y <= currentYear; y++) {
//         for (let m = 0; m < 12; m++) {
//           const start = new Date(y, m, 1);
//           const end = new Date(y, m + 1, 0);
//           const fromDate = workerJoin > start ? workerJoin : start;
//           const toDate = workerInactive < end ? workerInactive : end;

//           let monthSalary = 0;
//           let daysCount = 0;

//           for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
//             const att = await Attendance.findOne({
//               worker: worker._id,
//               date: new Date(d),
//             });
//             if (att) monthSalary += att.calculatedSalary;
//             daysCount++;
//           }

//           // Add to monthly trends if current year
//           if (y === currentYear) monthlyTrends[m].salary += monthSalary;

//           // Add to yearly trends
//           const yearIndex = years.indexOf(y);
//           yearlyTrends[yearIndex].totalSalary += monthSalary;
//           yearlyTrends[yearIndex].averageSalary += monthSalary / daysCount || 0;

//           // Add to top stats
//           if (y === currentYear && m === currentMonth) totalSalaryThisMonth += monthSalary;
//           if (y === currentYear && m === currentMonth && today.getDate() <= new Date(toDate).getDate()) {
//             // calculate today's salary
//             const attToday = await Attendance.findOne({
//               worker: worker._id,
//               date: new Date(today.setHours(0, 0, 0, 0)),
//             });
//             totalSalaryToday += attToday ? attToday.calculatedSalary : 0;
//           }
//         }
//       }

//       // Yearly total
//       for (let d = new Date(workerJoin); d <= today; d.setDate(d.getDate() + 1)) {
//         const att = await Attendance.findOne({ worker: worker._id, date: new Date(d) });
//         if (att) totalSalaryThisYear += att.calculatedSalary;
//       }
//     }

//     res.json({
//       stats: {
//         totalEmployees,
//         totalSalaryToday,
//         totalSalaryThisMonth,
//         totalSalaryThisYear,
//       },
//       monthlyTrends,
//       yearlyTrends,
//     });

//   } catch (err) {
//     next(err);
//   }
// };


const startOfDay = (date) => new Date(date.setHours(0, 0, 0, 0));
const endOfDay = (date) => new Date(date.setHours(23, 59, 59, 999));

exports.thekedarDayReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const userId = req.user._id;
    const reportDate = startOfDay(new Date(date));

    const workers = await Worker.find({ user: userId });

    const workerIds = workers.map(w => w._id);

    // Fetch all attendance for that date at once
    const attendances = await Attendance.find({
      worker: { $in: workerIds },
      date: reportDate
    }).lean();

    const attendanceMap = {};
    attendances.forEach(a => {
      attendanceMap[a.worker.toString()] = a;
    });

    const summaries = workers.map(worker => {
      const att = attendanceMap[worker._id.toString()];
      let status = 'Absent';
      let salary = 0;

      if (att) {
        salary = att.calculatedSalary;
        status = salary === worker.dailySalary ? 'Full' :
          salary === worker.dailySalary / 2 ? 'Half' : 'Absent';
      }

      return { worker, date: reportDate, status, salary };
    });

    const totals = summaries.reduce((acc, s) => {
      acc.totalSalary += s.salary;
      acc.fullDays += s.status === 'Full' ? 1 : 0;
      acc.halfDays += s.status === 'Half' ? 1 : 0;
      acc.absents += s.status === 'Absent' ? 1 : 0;
      acc.totalDays++;
      return acc;
    }, { totalSalary: 0, fullDays: 0, halfDays: 0, absents: 0, totalDays: 0 });

    res.json({ summaries, totals });

  } catch (err) { next(err); }
};


exports.thekedarMonthReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and year required' });

    const userId = req.user._id;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const workers = await Worker.find({ user: userId });
    const workerIds = workers.map(w => w._id);

    // Fetch all attendances for the month in one query
    const attendances = await Attendance.find({
      worker: { $in: workerIds },
      date: { $gte: startOfDay(start), $lte: endOfDay(end) }
    }).lean();

    // Group attendances by workerId
    const attMap = {};
    attendances.forEach(a => {
      const wId = a.worker.toString();
      if (!attMap[wId]) attMap[wId] = [];
      attMap[wId].push(a);
    });

    const summaries = workers.map(worker => {
      const workerAtt = attMap[worker._id.toString()] || [];
      let fullDays = 0, halfDays = 0, absents = 0, totalSalary = 0;

      // Use a map of dates for attendance
      const attDateMap = {};
      workerAtt.forEach(a => attDateMap[startOfDay(new Date(a.date)).getTime()] = a.calculatedSalary);

      const fromDate = worker.joiningDate && worker.joiningDate > start ? worker.joiningDate : start;
      const toDate = worker.inactiveDate && worker.inactiveDate < end ? worker.inactiveDate : end;

      for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
        const salary = attDateMap[startOfDay(new Date(d)).getTime()] || 0;
        if (salary === worker.dailySalary) fullDays++;
        else if (salary === worker.dailySalary / 2) halfDays++;
        else absents++;
        totalSalary += salary;
      }

      return { worker, fullDays, halfDays, absents, totalDays: fullDays + halfDays + absents, totalSalary };
    });

    const totals = summaries.reduce((acc, s) => {
      acc.totalSalary += s.totalSalary;
      acc.fullDays += s.fullDays;
      acc.halfDays += s.halfDays;
      acc.absents += s.absents;
      acc.totalDays += s.totalDays;
      return acc;
    }, { totalSalary: 0, fullDays: 0, halfDays: 0, absents: 0, totalDays: 0 });

    res.json({ summaries, totals });

  } catch (err) { next(err); }
};


exports.thekedarYearReport = async (req, res, next) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ message: 'Year required' });

    const userId = req.user._id;
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    const workers = await Worker.find({ user: userId });
    const workerIds = workers.map(w => w._id);

    const attendances = await Attendance.find({
      worker: { $in: workerIds },
      date: { $gte: startOfDay(start), $lte: endOfDay(end) }
    }).lean();

    const attMap = {};
    attendances.forEach(a => {
      const wId = a.worker.toString();
      if (!attMap[wId]) attMap[wId] = [];
      attMap[wId].push(a);
    });

    const summaries = workers.map(worker => {
      const months = [];
      const workerAtt = attMap[worker._id.toString()] || [];

      const attDateMap = {};
      workerAtt.forEach(a => attDateMap[startOfDay(new Date(a.date)).getTime()] = a.calculatedSalary);

      for (let m = 0; m < 12; m++) {
        const monthStart = new Date(year, m, 1);
        const monthEnd = new Date(year, m + 1, 0);

        const fromDate = worker.joiningDate && worker.joiningDate > monthStart ? worker.joiningDate : monthStart;
        const toDate = worker.inactiveDate && worker.inactiveDate < monthEnd ? worker.inactiveDate : monthEnd;

        let fullDays = 0, halfDays = 0, absents = 0, totalSalary = 0;

        for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
          const salary = attDateMap[startOfDay(new Date(d)).getTime()] || 0;
          if (salary === worker.dailySalary) fullDays++;
          else if (salary === worker.dailySalary / 2) halfDays++;
          else absents++;
          totalSalary += salary;
        }

        months.push({ month: m + 1, fullDays, halfDays, absents, totalDays: fullDays + halfDays + absents, totalSalary });
      }

      return { worker, months };
    });

    res.json({ summaries });

  } catch (err) { next(err); }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const startToday = startOfDay(today);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    // Get all active workers
    const workers = await Worker.find({ user: userId, status: 'active' });
    const workerIds = workers.map(w => w._id);

    // Get all attendances from last 5 years (optional: optimize by currentYear)
    const attendances = await Attendance.find({
      worker: { $in: workerIds },
      date: { $gte: new Date(currentYear - 4, 0, 1), $lte: endOfDay(today) }
    }).lean();

    // Map attendances: workerId -> timestamp -> salary
    const attMap = {};
    attendances.forEach(a => {
      const wId = a.worker.toString();
      if (!attMap[wId]) attMap[wId] = {};
      attMap[wId][startOfDay(new Date(a.date)).getTime()] = a.calculatedSalary;
    });

    // Initialize stats
    let totalSalaryToday = 0;
    let totalSalaryThisMonth = 0;
    let totalSalaryThisYear = 0;
    const monthlyTrends = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, salary: 0 }));
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
    const yearlyTrends = years.map(y => ({ year: y, totalSalary: 0, averageSalary: 0, daysCount: 0 }));

    // Process salaries
    workers.forEach(worker => {
      const workerAtt = attMap[worker._id.toString()] || {};

      Object.keys(workerAtt).forEach(ts => {
        const date = new Date(parseInt(ts));
        const salary = workerAtt[ts];

        const y = date.getFullYear();
        const m = date.getMonth();

        // Today
        if (startOfDay(date).getTime() === startToday.getTime()) totalSalaryToday += salary;

        // This month
        if (y === currentYear && m === currentMonth) totalSalaryThisMonth += salary;

        // This year
        if (y === currentYear) totalSalaryThisYear += salary;

        // Monthly trends
        if (y === currentYear) monthlyTrends[m].salary += salary;

        // Yearly trends
        const yearIndex = years.indexOf(y);
        if (yearIndex !== -1) {
          yearlyTrends[yearIndex].totalSalary += salary;
          yearlyTrends[yearIndex].daysCount += 1;
        }
      });
    });

    // Calculate yearly average salary
    yearlyTrends.forEach(y => {
      y.averageSalary = y.daysCount ? y.totalSalary / y.daysCount : 0;
      delete y.daysCount;
    });

    res.json({
      stats: {
        totalEmployees: workers.length,
        totalSalaryToday,
        totalSalaryThisMonth,
        totalSalaryThisYear,
      },
      monthlyTrends,
      yearlyTrends
    });

  } catch (err) {
    next(err);
  }
};
