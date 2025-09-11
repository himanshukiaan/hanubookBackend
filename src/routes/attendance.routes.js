const express = require('express');
const router = express.Router();
const attendanceCtrl = require('../controllers/attendance.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, attendanceCtrl.createAttendance);
router.post('/bulk', authenticate, attendanceCtrl.bulkCreate);
router.get('/worker/:workerId', authenticate, attendanceCtrl.getByWorkerAndMonth);

module.exports = router;
