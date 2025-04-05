const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
    role: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },

    content: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ChatSessionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'New Chat'
    },
    messages: [MessageSchema],
    updatedAt: { 
        type: Date,
        default: Date.now 
    },

});

const ChatSession = mongoose.model('ChatSession', ChatSessionSchema)


module.exports = ChatSession;


// //const express = require('express');
// const router = express.Router();
// const ChatSession = require("../models/ChatSession");
// const auth = require("../middleware/auth");

// // Get all chat sessions for a user
// router.get("/user/all", auth, async (req, res) => {
//   try {
//     const chats = await ChatSession.find({ userId: req.user.id }).sort({
//       updatedAt: -1,
//     });
//     res.json(chats);
//   } catch (error) {
//     console.error("Error getting chat history:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Get a specific chat session by ID
// router.get("/:chatId", auth, async (req, res) => {
//   try {
//     const chat = await ChatSession.findOne({
//       _id: req.params.chatId,
//       userId: req.user.id,
//     });

//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     res.json(chat);
//   } catch (error) {
//     console.error("Error getting chat:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Create a new chat session
// router.post("/new", auth, async (req, res) => {
//   try {
//     const { role, content } = req.body;

//     // Generate a title based on first user message
//     let title = "New Chat";
//     if (role === "user" && content) {
//       // Create title from first ~30 chars of message
//       title = content.substring(0, 30) + (content.length > 30 ? "..." : "");
//     }

//     const newChat = new ChatSession({
//       userId: req.user.id,
//       title,
//       messages: [{ role, content }],
//     });

//     await newChat.save();
//     res.json(newChat);
//   } catch (error) {
//     console.error("Error creating chat:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Add message to existing chat session
// router.post("/:chatId", auth, async (req, res) => {
//   try {
//     const { role, content } = req.body;

//     const chat = await ChatSession.findOne({
//       _id: req.params.chatId,
//       userId: req.user.id,
//     });

//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     // Add new message
//     chat.messages.push({ role, content });

//     // Update the timestamp
//     chat.updatedAt = new Date();

//     await chat.save();
//     res.json(chat);
//   } catch (error) {
//     console.error("Error adding message:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Update chat title
// router.put("/:chatId/title", auth, async (req, res) => {
//   try {
//     const { title } = req.body;

//     const chat = await ChatSession.findOneAndUpdate(
//       { _id: req.params.chatId, userId: req.user.id },
//       { title },
//       { new: true }
//     );

//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     res.json(chat);
//   } catch (error) {
//     console.error("Error updating chat title:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Delete a chat session
// router.delete("/:chatId", auth, async (req, res) => {
//   try {
//     const chat = await ChatSession.findOneAndDelete({
//       _id: req.params.chatId,
//       userId: req.user.id,
//     });

//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     res.json({ message: "Chat deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting chat:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

