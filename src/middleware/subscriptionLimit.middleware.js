const UserSubscription = require('../models/UserSubscription');
const Worker = require('../models/Worker');

exports.checkWorkerLimit = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userSub = await UserSubscription.findOne({ user: userId, status: 'active' }).populate('plan');
    if (!userSub) {
      return res.status(403).json({ message: 'No active subscription. Please select a plan.' });
    }
    const plan = userSub.plan;
    const count = await Worker.countDocuments({ user: userId });
    if (req.method === 'POST') {
      if (count >= plan.maxWorkers) {
        return res.status(403).json({ message: `Worker limit reached for plan ${plan.name}` });
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};
