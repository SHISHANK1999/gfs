const Group = require("../models/Group");
const User = require("../models/User");

/* =========================
   INVITE MEMBER (by phone)
========================= */
exports.inviteMember = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { groupId, phoneNumber } = req.body;

    if (!groupId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "groupId and phoneNumber are required"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // ✅ Only group creator can invite (admin)
    if (group.createdBy.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: "Only group admin can invite members"
      });
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this phone number"
      });
    }

    const alreadyMember = group.members.some(
      (m) => m.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User already in this group"
      });
    }

    group.members.push(user._id);
    await group.save();

    return res.json({
      success: true,
      message: "Member added successfully ✅",
      addedUser: {
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber
      },
      group
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* =========================
   GET GROUP MEMBERS
========================= */
exports.getGroupMembers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate(
      "members",
      "name phoneNumber"
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // ✅ Only members can view members list
    const isMember = group.members.some(
      (m) => m._id.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group"
      });
    }

    return res.json({
      success: true,
      groupId,
      groupName: group.name,
      members: group.members
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* =========================
   DELETE GROUP (admin only)
========================= */
exports.deleteGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // ✅ Only creator can delete
    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only group admin can delete this group"
      });
    }

    await Group.findByIdAndDelete(groupId);

    return res.json({
      success: true,
      message: "Group deleted successfully ✅"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* =========================
   CREATE GROUP
========================= */
exports.createGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Group name required"
      });
    }

    const group = await Group.create({
      name: name.trim(),
      createdBy: userId,
      members: [userId]
    });

    return res.json({
      success: true,
      message: "Group created successfully",
      group
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* =========================
   REMOVE MEMBER (admin only)
========================= */
exports.removeMember = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
      return res.status(400).json({
        success: false,
        message: "groupId and userId are required"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // ✅ Only creator can remove members
    if (group.createdBy.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: "Only group admin can remove members"
      });
    }

    // ✅ Admin खुद को remove नहीं कर सकता
    if (userId === group.createdBy.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot remove himself"
      });
    }

    const isMember = group.members.some((m) => m.toString() === userId);

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this group"
      });
    }

    group.members = group.members.filter((m) => m.toString() !== userId);
    await group.save();

    return res.json({
      success: true,
      message: "Member removed successfully ✅",
      group
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/* =========================
   GET MY GROUPS
========================= */
exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user.userId;

    const groups = await Group.find({ members: userId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      groups
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};