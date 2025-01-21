const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

// Configure CORS for Express server
app.use(
  cors({
    origin: "https://aditya-chat-frontend.vercel.app", // Your deployed frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS for preflight
    credentials: true, // Allow credentials (e.g., cookies, headers)
  })
);

// Handle preflight requests
app.options("*", cors()); // Allow preflight for all routes

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

// Test endpoint
app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Start the server
const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

// Configure CORS for Socket.IO
const io = socket(server, {
  cors: {
    origin: "https://aditya-chat-frontend.vercel.app", // Your deployed frontend URL
    methods: ["GET", "POST"], // Allowed methods
    credentials: true, // Allow credentials
  },
});

// Global variable for online users
global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  // Add user to online users
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  // Send message to a specific user
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
