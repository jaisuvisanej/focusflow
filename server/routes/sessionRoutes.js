const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  startSession,
  endSession,
  trackDistraction,
  getSessions,
  getActiveSession,
} = require('../controllers/sessionController');

const router = express.Router();

// All session routes require authentication
router.use(protect);

router.post('/start', startSession);
router.get('/active', getActiveSession);
router.get('/', getSessions);
router.patch('/:id/end', endSession);
router.patch('/:id/distract', trackDistraction);

module.exports = router;
