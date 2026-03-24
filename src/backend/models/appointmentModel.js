const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorSpecialty: { type: String },
  doctorWhatsapp: { type: String },
  date: { type: String, required: true },   // "2026-03-25"
  timeSlot: { type: String, required: true }, // "10:00 AM"
  notes: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "confirmed",
  },
  roomId: { type: String }, // Jitsi room ID
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
