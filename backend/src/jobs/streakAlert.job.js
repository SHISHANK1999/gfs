cron.schedule("0 18 * * *", async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users = await User.find();

  for (let user of users) {
    if (!user.lastStudyAt || user.lastStudyAt < today) {
      await Notification.create({
        userId: user._id,
        message: "🔥 Study today to maintain your streak!",
        type: "STREAK"
      });
    }
  }
});