const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  whatsapp: { type: String, required: true },
  experience: { type: String },
  bio: { type: String },
  image: { type: String }, // Base64 or URL
  availableDays: [{ type: String }], // e.g., ["Monday", "Wednesday"]
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Doctor", doctorSchema);
