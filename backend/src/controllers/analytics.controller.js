const StudySession = require("../models/StudySession");

// Helper: date range
const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

// WEEKLY ANALYTICS (last 7 days)
exports.getWeeklyAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { start, end } = getDateRange(7);

    const sessions = await StudySession.find({
      userId,
      createdAt: { $gte: start, $lte: end }
    });

    // Day-wise aggregation
    const dayMap = {};
    sessions.forEach((s) => {
      const day = new Date(s.createdAt).toDateString();
      dayMap[day] = (dayMap[day] || 0) + (s.durationMinutes || 0);
    });

    res.json({
      success: true,
      range: "last_7_days",
      data: dayMap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// MONTHLY ANALYTICS (current month)
exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date();

    const sessions = await StudySession.find({
      userId,
      createdAt: { $gte: start, $lte: end }
    });

    let totalMinutes = 0;
    const activeDays = new Set();

    sessions.forEach((s) => {
      totalMinutes += s.durationMinutes || 0;
      activeDays.add(new Date(s.createdAt).toDateString());
    });

    res.json({
      success: true,
      month: start.toLocaleString("default", { month: "long" }),
      totalStudyMinutes: totalMinutes,
      daysStudied: activeDays.size
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};