const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const messageController = require("../controllers/message.controller");

// Save message
router.post("/", auth, messageController.sendMessage);

// Get message history of a group
router.get("/:groupId", auth, messageController.getGroupMessages);

// ✅ delete message
router.delete("/:messageId", auth, messageController.deleteMessage);

module.exports = router;