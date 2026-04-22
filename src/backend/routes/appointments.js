const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointmentModel");
const { verifyToken } = require("../middleware/auth");
const { sendDoctorWhatsAppNotification, sendDoctorScheduledNotification } = require("../services/whatsappService");
const User = require("../models/user");

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
    // Check daily appointment limit
    const dailyAppointments = await Appointment.countDocuments({
      doctorId,
      date,
      status: { $ne: "cancelled" }
    });

    if (dailyAppointments >= 3) {
      return res.status(400).json({ error: "Doctor has reached the maximum of 3 appointments for this day." });
    }

    // Generate a unique Jitsi room ID
    const roomId = `medicoz-${doctorId}-${Date.now()}`;
    const roomUrl = `https://meet.jit.si/${roomId}#config.prejoinPageEnabled=false&config.prejoinConfig.enabled=false&config.lobby.enabled=false&config.p2p.enabled=true`;

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
    const baseUrl = process.env.PUBLIC_URL
      ? `${process.env.PUBLIC_URL}/appointments`
      : `${req.protocol}://${req.get("host")}/appointments`;
      
    const confirmUrl = `${baseUrl}/${appointment._id}/confirm`;
    const cancelUrl = `${baseUrl}/${appointment._id}/cancel`;

    sendDoctorWhatsAppNotification({
      appointmentId: appointment._id,
      doctorName,
      doctorWhatsapp,
      patientName: patientName || "Patient",
      date,
      timeSlot,
      roomUrl,
      confirmUrl,
      cancelUrl,
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

// ──────────────────────────────────────────
// GET /appointments/:id/confirm — confirm by doctor
// ──────────────────────────────────────────
router.get("/:id/confirm", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).send("Appointment not found");

    if (appointment.status === "confirmed") {
      return res.send("<h1>Appointment Confirmed Successfully</h1><p>It was already confirmed.</p>");
    }

    appointment.status = "confirmed";
    await appointment.save();

    // Fetch user for patient name
    const user = await User.findById(appointment.userId);
    const patientName = user ? `${user.firstName} ${user.lastName}` : "Patient";

    // Send the final scheduled message
    sendDoctorScheduledNotification({
      doctorName: appointment.doctorName,
      doctorWhatsapp: appointment.doctorWhatsapp,
      patientName,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      roomUrl: appointment.roomId ? `https://meet.jit.si/${appointment.roomId}#config.prejoinPageEnabled=false&config.prejoinConfig.enabled=false&config.lobby.enabled=false&config.p2p.enabled=true` : "",
    }).catch(err => console.error(err));

    res.send("<h1>Appointment Confirmed Successfully</h1><p>You can close this tab. The join link has been sent to your WhatsApp.</p>");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error confirming appointment");
  }
});

// ──────────────────────────────────────────
// GET /appointments/:id/cancel — cancel by doctor
// ──────────────────────────────────────────
router.get("/:id/cancel", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).send("Appointment not found");

    appointment.status = "cancelled";
    await appointment.save();

    res.send("<h1>Appointment Cancelled Successfully</h1><p>You can close this tab.</p>");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error cancelling appointment");
  }
});

module.exports = router;
