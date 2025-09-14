const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');

const generateToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

/**
 * @desc Register user
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ⚠️ Don’t hash here, pre('save') already does it
    const user = await User.create({
      name,
      email,
      phone,
      password
    });

    // Optional: assign free plan to first user
    // const userCount = await User.countDocuments();
    // let freePlan = await SubscriptionPlan.findOne({ price: 0 });
    // if (!freePlan && userCount === 0) {
    //   freePlan = await SubscriptionPlan.create({
    //     name: 'Free',
    //     price: 0,
    //     maxWorkers: 1
    //   });
    // }
    // if (userCount === 0 && freePlan) {
    //   await UserSubscription.create({
    //     user: user._id,
    //     plan: freePlan._id,
    //     status: 'active'
    //   });
    // }

    const token = generateToken(user);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Login user
 */
exports.login = async (req, res, next) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: 'Login and password are required' });
    }

    // Detect login type (email or phone)
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);

    let user;
    if (isEmail) {
      user = await User.findOne({ email: login }).select('+password');
    } else {
      user = await User.findOne({ phone: login }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Logout user
 */
exports.logout = async (req, res, next) => {
  try {
    res.json({
      message: 'Logged out successfully. Please remove the token from client storage.'
    });
  } catch (err) {
    next(err);
  }
};
