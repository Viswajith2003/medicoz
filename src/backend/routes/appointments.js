const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointmentModel");
const { verifyToken } = require("../middleware/auth");
const { sendDoctorWhatsAppNotification } = require("../services/whatsappService");

// ──────────────────────────────────────────
// GET /appointments  — list user's appointments
// ──────────────────────────────────────────
router.get("/", verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Could not fetch appointments" });
  }
});

// ──────────────────────────────────────────
// POST /appointments/book  — book new appointment
// ──────────────────────────────────────────
router.post("/book", verifyToken, async (req, res) => {
  const {
    doctorId,
    doctorName,
    doctorSpecialty,
    doctorWhatsapp,
    date,
    timeSlot,
    notes,
    patientName,
  } = req.body;

  if (!doctorId || !doctorName || !date || !timeSlot) {
    return res.status(400).json({ error: "Doctor, date and time slot are required" });
  }

  try {
    // Generate a unique Jitsi room ID
    const roomId = `medicoz-${doctorId}-${Date.now()}`;
    const roomUrl = `https://meet.jit.si/${roomId}`;

    const appointment = new Appointment({
      userId: req.user.userId,
      doctorId,
      doctorName,
      doctorSpecialty,
      doctorWhatsapp,
      date,
      timeSlot,
      notes,
      roomId,
    });

    await appointment.save();

    // Send WhatsApp notification to doctor (non-blocking)
    sendDoctorWhatsAppNotification({
      doctorName,
      doctorWhatsapp,
      patientName: patientName || "Patient",
      date,
      timeSlot,
      roomUrl,
    }).catch((err) => console.error("WhatsApp notification error:", err));

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment,
      roomUrl,
    });
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// ──────────────────────────────────────────
// DELETE /appointments/:id  — cancel appointment
// ──────────────────────────────────────────
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

module.exports = router;
