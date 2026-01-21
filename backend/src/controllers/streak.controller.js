const DailySummary = require("../models/DailySummary");
const User = require("../models/User");
const { getTodayString } = require("../utils/date");

exports.getTodaySummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = getTodayString();

    const user = await User.findById(userId).select(
      "name streakCount todayStudyMinutes totalStudyMinutes dailyStudyTarget lastStudyDate"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ fetch today summary from DailySummary
    let summary = await DailySummary.findOne({ userId, date: today });

    // ✅ if not found → create empty summary for today
    if (!summary) {
      summary = await DailySummary.create({
        userId,
        date: today,
        targetMinutes: user.dailyStudyTarget || 60,
        totalMinutes: 0,
        groupMinutes: 0,
        soloMinutes: 0,
        streakEarnedToday: false
      });
    }

    return res.json({
      success: true,
      message: "Today summary fetched",
      data: {
        today,
        user: {
          _id: user._id,
          name: user.name,
          streakCount: user.streakCount,
          todayStudyMinutes: user.todayStudyMinutes,
          totalStudyMinutes: user.totalStudyMinutes,
          dailyStudyTarget: user.dailyStudyTarget
        },
        summary: {
          _id: summary._id,
          totalMinutes: summary.totalMinutes,
          groupMinutes: summary.groupMinutes,
          soloMinutes: summary.soloMinutes,
          targetMinutes: summary.targetMinutes,
          streakEarnedToday: summary.streakEarnedToday
        }
      }
    });
  } catch (error) {
    console.log("getTodaySummary error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};