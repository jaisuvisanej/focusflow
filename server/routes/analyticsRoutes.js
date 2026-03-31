const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getSummary, getInsights, computeAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/insights', getInsights);
router.post('/compute', computeAnalytics);

module.exports = router;
