const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const streakController = require("../controllers/streak.controller");

// ✅ Today summary + streak status
router.get("/today", auth, streakController.getTodaySummary);

module.exports = router;