const mongoose = require('mongoose');

const UploadedFileSchema = new mongoose.Schema({
  filename:   { type: String, required: true },
  sizeBytes:  { type: Number, required: true },
  chunkCount: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UploadedFile', UploadedFileSchema);
