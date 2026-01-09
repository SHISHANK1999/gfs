const StudySession = require("../models/StudySession");
const User = require("../models/User");

// DAILY SUMMARY
exports.getDailySummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Aaj ki date range (00:00 se 23:59)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Aaj ke sessions lao
    const sessions = await StudySession.find({
      userId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Total minutes calculate
    const totalMinutes = sessions.reduce(
      (sum, session) => sum + (session.durationMinutes || 0),
      0
    );

    const user = await User.findById(userId);

    // 🔥 Streak logic (simple)
    if (totalMinutes > 0) {
      user.streakCount += 1;
      user.lastStudyAt = new Date();
    } else {
      user.streakCount = 0;
    }

    await user.save();

    res.json({
      success: true,
      date: startOfDay.toDateString(),
      totalStudyMinutes: totalMinutes,
      dailyTarget: user.dailyStudyTarget,
      streakCount: user.streakCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};