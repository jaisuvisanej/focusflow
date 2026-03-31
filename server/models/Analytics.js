const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // ISO date string YYYY-MM-DD for the day this record represents
    date: {
      type: String,
      required: true,
    },
    dailyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    weeklyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number, // total minutes
      default: 0,
    },
    totalDistractions: {
      type: Number,
      default: 0,
    },
    averageSessionTime: {
      type: Number, // minutes
      default: 0,
    },
    mostProductiveHour: {
      type: Number, // 0-23
      default: null,
    },
    leastProductiveHour: {
      type: Number, // 0-23
      default: null,
    },
    // Hourly breakdown: array of 24 objects { hour, score, sessions }
    hourlyData: {
      type: [
        {
          hour: Number,
          score: Number,
          sessions: Number,
          duration: Number,
          distractions: Number,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Each user can only have one analytics record per day
analyticsSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
