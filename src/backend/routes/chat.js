const express = require("express");
const router = express.Router();
const ChatSession = require("../models/chatSessionModel");
const { verifyToken } = require("../middleware/auth");

// Add or create a new message
router.post("/:sessionId", verifyToken, async (req, res) => {
  const { role, content } = req.body;
  const { sessionId } = req.params;

  if (!role || !sessionId) {
    return res.status(404).json({ error: "Role and sessions are required" });
  }

  try {
    let session;

    if (sessionId === "new") {
      session = new ChatSession({
        userId: req.user.userId,
        title: content.slice(0, 20),
        messages: [{ role, content }],
      });
    } else {
      session = await ChatSession.findById(sessionId);

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      session.messages.push({ role, content });
      session.updatedAt = new Date();
    }

    await session.save();

    res.status(200).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save message" });
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
