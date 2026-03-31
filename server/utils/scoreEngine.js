/**
 * Focus Score Algorithm
 * Score = (Deep Work Minutes × Consistency Factor) / Distraction Rate
 * Clamped to [0, 100]
 */

/**
 * Compute a focus score for a single session.
 * @param {number} durationMinutes - Length of the session in minutes
 * @param {number} distractionCount - Number of distraction events
 * @param {number} consistencyFactor - 0-1 based on sessions/target (default 1)
 * @returns {number} score 0-100
 */
function computeSessionScore(durationMinutes, distractionCount, consistencyFactor = 1) {
  if (durationMinutes <= 0) return 0;

  // Distraction rate: at least 1 to avoid division by zero
  // Higher distractions = more severe penalty
  const distractionRate = Math.max(1, distractionCount + 1);

  const rawScore = (durationMinutes * consistencyFactor) / distractionRate;

  // Normalise: assume a 25-min session with 0 distractions = 100
  const normalised = (rawScore / 25) * 100;

  return Math.min(100, Math.max(0, Math.round(normalised)));
}

/**
 * Compute a daily score from an array of session records for that day.
 * @param {Array} sessions - Array of { duration, distractionCount } objects
 * @param {number} targetSessions - How many sessions are "ideal" in a day (default 4)
 * @returns {number} daily score 0-100
 */
function computeDailyScore(sessions, targetSessions = 4) {
  if (!sessions || sessions.length === 0) return 0;

  const consistencyFactor = Math.min(1, sessions.length / targetSessions);

  const scores = sessions.map((s) =>
    computeSessionScore(s.duration, s.distractionCount, consistencyFactor)
  );

  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return Math.round(avg);
}

/**
 * Compute a weekly score from an array of daily scores.
 * @param {number[]} dailyScores - Array of daily scores for up to 7 days
 * @returns {number} weekly score 0-100
 */
function computeWeeklyScore(dailyScores) {
  if (!dailyScores || dailyScores.length === 0) return 0;
  const avg = dailyScores.reduce((sum, s) => sum + s, 0) / dailyScores.length;
  return Math.round(avg);
}

/**
 * Aggregate sessions by hour and return hourly statistics.
 * @param {Array} sessions - Session documents with startTime, duration, distractionCount
 * @returns {Array} 24-element array with per-hour stats
 */
function aggregateByHour(sessions) {
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    score: 0,
    sessions: 0,
    duration: 0,
    distractions: 0,
  }));

  sessions.forEach((session) => {
    const hour = new Date(session.startTime).getHours();
    hours[hour].sessions += 1;
    hours[hour].duration += session.duration || 0;
    hours[hour].distractions += session.distractionCount || 0;
  });

  // Compute per-hour scores
  hours.forEach((h) => {
    if (h.sessions > 0) {
      h.score = computeSessionScore(h.duration / h.sessions, h.distractions / h.sessions);
    }
  });

  return hours;
}

/**
 * Find most and least productive hours from hourly data.
 * @param {Array} hourlyData
 * @returns {{ mostProductiveHour: number|null, leastProductiveHour: number|null }}
 */
function findProductivityPeaks(hourlyData) {
  const active = hourlyData.filter((h) => h.sessions > 0);
  if (active.length === 0) return { mostProductiveHour: null, leastProductiveHour: null };

  const sorted = [...active].sort((a, b) => b.score - a.score);
  return {
    mostProductiveHour: sorted[0].hour,
    leastProductiveHour: sorted[sorted.length - 1].hour,
  };
}

module.exports = {
  computeSessionScore,
  computeDailyScore,
  computeWeeklyScore,
  aggregateByHour,
  findProductivityPeaks,
};
