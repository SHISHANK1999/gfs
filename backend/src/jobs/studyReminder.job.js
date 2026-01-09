const cron = require("node-cron");
const User = require("../models/User");

// Every minute check
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  const users = await User.find({ isActive: true });

  users.forEach((user) => {
    const [h, m] = user.preferredStudyTime.split(":");
    const studyTime = new Date();
    studyTime.setHours(h, m, 0, 0);

    const reminderTime = new Date(
      studyTime.getTime() - user.reminderBeforeMinutes * 60000
    );

    if (
      now.getHours() === reminderTime.getHours() &&
      now.getMinutes() === reminderTime.getMinutes()
    ) {
      console.log(
        `🔔 Reminder: Study time in ${user.reminderBeforeMinutes} minutes for ${user.name}`
      );

      // 👉 future: push / email / whatsapp
    }
  });
});