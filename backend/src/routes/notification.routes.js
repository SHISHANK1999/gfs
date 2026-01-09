const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getNotifications
} = require("../controllers/notification.controller");

router.get("/", authMiddleware, getNotifications);

module.exports = router;