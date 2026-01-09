const Group = require("../models/Group");
const StudySession = require("../models/StudySession");

// GROUP LEADERBOARD (Today)
exports.getGroupLeaderboard = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Group fetch karo
    const group = await Group.findById(groupId).populate("members", "name");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Aaj ki date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const leaderboard = [];

    // Har member ka study time calculate
    for (let member of group.members) {
      const sessions = await StudySession.find({
        userId: member._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const totalMinutes = sessions.reduce(
        (sum, s) => sum + (s.durationMinutes || 0),
        0
      );

      leaderboard.push({
        userId: member._id,
        name: member.name,
        totalStudyMinutes: totalMinutes
      });
    }

    // Sort descending
    leaderboard.sort(
      (a, b) => b.totalStudyMinutes - a.totalStudyMinutes
    );

    res.json({
      success: true,
      group: group.name,
      leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};