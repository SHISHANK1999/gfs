const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getDailySummary
} = require("../controllers/summary.controller");

router.get("/daily", authMiddleware, getDailySummary);

module.exports = router;