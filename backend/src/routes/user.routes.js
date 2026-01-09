const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");



// Protected route
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user
  });
});

module.exports = router;