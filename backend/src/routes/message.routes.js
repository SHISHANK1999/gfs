const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const messageController = require("../controllers/message.controller");

// Save message
router.post("/", auth, messageController.sendMessage);

// Get message history of a group
router.get("/:groupId", auth, messageController.getGroupMessages);

module.exports = router;