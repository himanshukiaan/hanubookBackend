const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

exports.listPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({});
    res.json(plans);
  } catch (err) { next(err); }
};

// Create a Stripe Checkout Session and create pending subscription record
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe not configured. Set STRIPE_SECRET_KEY in .env' });
    }

    // create a checkout session - NOTE: this is a minimal example.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: { name: plan.name },
          unit_amount: Math.round(plan.price * 100)
        },
        quantity: 1
      }],
      success_url: 'https://your-frontend/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://your-frontend/cancel'
    });

    // create a pending subscription record
    // frontend should confirm payment and then call /subscription/confirm
    const pending = await UserSubscription.create({
      user: req.user._id,
      plan: plan._id,
      status: 'pending',
      meta: { checkoutSessionId: session.id }
    });

    res.json({ sessionId: session.id, checkoutUrl: session.url, pendingId: pending._id });
  } catch (err) { next(err); }
};

// Confirm subscription after payment webhook or frontend confirmation
exports.confirmSubscription = async (req, res, next) => {
  try {
    const { pendingId, sessionId } = req.body;
    const pending = await UserSubscription.findById(pendingId).populate('plan');
    if (!pending) return res.status(404).json({ message: 'Pending subscription not found' });

    // verify session if stripe configured
    if (process.env.STRIPE_SECRET_KEY && sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session || session.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Payment not completed' });
      }
    }

    pending.status = 'active';
    pending.startDate = new Date();
    // set end date after 30 days for example
    pending.endDate = new Date(Date.now() + 30*24*60*60*1000);
    pending.meta = { ...pending.meta, confirmedAt: new Date(), sessionId };
    await pending.save();

    res.json(pending);
  } catch (err) { next(err); }
};
