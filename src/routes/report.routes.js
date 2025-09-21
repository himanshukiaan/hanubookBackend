const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const reportCtrl = require('../controllers/report.controller');

router.post('/generate-monthly', authenticate, reportCtrl.generateMonthlySummary);
router.get('/worker/:workerId', authenticate, reportCtrl.workerReport);
router.get('/day', authenticate, reportCtrl.thekedarDayReport);
router.get('/month', authenticate, reportCtrl.thekedarMonthReport);
router.get('/year', authenticate, reportCtrl.thekedarYearReport);
router.get('/dashboard', authenticate, reportCtrl.getDashboard);

module.exports = router;
