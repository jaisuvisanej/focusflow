const Analytics = require('../models/Analytics');
const Session = require('../models/Session');
const { generateInsights } = require('../utils/insightsEngine');
const {
  computeDailyScore,
  computeWeeklyScore,
  aggregateByHour,
  findProductivityPeaks,
} = require('../utils/scoreEngine');

// @route  GET /api/analytics/summary
// @access Private
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Last 7 days date range
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    // Fetch analytics records for the last 7 days
    const records = await Analytics.find({ userId, date: { $in: last7Days } }).sort({ date: 1 });

    // Build a full 7-day array, filling missing days with zeros
    const weeklyData = last7Days.map((date) => {
      const record = records.find((r) => r.date === date);
      return {
        date,
        dailyScore: record ? record.dailyScore : 0,
        totalSessions: record ? record.totalSessions : 0,
        totalDuration: record ? record.totalDuration : 0,
        totalDistractions: record ? record.totalDistractions : 0,
        averageSessionTime: record ? record.averageSessionTime : 0,
        mostProductiveHour: record ? record.mostProductiveHour : null,
        leastProductiveHour: record ? record.leastProductiveHour : null,
        hourlyData: record ? record.hourlyData : [],
      };
    });

    // Today's record
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records.find((r) => r.date === today) || null;

    // Weekly score = average of available daily scores
    const weeklyScore = computeWeeklyScore(
      weeklyData.filter((d) => d.dailyScore > 0).map((d) => d.dailyScore)
    );

    // Total sessions all time
    const totalSessionsAllTime = await Session.countDocuments({ userId, isActive: false });

    // Aggregate hourly data across 7 days
    const combinedHourly = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      score: 0,
      sessions: 0,
      duration: 0,
      distractions: 0,
    }));

    weeklyData.forEach(({ hourlyData }) => {
      (hourlyData || []).forEach((hd) => {
        if (hd.hour >= 0 && hd.hour < 24) {
          combinedHourly[hd.hour].sessions += hd.sessions || 0;
          combinedHourly[hd.hour].duration += hd.duration || 0;
          combinedHourly[hd.hour].distractions += hd.distractions || 0;
        }
      });
    });

    // Recompute scores on combined hourly
    combinedHourly.forEach((h) => {
      if (h.sessions > 0) {
        const avgDuration = h.duration / h.sessions;
        const avgDistracts = h.distractions / h.sessions;
        const distractionRate = Math.max(1, avgDistracts + 1);
        const raw = (avgDuration / distractionRate / 25) * 100;
        h.score = Math.min(100, Math.max(0, Math.round(raw)));
      }
    });

    const { mostProductiveHour, leastProductiveHour } = findProductivityPeaks(combinedHourly);

    res.json({
      success: true,
      summary: {
        today: todayRecord
          ? {
              dailyScore: todayRecord.dailyScore,
              totalSessions: todayRecord.totalSessions,
              totalDuration: todayRecord.totalDuration,
              averageSessionTime: todayRecord.averageSessionTime,
              totalDistractions: todayRecord.totalDistractions,
            }
          : { dailyScore: 0, totalSessions: 0, totalDuration: 0, averageSessionTime: 0, totalDistractions: 0 },
        weeklyScore,
        weeklyData,
        combinedHourly,
        mostProductiveHour,
        leastProductiveHour,
        totalSessionsAllTime,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/analytics/insights
// @access Private
const getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get last 7 days of sessions
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await Session.find({
      userId,
      startTime: { $gte: sevenDaysAgo },
      isActive: false,
    });

    // Get latest analytics record
    const today = new Date().toISOString().split('T')[0];
    const analyticsRecord = await Analytics.findOne({ userId, date: today });

    const hourlyData = aggregateByHour(sessions);

    const analyticsData = {
      weeklyScore: analyticsRecord?.weeklyScore || 0,
      dailyScore: analyticsRecord?.dailyScore || 0,
      averageSessionTime: analyticsRecord?.averageSessionTime || 0,
      mostProductiveHour: analyticsRecord?.mostProductiveHour ?? null,
      leastProductiveHour: analyticsRecord?.leastProductiveHour ?? null,
    };

    const insights = generateInsights(sessions, hourlyData, analyticsData);

    res.json({ success: true, insights });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/analytics/compute
// @access Private — manually trigger recomputation
const computeAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
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

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }
    const weeklyRecords = await Analytics.find({ userId, date: { $in: last7Days } });
    const weeklyScore = computeWeeklyScore([...weeklyRecords.map((r) => r.dailyScore), dailyScore]);

    const doc = await Analytics.findOneAndUpdate(
      { userId, date: today },
      { dailyScore, weeklyScore, totalSessions: todaySessions.length, totalDuration, totalDistractions, averageSessionTime: avgSession, mostProductiveHour, leastProductiveHour, hourlyData },
      { upsert: true, new: true }
    );

    res.json({ success: true, analytics: doc });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getInsights, computeAnalytics };
