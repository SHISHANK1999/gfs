const express = require("express");
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth.routes");

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
const groupRoutes = require("./routes/group.routes");

app.use("/api/groups", groupRoutes);

// group study routes
const groupStudyRoutes = require("./routes/groupStudy.routes");

app.use("/api/group-study", groupStudyRoutes);

// test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GFS backend running ✅"
  });
});

module.exports = app;