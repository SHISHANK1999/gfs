const Group = require("../models/Group");

// CREATE GROUP
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
      name,
      createdBy: userId,
      members: [userId]
    });

    res.json({
      success: true,
      message: "Group created successfully",
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};