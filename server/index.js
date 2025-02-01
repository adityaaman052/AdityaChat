const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");
require("dotenv").config();

const app = express();

// Load environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

if (!MONGO_URL) {
  console.error("❌ Error: MONGO_URL is missing in .env file.");
  process.exit(1);
}

// Allowed origins for CORS (local + deployed frontend)
const allowedOrigins = [
  CLIENT_URL,
  "https://localhost:3000"
];

// Configure CORS for API requests
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`🚫 Blocked CORS request from: ${origin}`); // Debugging
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies and credentials
  })
);

app.options("*", cors()); // Handle preflight requests

// Middleware
app.use(express.json());

// Connect to MongoDB
console.log("🔄 Connecting to MongoDB...");
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Test API routes
app.get("/ping", (_req, res) => res.json({ msg: "Ping Successful" }));
app.get("/", (req, res) => res.send("🚀 Welcome to Aditya Chat API!"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Start server
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// Configure Socket.IO with CORS handling
const io = socket(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`🚫 Blocked WebSocket connection from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Global map to track online users
global.onlineUsers = new Map();

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);

  // Store user in online users map
  socket.on("add-user", (userId) => {
    console.log(`✅ User added: ${userId}`);
    global.onlineUsers.set(userId, socket.id);
  });

  // Handle sending messages
  socket.on("send-msg", (data) => {
    console.log(`📩 Message from ${data.from} to ${data.to}: ${data.msg}`);
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    } else {
      console.log(`⚠️ User ${data.to} is not online.`);
    }
  });

  // Handle user disconnection
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
