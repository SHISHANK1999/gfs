const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getWeeklyAnalytics,
  getMonthlyAnalytics
} = require("../controllers/analytics.controller");

router.get("/weekly", authMiddleware, getWeeklyAnalytics);
router.get("/monthly", authMiddleware, getMonthlyAnalytics);

module.exports = router;