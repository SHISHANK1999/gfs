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

    dailyStudyTarget: {
      type: Number, // minutes
      default: 60
    },

    lastStudyAt: {
      type: Date
    },

    isActive: {
      type: Boolean,
      default: true
    },
    
    // 🔔 Notification preferences
    preferredStudyTime: {
      type: String, // "19:00"
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