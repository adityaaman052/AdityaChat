const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

if (!MONGO_URL) {
  console.error("❌ Error: MONGO_URL is missing in .env file.");
  process.exit(1);
}

const allowedOrigins = [CLIENT_URL, "https://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin (e.g., Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`🚫 Blocked CORS request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors()); // Handle preflight requests for all routes
app.use(express.json());

console.log("🔄 Connecting to MongoDB...");
mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

app.get("/ping", (_req, res) => res.json({ msg: "Ping Successful" }));
app.get("/", (req, res) => res.send("🚀 Welcome to Aditya Chat API!"));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const io = socket(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`🚫 Blocked WebSocket connection from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);

  socket.on("add-user", (userId) => {
    console.log(`✅ User added: ${userId}`);
    global.onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    console.log(`📩 Message from ${data.from} to ${data.to}: ${data.msg}`);
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    } else {
      console.log(`⚠️ User ${data.to} is not online.`);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    global.onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        console.log(`🚫 Removing user: ${userId}`);
        global.onlineUsers.delete(userId);
      }
    });
  });
});
