const mongoose = require("mongoose");

/*
  StudySession:
  Ek study start aur stop ka record
*/

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    startTime: {
      type: Date,
      required: true
    },

    endTime: {
      type: Date
    },

    durationMinutes: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("StudySession", studySessionSchema);