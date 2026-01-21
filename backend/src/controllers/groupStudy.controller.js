const GroupStudySession = require("../models/GroupStudySession");
const Group = require("../models/Group");
const Notification = require("../models/Notification");
const User = require("../models/User");
const DailySummary = require("../models/DailySummary");
const StudySession = require("../models/StudySession");
const { getTodayString } = require("../utils/date");

/* =========================
   START GROUP STUDY
========================= */
exports.startGroupStudy = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID required"
      });
    }

    // ✅ create session
    const session = await GroupStudySession.create({
      groupId,
      startedBy: userId,
      startTime: new Date(),
      participants: [{ userId, joinedAt: new Date() }]
    });

    // ✅ fetch group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // ✅ notify all members (except starter)
    for (const memberId of group.members) {
      if (memberId.toString() !== userId.toString()) {
        await Notification.create({
          userId: memberId,
          message: "📢 Group study is live. Join now!",
          type: "GROUP_LIVE"
        });
      }
    }

    return res.json({
      success: true,
      message: "Group study session started",
      session
    });
  } catch (error) {
    console.log("startGroupStudy error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* =========================
   JOIN GROUP STUDY
========================= */
exports.joinGroupStudy = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID required"
      });
    }

    const session = await GroupStudySession.findById(sessionId);

    if (!session || session.endTime) {
      return res.status(400).json({
        success: false,
        message: "Session not active"
      });
    }

    const alreadyJoined = session.participants.find(
      (p) => p.userId.toString() === userId.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "User already joined this session"
      });
    }

    session.participants.push({
      userId,
      joinedAt: new Date()
    });

    await session.save();

    return res.json({
      success: true,
      message: "Joined group study session",
      session
    });
  } catch (error) {
    console.log("joinGroupStudy error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* =========================
   END GROUP STUDY
========================= */
exports.endGroupStudy = async (req, res) => {
  try {
    console.log("🔥 END GROUP STUDY HIT");

    const userId = req.user.userId;
    const { sessionId } = req.body;

    console.log("sessionId:", sessionId);

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID required"
      });
    }

    const session = await GroupStudySession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    if (session.endTime) {
      return res.status(400).json({
        success: false,
        message: "Session already ended"
      });
    }

    // ✅ only starter can end
    if (session.startedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only session starter can end the session"
      });
    }

    const endTime = new Date();
    session.endTime = endTime;

    // ✅ mark leftAt for all participants
    session.participants.forEach((p) => {
      if (!p.leftAt) p.leftAt = endTime;
    });

    await session.save();

    const today = getTodayString(); // "YYYY-MM-DD"

    // ✅ update each participant
    for (const p of session.participants) {
      const joined = new Date(p.joinedAt);
      const left = new Date(p.leftAt || session.endTime);

      const minutes = Math.max(0, Math.floor((left - joined) / (1000 * 60)));
      if (minutes <= 0) continue;

      // ✅ create StudySession doc
      await StudySession.create({
        userId: p.userId,
        startTime: joined,
        endTime: left,
        durationMinutes: minutes,
        type: "GROUP",
        groupId: session.groupId
      });

      // ✅ user fetch
      const user = await User.findById(p.userId);
      if (!user) continue;

      // ✅ FIX: lastStudyDate can be Date or String (old saved)
      const last = user.lastStudyDate
        ? new Date(user.lastStudyDate).toISOString().slice(0, 10)
        : null;

      // ✅ reset today counter if date changed
      if (last !== today) {
        user.todayStudyMinutes = 0;
        user.lastStudyDate = today; // save string
      }

      user.todayStudyMinutes += minutes;
      user.totalStudyMinutes = (user.totalStudyMinutes || 0) + minutes;

      console.log(
        "✅ USER UPDATE:",
        user._id.toString(),
        "todayStudyMinutes:",
        user.todayStudyMinutes,
        "totalStudyMinutes:",
        user.totalStudyMinutes
      );

      await user.save();

      // ✅ update DailySummary (NO conflict)
      const summary = await DailySummary.findOneAndUpdate(
  { userId: user._id, date: today },
  {
    $setOnInsert: {
      targetMinutes: user.dailyStudyTarget,
      streakEarnedToday: false,
      soloMinutes: 0
      // ❌ groupMinutes mat do
      // ❌ totalMinutes mat do
    },
    $inc: {
      totalMinutes: minutes,
      groupMinutes: minutes
    }
  },
  { upsert: true, new: true }
);

      // ✅ streak logic (once per day)
      if (!summary.streakEarnedToday && summary.totalMinutes >= summary.targetMinutes) {
        user.streakCount = (user.streakCount || 0) + 1;
        summary.streakEarnedToday = true;

        await user.save();
        await summary.save();
      }
    }

    return res.json({
      success: true,
      message: "Group study session ended",
      session
    });
  } catch (error) {
    console.error("End group study error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};