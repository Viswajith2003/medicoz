const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId:      { type: String, required: true, index: true }, // `${userId}_${doctorId}`
  senderId:    { type: String, required: true },              // userId or doctorId string
  senderType:  { type: String, enum: ["patient", "doctor"], required: true },
  senderName:  { type: String, required: true },
  doctorId:    { type: String, required: true },
  userId:      { type: String, required: true },
  text:        { type: String, required: true },
  timestamp:   { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
