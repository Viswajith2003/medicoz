require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const config = require('./config');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 7000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use('/', require('./auth'));
app.use('/chat', require('./chat'));
app.use('/admin', require('./admin'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../app/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../app/build', 'index.html'));
  });
}


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
