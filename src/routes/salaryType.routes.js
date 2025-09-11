const express = require('express');
const router = express.Router();
const stCtrl = require('../controllers/salaryTypes.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, stCtrl.create);
router.get('/', authenticate, stCtrl.list);

module.exports = router;
