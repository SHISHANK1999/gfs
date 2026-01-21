const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true
    },

    streakCount: {
      type: Number,
      default: 0
    },

    lastStudyDate: {
      type: String, // ✅ "2026-01-21"
      default: null
    },

    todayStudyMinutes: {
      type: Number,
      default: 0
    },

    totalStudyMinutes: {
      type: Number,
      default: 0
    },

    dailyStudyTarget: {
      type: Number,
      default: 60
    },

    isActive: {
      type: Boolean,
      default: true
    },

    preferredStudyTime: {
      type: String,
      default: "19:00"
    },

    reminderBeforeMinutes: {
      type: Number,
      default: 30
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);