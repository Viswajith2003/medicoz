const express = require("express");
const router = express.Router();
const ChatSession = require("../models/chatSessionModel");
const { verifyToken } = require("../middleware/auth");
const { getRelevantContext, generateMedicalResponse } = require("../services/ragService");

// ---- DIAGNOSTICS ENDPOINT (safe to remove later) ----
router.get("/test/ping", async (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

router.get("/test/rag", async (req, res) => {
  try {
    console.log("[TEST] Starting RAG test...");
    const context = await getRelevantContext("What is physical rehabilitation?");
    console.log("[TEST] Context retrieved:", context?.substring(0, 100));
    res.json({ status: "ok", contextLength: context?.length, preview: context?.substring(0, 200) });
  } catch (err) {
    console.error("[TEST] RAG error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});
// ---- END DIAGNOSTICS ----

// Add or create a new message and generate AI response
router.post("/:sessionId", verifyToken, async (req, res) => {
  const { role, content } = req.body;
  const { sessionId } = req.params;

  console.log(`[CHAT] POST /${sessionId} | content="${content?.substring(0,50)}"`);

  if (!content || !sessionId) {
    return res.status(400).json({ error: "Content and sessionId are required" });
  }

  try {
    let session;

    // 1. Handle/Create User Message
    if (sessionId === "new") {
      session = new ChatSession({
        userId: req.user.userId,
        title: content.slice(0, 30),
        messages: [{ role: "user", content }],
      });
    } else {
      session = await ChatSession.findById(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });
      session.messages.push({ role: "user", content });
    }

    // Save user message first so it's not lost even if RAG fails
    await session.save();
    console.log(`[CHAT] User message saved. Session ID: ${session._id}`);

    // 2. Perform RAG (Medical Knowledge Retrieval & LLM Generation)
    let aiResponse = "I'm sorry, I couldn't generate a response. Please try again.";
    try {
      console.log("[CHAT] Running RAG pipeline...");
      const context = await getRelevantContext(content);
      console.log(`[CHAT] Context retrieved: hasRelevantContent=${context?.hasRelevantContent}, chars=${context?.context?.length}`);
      aiResponse = await generateMedicalResponse(content, context);
      console.log(`[CHAT] AI response generated: ${aiResponse?.substring(0, 80)}...`);
    } catch (ragError) {
      console.error("[CHAT] RAG pipeline error:", ragError.message);
      aiResponse = "I'm having trouble accessing my medical knowledge base right now. Please try again in a moment.";
    }

    // 3. Save AI response
    session.messages.push({ role: "assistant", content: aiResponse });
    session.updatedAt = new Date();
    await session.save();

    console.log("[CHAT] Full session saved successfully.");
    res.status(200).json(session);
  } catch (err) {
    console.error("[CHAT] Route error:", err.message, err.stack?.split("\n")[1]);
    res.status(500).json({ error: "Failed to process chat: " + (err.message || "Unknown error") });
  }
});

// Retrieve User chat list
router.get("/user/all", verifyToken, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user.userId })
      .select("_id title updatedAt")
      .sort({ updatedAt: -1 });
    return res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch chat sessions" });
  }
});

// Get chat history of a session
router.get("/:sessionId", verifyToken, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session.messages);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch messages" });
  }
});

// Delete a chat session
router.delete("/:sessionId", verifyToken, async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndDelete(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ message: "Session deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete session" });
  }
});

module.exports = router;