const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { verifyToken } = require("../middleware/auth");
const { processAndIngest } = require("../services/ingestService");

// In-memory Multer storage (since we process immediately)
const upload = multer({ storage: multer.memoryStorage() });

// Admin Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      // Generate admin token
      const token = jwt.sign(
        { email, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: "5h" }
      );
      return res.json({ message: "Admin Login successful", token, isAdmin: true });
    } else {
      return res.status(401).json({ message: "Invalid Admin Credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Middleware to strictly verify admin status.
 */
function verifyAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: "Admin access denied" });
    }
}

// Admin Upload Route
router.post("/upload-medical-data", verifyToken, verifyAdmin, upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No PDF file uploaded" });
  }

  try {
    const { buffer, originalname } = req.file;

    // Trigger ingestion process
    // This is an async process, so we run it in background and notify success
    // For now, let's wait to ensure user gets feedback
    await processAndIngest(buffer, originalname);

    res.json({ message: `Successfully uploaded and ingested ${originalname} to Pinecone!` });
  } catch (error) {
    console.error("Error during admin upload:", error);
    res.status(500).json({ message: "Failed to process the PDF: " + error.message });
  }
});

module.exports = router;
