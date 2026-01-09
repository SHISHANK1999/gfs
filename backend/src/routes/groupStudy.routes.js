const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  startGroupStudy,
  joinGroupStudy,
  endGroupStudy
} = require("../controllers/groupStudy.controller");

router.post("/start", authMiddleware, startGroupStudy);
router.post("/join", authMiddleware, joinGroupStudy);
router.post("/end", authMiddleware, endGroupStudy);

module.exports = router;