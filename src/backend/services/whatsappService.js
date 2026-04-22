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
async function sendDoctorWhatsAppNotification({ appointmentId, doctorName, doctorWhatsapp, patientName, date, timeSlot, roomUrl, confirmUrl, cancelUrl }) {
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
    
    // Normalize number: ensure it has + and check for possible missing country code
    let cleanNumber = doctorWhatsapp.replace(/\s+/g, '');
    if (!cleanNumber.startsWith("+")) {
       console.warn(`⚠️  Doctor number ${cleanNumber} missing country code prefix (+). Assuming local or needs fix.`);
       cleanNumber = `+${cleanNumber}`;
    }

    const toFormatted = `whatsapp:${cleanNumber}`;

    console.log(`📡 Attempting to send WhatsApp message...`);
    console.log(`   To: ${toFormatted}`);
    console.log(`   From: ${fromNumber}`);

    const message = await client.messages.create({
      from: fromNumber,
      to: toFormatted,
      body:
        `🩺 *New Appointment Request - Medicoz*\n\n` +
        `Hello Dr. ${doctorName},\n\n` +
        `You have a new consultation request. Please confirm or cancel this request.\n\n` +
        `👤 *Patient:* ${patientName}\n` +
        `📅 *Date:* ${date}\n` +
        `⏰ *Time:* ${timeSlot}\n\n` +
        `✅ *To Confirm:* Click here:\n${confirmUrl}\n\n` +
        `❌ *To Cancel:* Click here:\n${cancelUrl}\n\n` +
        `Once confirmed, you will receive the join link.`,
    });

    console.log(`✅ WhatsApp notification sent successfully. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("❌ Twilio Error:", error.message);
    let advice = "Check your Twilio credentials in .env";
    
    if (error.code === 21608) {
      advice = "The doctor's number MUST opt-in to your Sandbox. Tell them to send 'join <sandbox-keyword>' to " + fromNumber.replace('whatsapp:', '');
    } else if (error.code === 21211) {
      advice = "The doctor's number seems invalid. Make sure it includes the country code (e.g., +91).";
    } else if (error.status === 401) {
      advice = "Invalid Twilio Account SID or Auth Token. Double check your Twilio Console.";
    }
    
    console.error(`💡 ADVICE: ${advice}`);
    return { success: false, reason: error.message, advice };
  }
}

async function sendDoctorScheduledNotification({ doctorName, doctorWhatsapp, patientName, date, timeSlot, roomUrl }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  if (!twilio || !accountSid || !authToken || !doctorWhatsapp) return;

  try {
    const client = twilio(accountSid, authToken);
    let cleanNumber = doctorWhatsapp.replace(/\s+/g, '');
    if (!cleanNumber.startsWith("+")) cleanNumber = `+${cleanNumber}`;
    const toFormatted = `whatsapp:${cleanNumber}`;

    await client.messages.create({
      from: fromNumber,
      to: toFormatted,
      body:
        `✅ *Appointment Confirmed - Medicoz*\n\n` +
        `Hello Dr. ${doctorName},\n\n` +
        `Your consultation has been successfully scheduled.\n\n` +
        `👤 *Patient:* ${patientName}\n` +
        `📅 *Date:* ${date}\n` +
        `⏰ *Time:* ${timeSlot}\n\n` +
        `🎥 *Join Video Call at the scheduled time:* \n${roomUrl}\n\n` +
        `Thank you!`
    });
  } catch (err) {
    console.error("Scheduled notification error:", err.message);
  }
}

module.exports = { sendDoctorWhatsAppNotification, sendDoctorScheduledNotification };
