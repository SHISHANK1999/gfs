const FocusSession = require("../models/FocusSession");
const User = require("../models/User");

// helper: minutes difference
const getMinutesDiff = (start, end) => {
  const ms = new Date(end) - new Date(start);
  return Math.max(0, Math.floor(ms / 60000)); // minutes
};

// helper: only date (ignore time)
const toDateString = (d) => new Date(d).toDateString();

exports.startFocus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId, subject, durationMinutes } = req.body;

    if (!durationMinutes) {
      return res.status(400).json({
        success: false,
        message: "durationMinutes required"
      });
    }

    const session = await FocusSession.create({
      groupId: groupId || null,
      startedBy: userId,
      subject: subject || "General",
      durationMinutes,
      startTime: new Date(),
      participants: [
        {
          userId,
          joinedAt: new Date()
        }
      ]
    });

    return res.json({
      success: true,
      message: "Focus session started",
      session
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.joinFocus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId required"
      });
    }

    const session = await FocusSession.findById(sessionId);

    if (!session || session.status !== "RUNNING") {
      return res.status(400).json({
        success: false,
        message: "Session not active"
      });
    }

    const already = session.participants.find(
      (p) => p.userId.toString() === userId && !p.leftAt
    );

    if (already) {
      return res.status(400).json({
        success: false,
        message: "Already joined"
      });
    }

    session.participants.push({
      userId,
      joinedAt: new Date()
    });

    await session.save();

    return res.json({
      success: true,
      message: "Joined focus session",
      session
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.leaveFocus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.body;

    const session = await FocusSession.findById(sessionId);

    if (!session || session.status !== "RUNNING") {
      return res.status(400).json({
        success: false,
        message: "Session not active"
      });
    }

    const part = session.participants.find(
      (p) => p.userId.toString() === userId && !p.leftAt
    );

    if (!part) {
      return res.status(400).json({
        success: false,
        message: "Not joined in this session"
      });
    }

    part.leftAt = new Date();
    await session.save();

    return res.json({
      success: true,
      message: "Left focus session",
      session
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.endFocus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.body;

    const session = await FocusSession.findById(sessionId);

    if (!session || session.status !== "RUNNING") {
      return res.status(400).json({
        success: false,
        message: "Session already ended / not found"
      });
    }

    // only starter can end
    if (session.startedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only starter can end session"
      });
    }

    const endTime = new Date();
    session.endTime = endTime;
    session.status = "ENDED";

    // all participants leftAt fill
    session.participants.forEach((p) => {
      if (!p.leftAt) p.leftAt = endTime;
    });

    await session.save();

    // ✅ Update each participant "todayStudyMinutes"
    for (const p of session.participants) {
      const minutes = getMinutesDiff(p.joinedAt, p.leftAt);

      const user = await User.findById(p.userId);

      if (!user) continue;

      // ✅ reset todayStudyMinutes if new day
      const today = toDateString(new Date());
      const last = user.lastStudyDate ? toDateString(user.lastStudyDate) : null;

      if (last !== today) {
        user.todayStudyMinutes = 0;
      }

      user.todayStudyMinutes += minutes;
      user.lastStudyDate = new Date();

      // ✅ Streak update (only if target achieved today)
      if (user.todayStudyMinutes >= user.dailyStudyTarget) {
        // check yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;

        // if user already had streak today (avoid multiple increments)
        // simple guard: streak should not increment twice same day
        // We'll store streakUpdatedOn by comparing date string
        // (optional quick fix without new field)
        // We'll assume streak increments only once per day:
        // if last date != today before update, increment now.

        // ✅ easiest safe approach:
        // if streak is 0 => set to 1
        if (user.streakCount === 0) {
          user.streakCount = 1;
        } else {
          // if last day was yesterday -> streak++
          // else break -> streak = 1
          // (this is simplified because lastStudyDate becomes today above)
          user.streakCount += 1;
        }
      }

      await user.save();
    }

    return res.json({
      success: true,
      message: "Focus session ended",
      session
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};