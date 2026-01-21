const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    senderName: {
      type: String,
      default: "User"
    },

    text: {
      type: String,
      default: ""
    },

    fileUrl: {
      type: String,
      default: null
    },

    fileName: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);