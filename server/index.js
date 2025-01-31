const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");
require("dotenv").config();

const app = express();

// Log to check if environment variables are loaded
console.log("Environment Variables:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URL:", process.env.MONGO_URL);

// Fail-safe for missing MONGO_URL
if (!process.env.MONGO_URL) {
  console.error("Error: MONGO_URL is not defined in environment variables.");
  process.exit(1); // Exit the process if MONGO_URL is missing
}

// Configure CORS for Express server
app.use(
  cors({
    origin: "https://aditya-chat-frontend.vercel.app", // Your deployed frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies and credentials
  })
);

app.options("*", cors()); // Handle preflight requests

app.use(express.json()); // Middleware to parse JSON requests

// MongoDB connection
console.log("Attempting to connect to MongoDB...");
mongoose
  .connect("mongodb+srv://newproject:Anurag01126@cluster0.a9bgj.mongodb.net/chatadi?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => {
    console.error("Database Connection Error:", err.message);
    process.exit(1); // Exit the process if DB connection fails
  });

// Test endpoint
app.get("/ping", (_req, res) => res.json({ msg: "Ping Successful" }));
app.get("/", (req, res) => {
  res.send("Welcome to Aditya Chat API!");
});


// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Start the server
const PORT = process.env.PORT || 5000; // Fallback to 5000 if PORT is not defined
const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

// Configure Socket.IO
const io = socket(server, {
  cors: {
    origin: "https://aditya-chat-frontend.vercel.app", // Your deployed frontend URL
    methods: ["GET", "POST"], // Allowed methods
    credentials: true, // Allow cookies and credentials
  },
});

// Global variable for online users
global.onlineUsers = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New socket connection established");

  // Add user to online users map
  socket.on("add-user", (userId) => {
    console.log(`User added: ${userId}`);
    global.onlineUsers.set(userId, socket.id);
  });

  // Handle message sending to specific users
  socket.on("send-msg", (data) => {
    console.log(`Message from ${data.from} to ${data.to}: ${data.msg}`);
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    } else {
      console.log(`User ${data.to} is not online.`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Socket disconnected");
    // Optional: remove user from online users map
    global.onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        console.log(`User disconnected: ${userId}`);
        global.onlineUsers.delete(userId);
      }
    });
  });
});
