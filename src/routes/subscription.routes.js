const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const subCtrl = require('../controllers/subscription.controller');

router.get('/plans', subCtrl.listPlans);
router.post('/create-checkout-session', authenticate, subCtrl.createCheckoutSession);
router.post('/confirm', authenticate, subCtrl.confirmSubscription);

module.exports = router;
