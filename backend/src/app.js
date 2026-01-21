const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const notificationRoutes = require("./routes/notification.routes");
const app = express();

// middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// message routes
const messageRoutes = require("./routes/message.routes");
app.use("/api/messages", messageRoutes);

// group routes
const groupRoutes = require("./routes/group.routes");
app.use("/api/groups", groupRoutes);

// routes
app.use("/api/auth", authRoutes);
const userRoutes = require("./routes/user.routes");
app.use("/api/user", userRoutes);

// study routes
const studyRoutes = require("./routes/study.routes");
app.use("/api/study", studyRoutes);

// summary routes
const summaryRoutes = require("./routes/summary.routes");
app.use("/api/summary", summaryRoutes);

// analytics routes
const analyticsRoutes = require("./routes/analytics.routes");
app.use("/api/analytics", analyticsRoutes);

// group analytics routes
const groupAnalyticsRoutes = require("./routes/groupAnalytics.routes");
app.use("/api/group-analytics", groupAnalyticsRoutes);

// group routes
// const groupRoutes = require("./routes/group.routes");
// app.use("/api/groups", groupRoutes);

//  message routes
// const messageRoutes = require("./routes/message.routes");
// app.use("/api/messages", messageRoutes);

// group study routes
const groupStudyRoutes = require("./routes/groupStudy.routes");
app.use("/api/group-study", groupStudyRoutes);

// streak routes
const streakRoutes = require("./routes/streak.routes");
app.use("/api/streak", streakRoutes);

// notification routes
// const notificationRoutes = require("./routes/notification.routes");
app.use("/api/notifications", notificationRoutes);

// upload routes
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/uploads", express.static("uploads"));
// download routes
app.use("/api/download", require("./routes/download.routes"));

// focus routes
const focusRoutes = require("./routes/focus.routes");
app.use("/api/focus", focusRoutes);

// test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GFS backend running ✅"
  });
});

module.exports = app;