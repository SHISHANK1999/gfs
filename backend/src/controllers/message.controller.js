const Message = require("../models/Message");

/* =========================
   SEND MESSAGE (SAVE IN DB)
========================= */
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId, text, fileUrl, fileName } = req.body;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID required"
      });
    }

    const message = await Message.create({
      groupId,
      senderId: userId,
      senderName: "You", // later profile name se laayenge
      text: text || "",
      fileUrl: fileUrl || null,
      fileName: fileName || null
    });

    res.json({
      success: true,
      message: "Message saved",
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* =========================
   GET GROUP MESSAGES
========================= */
exports.getGroupMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "groupId required"
      });
    }

    // latest 100 messages
    const messages = await Message.find({ groupId })
      .sort({ createdAt: 1 })
      .limit(100);

    return res.json({
      success: true,
      messages
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* =========================
   SAVE MESSAGE
========================= */
exports.saveMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { groupId, text, fileUrl, fileName } = req.body;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "groupId required"
      });
    }

    const msg = await Message.create({
      groupId,
      senderId,
      senderName: req.user.name || "User",
      text: text || "",
      fileUrl: fileUrl || null,
      fileName: fileName || null
    });

    return res.json({
      success: true,
      message: "Message saved ✅",
      msg
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* =========================
   DELETE MESSAGE
========================= */
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;

    const msg = await Message.findById(messageId);

    if (!msg) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // ✅ only sender can delete
    if (msg.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    await Message.findByIdAndDelete(messageId);

    return res.json({
      success: true,
      message: "Message deleted",
      messageId
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};
// exports.getGroupMessages = async (req, res) => {
//   try {
//     const { groupId } = req.params;

//     const messages = await Message.find({ groupId })
//       .sort({ createdAt: 1 })
//       .limit(200);

//     res.json({
//       success: true,
//       messages
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };