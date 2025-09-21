const express = require('express');
const router = express.Router();
const workerCtrl = require('../controllers/worker.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, workerCtrl.createWorker);
router.get('/', authenticate, workerCtrl.getAll);
router.get('/:id', authenticate, workerCtrl.getById);
router.put('/:id', authenticate, workerCtrl.update);
router.patch('/:id/inactivate', authenticate, workerCtrl.inactivate);
router.delete('/:id', authenticate, workerCtrl.remove);

module.exports = router;
