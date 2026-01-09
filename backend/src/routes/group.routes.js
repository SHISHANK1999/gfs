const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { createGroup } = require("../controllers/group.controller");

// Create group
router.post("/create", authMiddleware, createGroup);

module.exports = router;