const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  startStudy,
  stopStudy
} = require("../controllers/study.controller");

// Start study
router.post("/start", authMiddleware, startStudy);

// Stop study
router.post("/stop", authMiddleware, stopStudy);

module.exports = router;