const mongoose = require("mongoose");

const dailySummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // YYYY-MM-DD format (example: "2026-01-20")
    date: {
      type: String,
      required: true
    },

    // Today study target (snapshot)
    targetMinutes: {
      type: Number,
      default: 60
    },

    // Totals
    totalMinutes: {
      type: Number,
      default: 0
    },

    soloMinutes: {
      type: Number,
      default: 0
    },

    groupMinutes: {
      type: Number,
      default: 0
    },

    // Streak
    streakEarnedToday: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// ✅ 1 user can have only 1 summary per day
dailySummarySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailySummary", dailySummarySchema);