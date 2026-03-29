const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function checkDoctors() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    const doctors = await mongoose.connection.db.collection("doctors").find({}).toArray();
    console.log(JSON.stringify(doctors, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkDoctors();