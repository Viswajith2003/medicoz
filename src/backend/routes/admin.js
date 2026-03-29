const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { processAndIngest } = require("../services/ingestService");
const UploadedFile = require("../models/uploadedFileModel");

// In-memory Multer storage (process immediately, no disk write)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Admin Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ message: "Admin Login successful", token, isAdmin: true });
    }
    return res.status(401).json({ message: "Invalid Admin Credentials" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Upload & Ingest PDF
router.post("/upload-medical-data", verifyToken, verifyAdmin, upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No PDF file uploaded" });
  }

  try {
    const { buffer, originalname, size } = req.file;

    // Run ingestion — returns total chunk count
    const chunkCount = await processAndIngest(buffer, originalname);

    // Save upload record to MongoDB
    await UploadedFile.create({
      filename: originalname,
      sizeBytes: size,
      chunkCount,
    });

    res.json({
      message: `Successfully uploaded and ingested "${originalname}" — ${chunkCount} chunks stored in Pinecone.`
    });
  } catch (error) {
    console.error("Error during admin upload:", error);
    res.status(500).json({ message: "Failed to process the PDF: " + error.message });
  }
});

// List all uploaded files
router.get("/files", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const files = await UploadedFile.find().sort({ uploadedAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch uploaded files" });
  }
});

// Delete an uploaded file record
router.delete("/files/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await UploadedFile.findByIdAndDelete(req.params.id);
    res.json({ message: "File record deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete file record" });
  }
});

module.exports = router;
