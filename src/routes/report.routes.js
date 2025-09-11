const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const reportCtrl = require('../controllers/report.controller');

router.post('/generate-monthly', authenticate, reportCtrl.generateMonthlySummary);
router.get('/worker/:workerId', authenticate, reportCtrl.workerReport);
router.get('/thekedar', authenticate, reportCtrl.thekedarReport);

module.exports = router;
