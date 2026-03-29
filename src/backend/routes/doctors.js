const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// GET all doctors (Public)
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch doctors" });
  }
});

// GET single doctor (Public)
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch doctor" });
  }
});

// ADD doctor (Admin)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  const { name, specialty, whatsapp, experience, bio, image, availableDays } = req.body;
  
  if (!name || !specialty || !whatsapp) {
    return res.status(400).json({ message: "Name, specialty, and whatsapp are required" });
  }

  try {
    const newDoctor = new Doctor({
      name,
      specialty,
      whatsapp,
      experience,
      bio,
      image,
      availableDays: availableDays || [],
    });
    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (err) {
    res.status(500).json({ message: "Could not add doctor: " + err.message });
  }
});

// EDIT doctor (Admin)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedDoctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(updatedDoctor);
  } catch (err) {
    res.status(500).json({ message: "Could not update doctor" });
  }
});

// DELETE doctor (Admin)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete doctor" });
  }
});

module.exports = router;
