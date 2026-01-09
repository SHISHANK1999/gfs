const mongoose = require("mongoose");

const groupStudySessionSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },

    startedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        joinedAt: Date,
        leftAt: Date
      }
    ],

    startTime: {
      type: Date,
      required: true
    },

    endTime: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "GroupStudySession",
  groupStudySessionSchema
);