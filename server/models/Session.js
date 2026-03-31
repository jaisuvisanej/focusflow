const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    // Duration in minutes, computed on session end
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    distractionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Derived focus score for this session (0-100)
    focusScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for efficient analytics queries
sessionSchema.index({ userId: 1, startTime: -1 });
sessionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Session', sessionSchema);
