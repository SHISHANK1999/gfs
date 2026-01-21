const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const focusController = require("../controllers/focus.controller");

router.post("/start", auth, focusController.startFocus);
router.post("/join", auth, focusController.joinFocus);
router.post("/leave", auth, focusController.leaveFocus);
router.post("/end", auth, focusController.endFocus);

module.exports = router;