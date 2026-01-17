const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const groupController = require("../controllers/group.controller");

/* =========================
   GROUP ROUTES
========================= */

// Invite member by phone
router.post("/invite", auth, groupController.inviteMember);

// Get group members
router.get("/:groupId/members", auth, groupController.getGroupMembers);

// Delete group (admin only)
router.delete("/:groupId", auth, groupController.deleteGroup);

// ✅ Create group
router.post("/create", auth, groupController.createGroup);

// ✅ Remove member (admin only)
router.post("/remove-member", auth, groupController.removeMember);

// ✅ Get my groups
router.get("/my", auth, groupController.getMyGroups);

// ✅ (Optional) Backward compatibility
router.post("/", auth, groupController.createGroup);
router.get("/", auth, groupController.getMyGroups);

module.exports = router;

