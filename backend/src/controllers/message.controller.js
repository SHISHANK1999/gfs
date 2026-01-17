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
    const { groupId } = req.params;

    const messages = await Message.find({ groupId })
      .sort({ createdAt: 1 })
      .limit(200);

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};