const twilio = (() => {
  try { return require("twilio"); }
  catch { return null; }
})();

/**
 * Sends a WhatsApp message to the doctor when an appointment is booked.
 * Requires Twilio sandbox or approved WhatsApp Business number.
 *
 * .env vars needed:
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
 *   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
 *   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   (Twilio sandbox number)
 */
async function sendDoctorWhatsAppNotification({ doctorName, doctorWhatsapp, patientName, date, timeSlot, roomUrl }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  if (!twilio) {
    console.warn("⚠️  Twilio package not installed. Run: npm install twilio");
    return { success: false, reason: "Twilio package not installed" };
  }

  if (!accountSid || !authToken) {
    console.warn("⚠️  Twilio credentials not set. Skipping WhatsApp notification.");
    return { success: false, reason: "Twilio credentials missing" };
  }

  if (!doctorWhatsapp) {
    console.warn("⚠️  Doctor WhatsApp number not set. Skipping notification.");
    return { success: false, reason: "Doctor WhatsApp number missing" };
  }

  try {
    const client = twilio(accountSid, authToken);
    const toFormatted = doctorWhatsapp.startsWith("+") ? `whatsapp:${doctorWhatsapp}` : `whatsapp:+${doctorWhatsapp}`;

    console.log(`📡 Sending WhatsApp to: ${toFormatted} (From: ${fromNumber})`);

    const message = await client.messages.create({
      from: fromNumber,
      to: toFormatted,
      body:
        `🩺 *New Appointment Booked - Medicoz*\n\n` +
        `Hello Dr. ${doctorName},\n\n` +
        `A new consultation has been scheduled.\n\n` +
        `👤 *Patient:* ${patientName}\n` +
        `📅 *Date:* ${date}\n` +
        `⏰ *Time:* ${timeSlot}\n` +
        `🎥 *Join Video Call:* ${roomUrl}\n\n` +
        `Please be available at the scheduled time. Thank you!`,
    });

    console.log(`✅ WhatsApp notification sent to Dr. ${doctorName}:`, message.sid);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("❌ Failed to send WhatsApp notification:", error.message);
    if (error.code === 21608) {
      console.error("💡 TIP: The doctor's number is not opted-in to your Twilio sandbox.");
    }
    return { success: false, reason: error.message };
  }
}

module.exports = { sendDoctorWhatsAppNotification };
