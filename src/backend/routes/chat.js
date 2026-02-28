const express = require("express");
const router = express.Router();
const ChatSession = require("../models/chatSessionModel");
const { verifyToken } = require("../middleware/auth");
const { getRelevantContext, generateMedicalResponse } = require("../services/ragService");

// Add or create a new message and generate AI response
router.post("/:sessionId", verifyToken, async (req, res) => {
  const { role, content } = req.body;
  const { sessionId } = req.params;

  if (!role || !content || !sessionId) {
    return res.status(400).json({ error: "Role, content and sessions are required" });
  }

  try {
    let session;

    // 1. Handle/Create User Message
    if (sessionId === "new") {
      session = new ChatSession({
        userId: req.user.userId,
        title: content.slice(0, 20),
        messages: [{ role: "user", content }],
      });
    } else {
      session = await ChatSession.findById(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });
      
      session.messages.push({ role: "user", content });
    }

    // 2. Perform RAG (Medical Knowledge Retrieval & LLM Generation)
    const context = await getRelevantContext(content);
    const aiResponse = await generateMedicalResponse(content, context);

    // 3. Save Assistant Response
    session.messages.push({ role: "assistant", content: aiResponse });
    session.updatedAt = new Date();
    
    await session.save();

    res.status(200).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

// Retrieve User chat
router.get("/user/all", verifyToken, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user.userId })
      .select("_id title updatedAt")
      .sort({ updatedAt: -1 });
    console.log(sessions);

    return res.json(sessions);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Could not fetch chat sessions" });
  }
});

// Get chat history of a session
router.get("/:sessionId", verifyToken, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session.messages);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch messages" });
  }
});

// Delete a chat session
router.delete("/:sessionId", verifyToken, async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndDelete(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ message: "Session deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

module.exports = router;





// Integrated RAG into chat.js

// Your /chat/:sessionId API call now does three things automatically:
// Saves your message to MongoDB.
// Retrieves verified context from Pinecone.
// Generates and saves the medical AI response.