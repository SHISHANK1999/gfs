const app = require("./src/app");
const connectDB = require("./src/config/db");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const Group = require("./src/models/Group"); // 🔥 THIS WAS MISSING
const Message = require("./src/models/Message");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 5001;

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const onlineUsers = {}; // userId → socket.id
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Join Group Room
  socket.on("join-group", (groupId) => {
    socket.join(groupId);
    console.log("Joined group:", groupId);
  });

  // ✅ Send Message
   socket.on("send-message", async ({ groupId, message }) => {
    try {
      // ✅ Token from client
      const token = message?.token;
      if (!token) {
        return console.log("❌ Token missing in socket message");
      }

      // ✅ Decode token → get userId
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const senderId = decoded.userId;

      // ✅ Save message in DB
      const saved = await Message.create({
        groupId,
        senderId,
        senderName: message.senderName || "User",
        text: message.text || "",
        fileUrl: message.fileUrl || null,
        fileName: message.fileName || null
      });

      // ✅ Emit back to group
      io.to(groupId).emit("receive-message", {
        groupId,
        message: {
          id: saved._id.toString(),
          sender: message.senderName || "User",
          text: saved.text,
          time: new Date(saved.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }),
          fileUrl: saved.fileUrl,
          fileName: saved.fileName
        }
      });
      // ✅ 3) Notify others
   socket.broadcast.emit("notify", {
  type: "NEW_MESSAGE",
  groupId,
  text: saved.text?.trim() ? `💬 New message: ${saved.text}` : "📎 New file received"
});

    } catch (err) {
      console.log("Send message error:", err.message);
    }
  });

  // ✅ Delete Message
  socket.on("delete-message", ({ groupId, messageId }) => {
  io.to(groupId).emit("message-deleted", { groupId, messageId });
});
//   socket.on("send-message", async ({ groupId, message }) => {
//   try {
//     // ✅ 1) Save into MongoDB
//     const saved = await Message.create({
//       groupId,
//       senderId: message.senderId, // frontend must send this
//       senderName: message.senderName || "User",
//       text: message.text || "",
//       fileUrl: message.fileUrl || null,
//       fileName: message.fileName || null
//     });

//     // ✅ 2) Broadcast inside group
//     io.to(groupId).emit("receive-message", {
//       groupId,
//       message: {
//         id: saved._id.toString(),
//         sender: message.senderName || "User",
//         text: saved.text,
//         time: new Date(saved.createdAt).toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit"
//         }),
//         fileUrl: saved.fileUrl,
//         fileName: saved.fileName
//       }
//     });

//     // ✅ 3) Notify others
//     socket.broadcast.emit("notify", {
//       groupId,
//       text: savedMessage.text || "📎 New file received"
//     });
//   } catch (err) {
//     console.log("Send message error:", err.message);
//   }
// });

 

 
// ✅ Focus Session Notification (FIXED ✅)
  socket.on("start-focus", ({ groupId, user, duration, subject }) => {
    console.log("🔥 FOCUS START:", groupId, user, duration, subject);

    // 1) Send focus-started to that group
    io.to(groupId).emit("focus-started", {
      groupId,
      user,
      duration,
      subject,
      startedAt: new Date()
    });

    // 2) Notify others globally
    socket.broadcast.emit("notify", {
      type: "FOCUS_START",
      groupId,
      text: `🔥 ${user} started Focus (${subject}, ${duration} min)`
    });
  });
});

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   // When user logs in
//   socket.on("join-user", (userId) => {
//     onlineUsers[userId] = socket.id;
//     socket.userId = userId;
//     console.log("User joined:", userId);
//   });

//   // Join group room
//   socket.on("join-group", (groupId) => {
//     socket.join(groupId);
//     console.log("Joined group:", groupId);
//   });

//   // Handle messages
//   socket.on("send-message", async ({ groupId, message }) => {

//   // send message to group
//   io.to(groupId).emit("receive-message", {
//     groupId,
//     message
//   });

//   try {
//     const group = await Group.findById(groupId);

//     group.members.forEach((userId) => {

//       // ❌ sender को notify मत भेजो
//       if (userId === message.sender) return;

//       io.to(`user:${userId}`).emit("notify", {
//         type: "NEW_MESSAGE",
//         groupId,
//         text: message.text || "📎 File received"
//       });
//     });

//   } catch (err) {
//     console.log("Notify error:", err.message);
//   }
// });
//   // socket.on("send-message", ({ groupId, message }) => {

//   //   // 1️⃣ Send to active group
//   //   io.to(groupId).emit("receive-message", { groupId, message });

//   //   // 2️⃣ Notify all other online users
//   //   Object.keys(onlineUsers).forEach((userId) => {
//   //     const socketId = onlineUsers[userId];

//   //     io.to(socketId).emit("notify", {
//   //       text: `${message.sender} sent a message in Group ${groupId}`
//   //     });
//   //   });
//   // });

//   // Focus session
//   socket.on("start-focus", ({ groupId, user, duration, subject }) => {
//     io.to(groupId).emit("focus-started", {
//       user,
//       duration,
//       subject
//     });
//   });

//   socket.on("disconnect", () => {
//     if (socket.userId) {
//       delete onlineUsers[socket.userId];
//       console.log("User disconnected:", socket.userId);
//     }
//   });
// });

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});