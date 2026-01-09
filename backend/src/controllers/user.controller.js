const User = require("../models/User");

// GET logged-in user profile
exports.getMyProfile = async (req, res) => {
  try {
    // JWT middleware se userId milta hai
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// UPDATE logged-in user profile
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { name, dailyStudyTarget } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        dailyStudyTarget
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};