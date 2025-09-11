const express = require('express');
const router = express.Router();
const workerCtrl = require('../controllers/worker.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { checkWorkerLimit } = require('../middleware/subscriptionLimit.middleware');

router.post('/', authenticate, checkWorkerLimit, workerCtrl.createWorker);
router.get('/', authenticate, workerCtrl.getAll);
router.get('/:id', authenticate, workerCtrl.getById);
router.put('/:id', authenticate, workerCtrl.update);
router.delete('/:id', authenticate, workerCtrl.remove);

module.exports = router;
