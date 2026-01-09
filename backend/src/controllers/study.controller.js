const StudySession = require("../models/StudySession");

// START STUDY
exports.startStudy = async (req, res) => {
  try {
    const userId = req.user.userId;

    const session = await StudySession.create({
      userId,
      startTime: new Date()
    });

    res.json({
      success: true,
      message: "Study started",
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// STOP STUDY
exports.stopStudy = async (req, res) => {
  try {
    const userId = req.user.userId;

    // latest active session lo
    const session = await StudySession.findOne({
      userId,
      endTime: null
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "No active study session found"
      });
    }

    const endTime = new Date();
    const durationMs = endTime - session.startTime;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    session.endTime = endTime;
    session.durationMinutes = durationMinutes;

    await session.save();

    res.json({
      success: true,
      message: "Study stopped",
      durationMinutes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};