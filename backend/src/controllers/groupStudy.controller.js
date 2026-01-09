const GroupStudySession = require("../models/GroupStudySession");
const Group = require("../models/Group");
const Notification = require("../models/Notification");


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

    // 1️⃣ Group study session create
    const session = await GroupStudySession.create({
      groupId,
      startedBy: userId,
      startTime: new Date(),
      participants: [
        {
          userId,
          joinedAt: new Date()
        }
      ]
    });

    // 2️⃣ Group fetch karo
    const group = await Group.findById(groupId);

    // 3️⃣ Group members ko notification bhejo
    group.members.forEach(async (memberId) => {
      if (memberId.toString() !== userId) {
        await Notification.create({
          userId: memberId,
          message: "📢 Group study is live. Join now!",
          type: "GROUP_LIVE"
        });
      }
    });

    // 4️⃣ Response
    res.json({
      success: true,
      message: "Group study session started",
      session
    });
  } catch (error) {
    res.status(500).json({
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
      (p) => p.userId.toString() === userId
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

    res.json({
      success: true,
      message: "Joined group study session",
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* =========================
   END GROUP STUDY
========================= */
const StudySession = require("../models/StudySession");

exports.endGroupStudy = async (req, res) => {
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
        message: "Session already ended or not found"
      });
    }

    // ✅ Only starter can end
    if (session.startedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only session starter can end the session"
      });
    }

    const endTime = new Date();
    session.endTime = endTime;

    // 🔥 MARK leave time + CREATE individual study sessions
    for (let p of session.participants) {
      if (!p.leftAt) {
        p.leftAt = endTime;
      }

      const durationMs = p.leftAt - p.joinedAt;
      const durationMinutes = Math.floor(durationMs / (1000 * 60));

      // ⏱️ Create individual study session
      if (durationMinutes > 0) {
        await StudySession.create({
          userId: p.userId,
          startTime: p.joinedAt,
          endTime: p.leftAt,
          durationMinutes
        });
      }
    }

    await session.save();

    res.json({
      success: true,
      message: "Group study session ended",
      session
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};