const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');

const generateToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });

    const userCount = await User.countDocuments();
    const user = await User.create({ name, email, phone, password });

    let freePlan = await SubscriptionPlan.findOne({ price: 0 });
    if (!freePlan && userCount === 0) {
      freePlan = await SubscriptionPlan.create({ name: 'Free', price: 0, maxWorkers: 1 });
    }

    if (userCount === 0 && freePlan) {
      await UserSubscription.create({ user: user._id, plan: freePlan._id, status: 'active' });
    }

    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) { next(err); }
};

// controllers/auth.controller.js
exports.logout = async (req, res, next) => {
  try {
    // Since JWT is stateless, logout just means the client deletes the token.
    // You can still instruct the client to remove the token from storage.
    res.json({ message: 'Logged out successfully. Please remove the token from client storage.' });
  } catch (err) {
    next(err);
  }
};
