const path = require("path");
// Try loading from current directory (standard for many environments)
require("dotenv").config();
// Fallback to searching three levels up (local development structure)
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require('./config');
const Message = require("../models/messageModel");

// Initialize Express app + HTTP server
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "https://medicoz-iota.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Socket.io setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});


console.log(`--- Medicoz Backend Start ---`);
console.log(`Node Version: ${process.version}`);
console.log(`MONGO_URI Found: ${process.env.MONGO_URI ? 'YES' : 'NO'}`);
console.log(`JWT_SECRET Found: ${process.env.JWT_SECRET ? 'YES' : 'NO'}`);
console.log(`HF Key Found: ${process.env.HUGGINGFACE_API_KEY ? 'YES' : 'NO'}`);
console.log(`PINECONE Key Found: ${process.env.PINECONE_API_KEY ? 'YES' : 'NO'}`);
console.log(`-----------------------------`);

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ── Socket.io real-time chat ──────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Patient or doctor joins their chat room
  socket.on("join_room", ({ roomId, name, role }) => {
    socket.join(roomId);
    console.log(`💬 ${role} "${name}" joined room: ${roomId}`);
  });

  // Someone sends a message
  socket.on("send_message", async (data) => {
    const { roomId, senderId, senderType, senderName, doctorId, userId, text } = data;
    try {
      const msg = new Message({ roomId, senderId, senderType, senderName, doctorId, userId, text });
      await msg.save();
      // Broadcast to everyone in the room (including sender)
      io.to(roomId).emit("receive_message", {
        _id: msg._id,
        senderId,
        senderType,
        senderName,
        text,
        timestamp: msg.timestamp,
      });
    } catch (err) {
      console.error("Socket message save error:", err.message);
    }
  });

  // Typing indicator
  socket.on("typing", ({ roomId, senderName, senderType }) => {
    socket.to(roomId).emit("user_typing", { senderName, senderType });
  });

  socket.on("stop_typing", ({ roomId }) => {
    socket.to(roomId).emit("user_stop_typing");
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── REST: Fetch message history for a room ────────────────────────────────────
app.get("/messages/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ timestamp: 1 })
      .limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch messages" });
  }
});

// ── REST: List all patient rooms for a doctor ─────────────────────────────────
app.get("/messages/rooms/:doctorId", async (req, res) => {
  try {
    const rooms = await Message.aggregate([
      { $match: { doctorId: req.params.doctorId } },
      { $sort: { timestamp: -1 } },
      { $group: {
        _id: "$roomId",
        roomId: { $first: "$roomId" },
        patientName: { $first: { $cond: [{ $eq: ["$senderType", "patient"] }, "$senderName", null] } },
        lastMessage: { $first: "$text" },
        lastTime: { $first: "$timestamp" },
      }},
      { $sort: { lastTime: -1 } },
    ]);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch rooms" });
  }
});

// Start HTTP server (with Socket.io attached)
const PORT = process.env.PORT || 7000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));

// Connect to MongoDB asynchronously
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use('/', require('./auth'));
app.use('/chat', require('./chat'));
app.use('/admin', require('./admin'));
app.use('/appointments', require('./appointments'));



// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const cors = require("cors");
// const ChatSession = require('./models/chatSessionModel');

// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());


// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     const PORT = process.env.PORT || 7000;
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => console.error("MongoDB connection error:", err));

// // User Model
// const UserSchema = new mongoose.Schema({
//   firstName: String,
//   lastName: String,
//   email: { type: String, unique: true },
//   password: String,
// });

// const User = mongoose.model("User", UserSchema);

// // Register User (Signup)
// app.post("/register", async (req, res) => {
//   const { firstName, lastName, email, password } = req.body;

//   console.log(req.body);

//   if (!email || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return res.status(400).json({ message: "User already exists" });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const newUser = new User({
//     firstName,
//     lastName,
//     email,
//     password: hashedPassword,
//   });
//   await newUser.save();

//   res.status(201).json({ message: "User registered successfully!" });
// });

// // Login User (Sign-in)
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });

//   console.log(req.body);

//   console.log(user);

//   if (!user) {
//     return res.status(401).json({ message: "Email not found" });
//   }

//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ message: "Password incorrect" });
//   }

//   // Generate JWT token
//   const token = jwt.sign(
//     { userId: user._id, email: user.email },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: "1h",
//     }
//   );

//   res.json({ message: "Login successful", token });
// });

// // Protected Route Example
// app.get("/profile", verifyToken, async (req, res) => {
//   const user = await User.findById(req.user.userId).select("-password");
//   res.json({ message: "Welcome to your profile!", user });
// });

// // Middleware to Verify Token
// function verifyToken(req, res, next) {
//   const token = req.headers["authorization"];
//   if (!token) return res.status(403).json({ message: "Token required" });

//   jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: "Invalid token" });
//     req.user = user;
//     next();
//   });
// }


// //Add or create a new message
// app.post("/chat/:sessionId", verifyToken, async (req, res) => {
//   const { role, content } = req.body;
//   const { sessionId } = req.params;

//   if (!role || !sessionId) {
//     return res.status(404).json({ error: "Role and sessions are required" });
//   }

//   try {
//     let session;

//     if (sessionId === "new") {
//       session = new ChatSession({
//         userId: req.user.userId,
//         title: content.slice(0, 20),
//         messages: [{ role, content }],
//       });
//     } else {
//       session = await ChatSession.findById(sessionId);

//       if (!session) {
//         return res.status(404).json({ error: "Session not found" });
//       }

//       session.messages.push({ role, content });
//       session.updatedAt = new Date();
//     }

//     await session.save();

//     res.status(200).json(session);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to save message" });
//   }
// });

// // Retrieve User chat
// app.get("/chat/user/all", verifyToken, async (req, res) => {
//   try {

//     const sessions = await ChatSession.find({ userId: req.user.userId })
//       .select("_id title updatedAt")
//       .sort({ updatedAt: -1 });

//     return res.json(sessions);
//   } catch (err) {
//     console.log(err);

//     res.status(500).json({ error: "Could not fetch chat sessions" });
//   }
// });

// // Get chat history of a session
// app.get("/chat/:sessionId", verifyToken, async (req, res) => {
//   try {
//     const session = await ChatSession.findById(req.params.sessionId);

//     if (!session) {
//       return res.status(404).json({ error: "Session not found" });
//     }

//     res.json(session.messages);
//   } catch (err) {
//     res.status(500).json({ error: "Could not fetch messages" });
//   }
// });
