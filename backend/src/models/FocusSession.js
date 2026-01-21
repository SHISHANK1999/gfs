const mongoose = require("mongoose");

const focusSessionSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null
    },

    startedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    subject: {
      type: String,
      default: "General"
    },

    durationMinutes: {
      type: Number,
      required: true
    },

    startTime: {
      type: Date,
      default: Date.now
    },

    endTime: {
      type: Date,
      default: null
    },

    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
        leftAt: { type: Date, default: null }
      }
    ],

    status: {
      type: String,
      enum: ["RUNNING", "ENDED"],
      default: "RUNNING"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FocusSession", focusSessionSchema);