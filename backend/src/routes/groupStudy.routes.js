const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");

const groupStudyController = require("../controllers/groupStudy.controller");

// ✅ Start group study
router.post("/start", auth, groupStudyController.startGroupStudy);

// ✅ Join group study
router.post("/join", auth, groupStudyController.joinGroupStudy);

// ✅ End group study (🔥 THIS WAS MISSING)
router.post("/end", auth, groupStudyController.endGroupStudy);

module.exports = router;