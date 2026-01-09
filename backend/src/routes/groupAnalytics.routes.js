const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getGroupLeaderboard
} = require("../controllers/groupAnalytics.controller");

// Group leaderboard (today)
router.get(
  "/leaderboard/:groupId",
  authMiddleware,
  getGroupLeaderboard
);

module.exports = router;