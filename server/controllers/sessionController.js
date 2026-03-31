const Session = require('../models/Session');
const Analytics = require('../models/Analytics');
const {
  computeSessionScore,
  computeDailyScore,
  computeWeeklyScore,
  aggregateByHour,
  findProductivityPeaks,
} = require('../utils/scoreEngine');

// Helper: update analytics for today
const refreshDailyAnalytics = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const startOfDay = new Date(today);
  const endOfDay = new Date(today);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const todaySessions = await Session.find({
    userId,
    startTime: { $gte: startOfDay, $lt: endOfDay },
    isActive: false,
  });

  const hourlyData = aggregateByHour(todaySessions);
  const { mostProductiveHour, leastProductiveHour } = findProductivityPeaks(hourlyData);
  const dailyScore = computeDailyScore(todaySessions);
  const totalDuration = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalDistractions = todaySessions.reduce((sum, s) => sum + (s.distractionCount || 0), 0);
  const avgSession = todaySessions.length > 0 ? totalDuration / todaySessions.length : 0;

  // Compute weekly score from last 7 daily records
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }

  const weeklyRecords = await Analytics.find({ userId, date: { $in: last7Days } });
  const dailyScores = weeklyRecords.map((r) => r.dailyScore);
  dailyScores.push(dailyScore); // include today
  const weeklyScore = computeWeeklyScore(dailyScores);

  const analyticsDoc = await Analytics.findOneAndUpdate(
    { userId, date: today },
    {
      dailyScore,
      weeklyScore,
      totalSessions: todaySessions.length,
      totalDuration,
      totalDistractions,
      averageSessionTime: avgSession,
      mostProductiveHour,
      leastProductiveHour,
      hourlyData,
    },
    { upsert: true, new: true }
  );

  return analyticsDoc;
};

// @route  POST /api/sessions/start
// @access Private
const startSession = async (req, res, next) => {
  try {
    // Check if there's already an active session
    const active = await Session.findOne({ userId: req.user._id, isActive: true });
    if (active) {
      return res.status(400).json({ success: false, message: 'You already have an active session' });
    }

    const session = await Session.create({ userId: req.user._id, startTime: new Date() });
    res.status(201).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

// @route  PATCH /api/sessions/:id/end
// @access Private
const endSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (!session.isActive) return res.status(400).json({ success: false, message: 'Session already ended' });

    const endTime = new Date();
    const durationMs = endTime - new Date(session.startTime);
    const durationMinutes = Math.max(0, Math.round(durationMs / 60000));

    session.endTime = endTime;
    session.duration = durationMinutes;
    session.isActive = false;
    session.focusScore = computeSessionScore(durationMinutes, session.distractionCount);
    if (req.body.notes) session.notes = req.body.notes;

    await session.save();

    // Refresh daily analytics asynchronously (non-blocking)
    refreshDailyAnalytics(req.user._id).catch(console.error);

    res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

// @route  PATCH /api/sessions/:id/distract
// @access Private
const trackDistraction = async (req, res, next) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isActive: true },
      { $inc: { distractionCount: 1 } },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Active session not found' });
    res.json({ success: true, distractionCount: session.distractionCount });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/sessions
// @access Private
const getSessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const query = { userId: req.user._id };
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Session.countDocuments(query);

    res.json({ success: true, sessions, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/sessions/active
// @access Private
const getActiveSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({ userId: req.user._id, isActive: true });
    res.json({ success: true, session: session || null });
  } catch (err) {
    next(err);
  }
};

module.exports = { startSession, endSession, trackDistraction, getSessions, getActiveSession };
