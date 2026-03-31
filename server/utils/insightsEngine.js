/**
 * AI Insights Engine (Rule-Based)
 * Generates human-readable productivity insights from the last 7 days of session data.
 */

/**
 * @param {Array} sessions - Last 7 days of session documents
 * @param {Array} hourlyData - Aggregated hourly stats (24-element array)
 * @param {Object} analytics - Computed analytics object { dailyScore, weeklyScore, ... }
 * @returns {string[]} Array of insight strings
 */
function generateInsights(sessions, hourlyData, analytics) {
  const insights = [];

  if (!sessions || sessions.length === 0) {
    return ['Start your first focus session to unlock personalized AI insights!'];
  }

  const { mostProductiveHour, leastProductiveHour, weeklyScore, averageSessionTime } = analytics;

  // ─── Productive hour insight ──────────────────────────────────────────────
  if (mostProductiveHour !== null) {
    const from = formatHour(mostProductiveHour);
    const to = formatHour(mostProductiveHour + 1);
    insights.push(`🔥 You are most productive between ${from}–${to}. Schedule deep work here.`);
  }

  // ─── Least productive hour insight ───────────────────────────────────────
  if (leastProductiveHour !== null && leastProductiveHour !== mostProductiveHour) {
    const hourLabel = formatHour(leastProductiveHour);
    insights.push(
      `⚠️ Your productivity dips around ${hourLabel}. Consider taking a break or doing light tasks then.`
    );
  }

  // ─── Evening drop-off ─────────────────────────────────────────────────────
  const eveningHours = hourlyData.slice(20, 24); // 8PM–midnight
  const eveningActive = eveningHours.filter((h) => h.sessions > 0);
  const eveningAvgScore =
    eveningActive.length > 0
      ? eveningActive.reduce((sum, h) => sum + h.score, 0) / eveningActive.length
      : null;

  if (eveningAvgScore !== null && eveningAvgScore < 40) {
    insights.push(`🌙 Your productivity drops significantly after 8PM. Avoid scheduling focus sessions late at night.`);
  }

  // ─── Distraction rate insight ─────────────────────────────────────────────
  const totalDistractions = sessions.reduce((sum, s) => sum + (s.distractionCount || 0), 0);
  const avgDistractions = sessions.length > 0 ? totalDistractions / sessions.length : 0;

  if (avgDistractions >= 5) {
    insights.push(
      `📵 Your average distraction rate is high (${avgDistractions.toFixed(1)} per session). Try the Pomodoro technique to regain focus.`
    );
  } else if (avgDistractions < 2 && sessions.length > 3) {
    insights.push(
      `✅ Excellent focus discipline! You average only ${avgDistractions.toFixed(1)} distractions per session.`
    );
  }

  // ─── Session duration insight ─────────────────────────────────────────────
  if (averageSessionTime < 15 && sessions.length > 2) {
    insights.push(
      `⏱️ Your average session is only ${Math.round(averageSessionTime)} minutes. Try extending sessions to at least 25 minutes for deeper focus.`
    );
  } else if (averageSessionTime >= 50) {
    insights.push(
      `💪 Great stamina! You sustain focus for ${Math.round(averageSessionTime)} minutes on average. Remember to take regular breaks to avoid burnout.`
    );
  }

  // ─── Weekly score insight ─────────────────────────────────────────────────
  if (weeklyScore >= 80) {
    insights.push(`🏆 Outstanding week! Your productivity score of ${weeklyScore} puts you in the top tier.`);
  } else if (weeklyScore >= 60) {
    insights.push(`📈 Good week! A score of ${weeklyScore} shows solid consistency. Keep pushing.`);
  } else if (weeklyScore > 0 && weeklyScore < 40) {
    insights.push(
      `💡 Your weekly score of ${weeklyScore} suggests room for improvement. Try to complete at least 3–4 focus sessions daily.`
    );
  }

  // ─── Consistency insight ─────────────────────────────────────────────────
  const uniqueDays = new Set(sessions.map((s) => new Date(s.startTime).toDateString())).size;
  if (uniqueDays < 3 && sessions.length > 0) {
    insights.push(
      `📅 You only focused on ${uniqueDays} day(s) this week. Daily consistency is key to building a strong productivity habit.`
    );
  } else if (uniqueDays >= 5) {
    insights.push(`🔁 You have been consistent across ${uniqueDays} days this week — great habit building!`);
  }

  // ─── Afternoon slump insight ──────────────────────────────────────────────
  const afternoonHours = hourlyData.slice(13, 16); // 1PM–4PM
  const afternoonActive = afternoonHours.filter((h) => h.sessions > 0);
  const afternoonDistracts =
    afternoonActive.length > 0
      ? afternoonActive.reduce((sum, h) => sum + h.distractions, 0) / afternoonActive.length
      : 0;

  if (afternoonDistracts > 3) {
    insights.push(
      `☕ Your distraction rate is especially high in the afternoons. Try a short walk or power nap after lunch.`
    );
  }

  // Always return at least one insight
  if (insights.length === 0) {
    insights.push(`📊 Keep logging sessions to receive more personalised AI insights!`);
  }

  return insights;
}

function formatHour(hour) {
  const h = hour % 24;
  const suffix = h < 12 ? 'AM' : 'PM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}${suffix}`;
}

module.exports = { generateInsights };
