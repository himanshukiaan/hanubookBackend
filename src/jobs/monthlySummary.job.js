const cron = require('node-cron');
const User = require('../models/User');
const Worker = require('../models/Worker');
const reportCtrl = require('../controllers/report.controller');

const scheduleJob = () => {
  cron.schedule('30 0 1 * *', async () => {
    console.log('Running monthly summary job...');
    const date = new Date();
    date.setDate(0);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const users = await User.find({});
    for (const u of users) {
      try {
        const workers = await Worker.find({ user: u._id }).select('_id');
        for (const w of workers) {
          await reportCtrl.generateMonthlySummaryForWorker(u._id, w._id, month, year);
        }
      } catch (err) {
        console.error('Error generating for user', u._id, err.message);
      }
    }
    console.log('Monthly summary job finished');
  });
};

module.exports = scheduleJob;
